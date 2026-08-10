from django.urls import path
from apps.orders.views import (
    CheckoutView, UserOrderListView, UserOrderDetailView, 
    AdminOrderListView, AdminUpdateOrderStatusView
)

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('', UserOrderListView.as_view(), name='user-order-list'),
    path('<uuid:pk>/', UserOrderDetailView.as_view(), name='user-order-detail'),
    path('admin/list/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<uuid:pk>/status/', AdminUpdateOrderStatusView.as_view(), name='admin-order-status-update'),
]
