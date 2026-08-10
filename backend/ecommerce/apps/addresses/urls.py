from django.urls import path
from apps.addresses.views import AddressListCreateView, AddressDetailView

urlpatterns = [
    path('', AddressListCreateView.as_view(), name='address-list-create'),
    path('<uuid:pk>/', AddressDetailView.as_view(), name='address-detail'),
]
