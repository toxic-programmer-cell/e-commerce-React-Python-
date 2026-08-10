from django.urls import path
from apps.admin_management.views import (
    SuperAdminUserListView, SuperAdminUserToggleStatusView,
    SuperAdminCreateAdminView, SuperAdminAuditLogListView, SuperAdminStatsView
)

urlpatterns = [
    path('users/', SuperAdminUserListView.as_view(), name='superadmin-users'),
    path('users/<uuid:pk>/toggle-status/', SuperAdminUserToggleStatusView.as_view(), name='superadmin-user-toggle'),
    path('admins/create/', SuperAdminCreateAdminView.as_view(), name='superadmin-admin-create'),
    path('audit-logs/', SuperAdminAuditLogListView.as_view(), name='superadmin-audit-logs'),
    path('stats/', SuperAdminStatsView.as_view(), name='superadmin-stats'),
]
