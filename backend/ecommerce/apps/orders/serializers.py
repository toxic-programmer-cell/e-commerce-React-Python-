from rest_framework import serializers
from apps.orders.models import Order, OrderItem
from apps.addresses.models import Address

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'product_name', 'product_sku', 'unit_price', 'quantity', 'total_price', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'customer_name', 'customer_email',
            'shipping_name', 'shipping_phone', 'shipping_address_line_1', 'shipping_address_line_2',
            'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country',
            'subtotal', 'discount', 'shipping_fee', 'total_amount',
            'payment_status', 'payment_method', 'order_status',
            'estimated_delivery_date', 'tracking_number', 'notes', 'items', 'created_at', 'updated_at'
        ]

    def get_customer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_customer_email(self, obj):
        return obj.user.email

class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.UUIDField(required=True)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_address_id(self, value):
        user = self.context['request'].user
        try:
            return Address.objects.get(id=value, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Selected address does not exist.")
