from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.response import api_response
from apps.addresses.models import Address
from apps.addresses.serializers import AddressSerializer

class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return api_response(success=True, message="Addresses retrieved.", data=serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            address = serializer.save()
            return api_response(
                success=True,
                message="Address created successfully.",
                data=AddressSerializer(address).data,
                status_code=status.HTTP_201_CREATED
            )
        return api_response(
            success=False,
            message="Address creation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Address.objects.get(pk=pk, user=user)
        except Address.DoesNotExist:
            return None

    def get(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return api_response(success=False, message="Address not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(success=True, message="Address detail retrieved.", data=AddressSerializer(address).data)

    def put(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return api_response(success=False, message="Address not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return api_response(success=True, message="Address updated successfully.", data=AddressSerializer(updated).data)
        return api_response(success=False, message="Address update failed.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return api_response(success=False, message="Address not found.", status_code=status.HTTP_404_NOT_FOUND)

        address.delete()
        return api_response(success=True, message="Address deleted successfully.")
