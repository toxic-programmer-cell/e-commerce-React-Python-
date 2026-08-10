from rest_framework import serializers
from apps.addresses.models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'full_name', 'phone', 'address_line_1', 'address_line_2', 
            'city', 'state', 'postal_code', 'country', 'address_type', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        # If this is the first address, force default to True
        if not Address.objects.filter(user=user).exists():
            validated_data['is_default'] = True
        return Address.objects.create(user=user, **validated_data)
