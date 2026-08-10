from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework import status
from rest_framework.views import APIView

from common.response import api_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsSuperAdmin
from apps.users.serializers import UserSerializer, AdminRegisterSerializer
from apps.products.models import Product
from apps.orders.models import Order
from apps.audit_logs.models import AuditLog

User = get_user_model()

class SuperAdminUserListView(APIView):
    permission_classes = [IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        queryset = User.objects.all().order_by('-date_joined')
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(username__icontains=search)

        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = UserSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class SuperAdminUserToggleStatusView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                return api_response(success=False, message="You cannot deactivate your own superadmin account.", status_code=status.HTTP_400_BAD_REQUEST)

            user.is_active = not user.is_active
            user.save(update_fields=['is_active'])

            action_type = "USER_REACTIVATED" if user.is_active else "USER_DEACTIVATED"
            AuditLog.objects.create(
                actor=request.user,
                action=action_type,
                target_type='User',
                target_id=str(user.id),
                details={'target_email': user.email, 'is_active': user.is_active}
            )

            status_str = "activated" if user.is_active else "deactivated"
            return api_response(success=True, message=f"User account '{user.email}' is now {status_str}.", data=UserSerializer(user).data)
        except User.DoesNotExist:
            return api_response(success=False, message="User not found.", status_code=status.HTTP_404_NOT_FOUND)

class SuperAdminCreateAdminView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = AdminRegisterSerializer(data=request.data)
        if serializer.is_valid():
            admin_user = serializer.save()
            AuditLog.objects.create(
                actor=request.user,
                action='ADMIN_CREATED',
                target_type='User',
                target_id=str(admin_user.id),
                details={'admin_email': admin_user.email}
            )
            return api_response(
                success=True,
                message="Admin account created successfully.",
                data=UserSerializer(admin_user).data,
                status_code=status.HTTP_201_CREATED
            )
        return api_response(
            success=False,
            message="Admin creation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class SuperAdminAuditLogListView(APIView):
    permission_classes = [IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        queryset = AuditLog.objects.select_related('actor').all()
        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        
        data = [{
            'id': log.id,
            'actor_email': log.actor.email if log.actor else 'System',
            'action': log.action,
            'target_type': log.target_type,
            'target_id': log.target_id,
            'details': log.details,
            'timestamp': log.timestamp
        } for log in page_results]

        return paginator.get_paginated_response(data)

class SuperAdminStatsView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        total_users = User.objects.filter(role=User.Role.USER).count()
        total_admins = User.objects.filter(role=User.Role.ADMIN).count()
        total_products = Product.objects.count()
        approved_products = Product.objects.filter(status=Product.Status.APPROVED).count()
        pending_inspections = Product.objects.filter(status=Product.Status.SUBMITTED).count()
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0.00

        return api_response(
            success=True,
            message="Platform statistics retrieved.",
            data={
                "total_users": total_users,
                "total_admins": total_admins,
                "total_products": total_products,
                "approved_products": approved_products,
                "pending_inspections": pending_inspections,
                "total_orders": total_orders,
                "total_revenue": total_revenue
            }
        )
