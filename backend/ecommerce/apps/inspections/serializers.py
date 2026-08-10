from rest_framework import serializers
from apps.inspections.models import ProductInspection
from apps.products.serializers import ProductDetailSerializer

class ProductInspectionSerializer(serializers.ModelSerializer):
    product_detail = ProductDetailSerializer(source='product', read_only=True)
    inspector_email = serializers.SerializerMethodField()

    class Meta:
        model = ProductInspection
        fields = ['id', 'product', 'product_detail', 'inspector', 'inspector_email', 'status', 'rejection_reason', 'notes', 'inspected_at']

    def get_inspector_email(self, obj):
        return obj.inspector.email if obj.inspector else "System"

class RejectProductSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True, min_length=5)
    notes = serializers.CharField(required=False, allow_blank=True)
