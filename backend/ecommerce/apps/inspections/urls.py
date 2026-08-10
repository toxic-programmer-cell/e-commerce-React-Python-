from django.urls import path
from apps.inspections.views import (
    SuperAdminInspectionQueueView, SuperAdminApproveProductView, SuperAdminRejectProductView
)

urlpatterns = [
    path('queue/', SuperAdminInspectionQueueView.as_view(), name='inspection-queue'),
    path('<uuid:pk>/approve/', SuperAdminApproveProductView.as_view(), name='inspection-approve'),
    path('<uuid:pk>/reject/', SuperAdminRejectProductView.as_view(), name='inspection-reject'),
]
