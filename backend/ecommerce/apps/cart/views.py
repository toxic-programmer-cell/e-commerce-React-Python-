from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from common.response import api_response
from apps.cart.models import Cart, CartItem
from apps.cart.serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer

def get_or_create_user_cart(request):
    if request.user and request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    
    session_id = request.headers.get('X-Session-ID') or request.session.session_key
    if not session_id:
        request.session.create()
        session_id = request.session.session_key

    cart, _ = Cart.objects.get_or_create(session_id=session_id)
    return cart

class CartDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_or_create_user_cart(request)
        serializer = CartSerializer(cart)
        return api_response(success=True, message="Cart retrieved.", data=serializer.data)

class AddToCartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Cannot add product to cart.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        cart = get_or_create_user_cart(request)
        product = serializer.validated_data['product_obj']
        variant = serializer.validated_data.get('variant_obj')
        quantity = serializer.validated_data['quantity']

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )

        if not created:
            item.quantity += quantity
            available_stock = variant.stock if variant else product.stock
            if item.quantity > available_stock:
                return api_response(
                    success=False,
                    message=f"Cannot add more units. Total quantity in cart exceeds available stock ({available_stock}).",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            item.save()

        return api_response(
            success=True,
            message="Item added to cart.",
            data=CartSerializer(cart).data
        )

class UpdateCartItemView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, item_id):
        cart = get_or_create_user_cart(request)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return api_response(success=False, message="Cart item not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(success=False, message="Invalid quantity.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        quantity = serializer.validated_data['quantity']
        available_stock = item.variant.stock if item.variant else item.product.stock
        if quantity > available_stock:
            return api_response(
                success=False,
                message=f"Requested quantity exceeds available stock ({available_stock}).",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        item.quantity = quantity
        item.save()
        return api_response(success=True, message="Cart updated.", data=CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart = get_or_create_user_cart(request)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return api_response(success=True, message="Item removed from cart.", data=CartSerializer(cart).data)
        except CartItem.DoesNotExist:
            return api_response(success=False, message="Cart item not found.", status_code=status.HTTP_404_NOT_FOUND)

class ClearCartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart = get_or_create_user_cart(request)
        cart.items.all().delete()
        return api_response(success=True, message="Cart cleared.", data=CartSerializer(cart).data)
