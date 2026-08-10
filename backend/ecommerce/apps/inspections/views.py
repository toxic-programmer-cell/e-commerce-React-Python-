from rest_framework import status
from rest_framework.views import APIView

from common.response import api_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsSuperAdmin
from apps.products.models import Product
from apps.products.serializers import ProductDetailSerializer
from apps.inspections.models import ProductInspection
from apps.inspections.serializers import RejectProductSerializer, ProductInspectionSerializer
from apps.audit_logs.models import AuditLog

class SuperAdminInspectionQueueView(APIView):
    permission_classes = [IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        status_param = request.query_params.get('status')
        if status_param:
            queryset = Product.objects.filter(status=status_param)
        else:
            queryset = Product.objects.filter(
                status__in=[Product.Status.SUBMITTED, Product.Status.UNDER_REVIEW]
            )

        queryset = queryset.select_related('category', 'brand', 'seller')\
                           .prefetch_related('images', 'variants')\
                           .order_by('-updated_at')

        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = ProductDetailSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class SuperAdminApproveProductView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            if product.status not in [Product.Status.SUBMITTED, Product.Status.UNDER_REVIEW, Product.Status.DRAFT]:
                return api_response(
                    success=False,
                    message=f"Product with status '{product.status}' cannot be approved.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            product.status = Product.Status.APPROVED
            product.rejection_reason = ""
            product.is_active = True
            product.save(update_fields=['status', 'rejection_reason', 'is_active'])

            # Log Inspection
            inspection = ProductInspection.objects.create(
                product=product,
                inspector=request.user,
                status=ProductInspection.InspectionStatus.APPROVED,
                notes=request.data.get('notes', 'Approved by SuperAdmin')
            )

            # Log Audit
            AuditLog.objects.create(
                actor=request.user,
                action='PRODUCT_APPROVED',
                target_type='Product',
                target_id=str(product.id),
                details={'product_name': product.name, 'seller': str(product.seller.email)}
            )

            return api_response(
                success=True,
                message=f"Product '{product.name}' has been APPROVED and is now live publicly.",
                data=ProductDetailSerializer(product).data
            )
        except Product.DoesNotExist:
            return api_response(success=False, message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

class SuperAdminRejectProductView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        serializer = RejectProductSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Rejection reason is required.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(pk=pk)
            reason = serializer.validated_data['rejection_reason']
            notes = serializer.validated_data.get('notes', '')

            product.status = Product.Status.REJECTED
            product.rejection_reason = reason
            product.save(update_fields=['status', 'rejection_reason'])

            # Log Inspection
            ProductInspection.objects.create(
                product=product,
                inspector=request.user,
                status=ProductInspection.InspectionStatus.REJECTED,
                rejection_reason=reason,
                notes=notes
            )

            # Log Audit
            AuditLog.objects.create(
                actor=request.user,
                action='PRODUCT_REJECTED',
                target_type='Product',
                target_id=str(product.id),
                details={'product_name': product.name, 'rejection_reason': reason}
            )

            return api_response(
                success=True,
                message=f"Product '{product.name}' has been REJECTED with reason: {reason}",
                data=ProductDetailSerializer(product).data
            )
        except Product.DoesNotExist:
            return api_response(success=False, message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)
