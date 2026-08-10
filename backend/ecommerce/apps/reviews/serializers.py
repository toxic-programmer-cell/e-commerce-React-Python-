from rest_framework import serializers
from apps.reviews.models import Review
from apps.orders.models import Order, OrderItem
from apps.products.models import Product

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'reviewer_name', 'product', 'order', 'rating', 'title', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_reviewer_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

class CreateReviewSerializer(serializers.Serializer):
    product_id = serializers.UUIDField(required=True)
    order_id = serializers.UUIDField(required=True)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    title = serializers.CharField(max_length=150, required=True)
    comment = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        product_id = attrs['product_id']
        order_id = attrs['order_id']

        # 1. Product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product not found."})

        # 2. Verified Purchase check: User must have an order with status DELIVERED containing this product
        purchased = OrderItem.objects.filter(
            order__id=order_id,
            order__user=user,
            product__id=product_id
        ).exists()

        if not purchased:
            raise serializers.ValidationError({"detail": "You can only review products you have purchased."})

        # 3. Unique review check per user/product/order
        if Review.objects.filter(user=user, product=product, order_id=order_id).exists():
            raise serializers.ValidationError({"detail": "You have already reviewed this product for this order."})

        attrs['product_obj'] = product
        return attrs
