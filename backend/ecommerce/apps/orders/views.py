import uuid
import datetime
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.response import api_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsAdminOrSuperAdmin
from apps.cart.views import get_or_create_user_cart
from apps.products.models import Product, ProductVariant
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer, CheckoutSerializer

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Checkout validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        address_obj = serializer.validated_data['address_id']
        payment_method = serializer.validated_data['payment_method']
        notes = serializer.validated_data.get('notes', '')

        cart = get_or_create_user_cart(request)
        cart_items = cart.items.select_related('product', 'variant').all()

        if not cart_items.exists():
            return api_response(
                success=False,
                message="Your cart is empty. Cannot proceed with checkout.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Atomic Transaction & Stock Safety Lock
        try:
            with transaction.atomic():
                subtotal = 0
                order_items_to_create = []

                for item in cart_items:
                    # Lock row with select_for_update
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    variant = None
                    if item.variant:
                        variant = ProductVariant.objects.select_for_update().get(id=item.variant.id)

                    available_stock = variant.stock if variant else product.stock
                    if available_stock < item.quantity:
                        raise ValueError(f"Product '{product.name}' has insufficient stock ({available_stock} available).")

                    # Deduct stock atomically
                    if variant:
                        variant.stock -= item.quantity
                        variant.save(update_fields=['stock'])
                    product.stock -= item.quantity
                    product.save(update_fields=['stock'])

                    # Unit price snapshot
                    unit_price = item.unit_price
                    item_total = unit_price * item.quantity
                    subtotal += item_total

                    order_items_to_create.append({
                        'product': product,
                        'variant': variant,
                        'product_name': f"{product.name} ({variant.name})" if variant else product.name,
                        'product_sku': variant.sku if variant else product.sku,
                        'unit_price': unit_price,
                        'quantity': item.quantity,
                        'total_price': item_total
                    })

                shipping_fee = 0.00 if subtotal >= 100.00 else 10.00
                total_amount = subtotal + shipping_fee

                order_number = f"ORD-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

                order = Order.objects.create(
                    order_number=order_number,
                    user=request.user,
                    shipping_name=address_obj.full_name,
                    shipping_phone=address_obj.phone,
                    shipping_address_line_1=address_obj.address_line_1,
                    shipping_address_line_2=address_obj.address_line_2 or '',
                    shipping_city=address_obj.city,
                    shipping_state=address_obj.state,
                    shipping_postal_code=address_obj.postal_code,
                    shipping_country=address_obj.country,
                    subtotal=subtotal,
                    discount=0.00,
                    shipping_fee=shipping_fee,
                    total_amount=total_amount,
                    payment_status=Order.PaymentStatus.COD_PENDING,
                    payment_method=payment_method,
                    order_status=Order.OrderStatus.PENDING,
                    estimated_delivery_date=datetime.date.today() + datetime.timedelta(days=5),
                    notes=notes
                )

                for oi in order_items_to_create:
                    OrderItem.objects.create(
                        order=order,
                        **oi
                    )

                # Clear cart
                cart.items.all().delete()

                return api_response(
                    success=True,
                    message="Order placed successfully with Cash on Delivery.",
                    data=OrderSerializer(order).data,
                    status_code=status.HTTP_201_CREATED
                )
        except ValueError as ve:
            return api_response(
                success=False,
                message=str(ve),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return api_response(
                success=False,
                message=f"Order checkout failed: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserOrderListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        queryset = Order.objects.filter(user=request.user).prefetch_related('items')
        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = OrderSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class UserOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related('items').get(pk=pk, user=request.user)
            return api_response(success=True, message="Order detail retrieved.", data=OrderSerializer(order).data)
        except Order.DoesNotExist:
            return api_response(success=False, message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)

class AdminOrderListView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        if request.user.role == 'SUPER_ADMIN' or request.user.is_superuser:
            queryset = Order.objects.all()
        else:
            queryset = Order.objects.filter(items__product__seller=request.user).distinct()

        queryset = queryset.prefetch_related('items').order_by('-created_at')

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(order_status=status_param)

        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = OrderSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            new_status = request.data.get('order_status')
            if new_status not in Order.OrderStatus.values:
                return api_response(
                    success=False, 
                    message=f"Invalid status '{new_status}'. Allowed values: {Order.OrderStatus.values}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            order.order_status = new_status
            if new_status == Order.OrderStatus.DELIVERED and order.payment_method == Order.PaymentMethod.COD:
                order.payment_status = Order.PaymentStatus.COD_COLLECTED

            order.save()
            return api_response(success=True, message=f"Order status updated to '{new_status}'.", data=OrderSerializer(order).data)
        except Order.DoesNotExist:
            return api_response(success=False, message="Order not found.", status_code=status.HTTP_404_NOT_FOUND)
