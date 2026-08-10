from django.urls import path
from apps.cart.views import CartDetailView, AddToCartView, UpdateCartItemView, ClearCartView

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('items/<uuid:item_id>/', UpdateCartItemView.as_view(), name='cart-item-detail'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),
]
