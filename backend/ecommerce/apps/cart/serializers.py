from rest_framework import serializers
from apps.cart.models import Cart, CartItem
from apps.products.models import Product, ProductVariant
from apps.products.serializers import ProductListSerializer, ProductVariantSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'variant', 'quantity', 'unit_price', 'total_price', 'created_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'total_items', 'created_at', 'updated_at']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField(required=True)
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, attrs):
        try:
            product = Product.objects.get(id=attrs['product_id'])
            if product.status != Product.Status.APPROVED or not product.is_active:
                raise serializers.ValidationError({"product_id": "Product is not available for purchase."})
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product does not exist."})

        variant = None
        if attrs.get('variant_id'):
            try:
                variant = ProductVariant.objects.get(id=attrs['variant_id'], product=product)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError({"variant_id": "Variant does not exist for this product."})

        available_stock = variant.stock if variant else product.stock
        if available_stock < attrs['quantity']:
            raise serializers.ValidationError({"quantity": f"Only {available_stock} units available in stock."})

        attrs['product_obj'] = product
        attrs['variant_obj'] = variant
        return attrs

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(required=True, min_value=1)
