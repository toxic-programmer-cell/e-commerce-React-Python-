from rest_framework import serializers
from apps.products.models import Category, Brand, Product, ProductImage, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count', 'is_active', 'created_at']

    def get_product_count(self, obj):
        return obj.products.filter(status=Product.Status.APPROVED, is_active=True).count()

class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'product_count', 'is_active', 'created_at']

    def get_product_count(self, obj):
        return obj.products.filter(status=Product.Status.APPROVED, is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'alt_text', 'created_at']

class ProductVariantSerializer(serializers.ModelSerializer):
    variant_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'variant_price', 'stock', 'attributes']

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'sku', 'price', 'discount_price', 
            'current_price', 'stock', 'status', 'average_rating', 'review_count',
            'category', 'brand', 'primary_image', 'created_at'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first()
        if not img:
            img = obj.images.first()
        return ProductImageSerializer(img).data if img else None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'sku', 'price', 
            'discount_price', 'current_price', 'stock', 'status', 'rejection_reason',
            'average_rating', 'review_count', 'category', 'brand', 'images', 'variants',
            'seller', 'seller_name', 'is_active', 'created_at', 'updated_at'
        ]

    def get_seller_name(self, obj):
        return f"{obj.seller.first_name} {obj.seller.last_name}".strip() or obj.seller.email

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    images_data = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'short_description', 'category', 'brand', 
            'sku', 'price', 'discount_price', 'stock', 'images_data'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images_data', [])
        seller = self.context['request'].user
        
        # Automatic slug generation
        from django.utils.text import slugify
        import uuid
        base_slug = slugify(validated_data['name'])
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        product = Product.objects.create(
            seller=seller,
            slug=slug,
            status=Product.Status.DRAFT,
            **validated_data
        )

        for idx, img_file in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image=img_file,
                is_primary=(idx == 0)
            )

        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images_data', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # If product was rejected, editing moves it back to DRAFT for re-submission
        if instance.status == Product.Status.REJECTED:
            instance.status = Product.Status.DRAFT

        instance.save()

        if images_data is not None:
            for idx, img_file in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image=img_file,
                    is_primary=(idx == 0 and not instance.images.filter(is_primary=True).exists())
                )

        return instance
