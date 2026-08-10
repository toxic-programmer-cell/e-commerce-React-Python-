from django.urls import path
from apps.products.views import (
    CategoryListView, BrandListView, PublicProductListView, PublicProductDetailView,
    AdminProductListView, AdminProductCreateView, AdminProductDetailView, AdminSubmitInspectionView
)

urlpatterns = [
    # Public
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('public/', PublicProductListView.as_view(), name='public-product-list'),
    path('public/<str:pk_or_slug>/', PublicProductDetailView.as_view(), name='public-product-detail'),

    # Admin Management
    path('admin/list/', AdminProductListView.as_view(), name='admin-product-list'),
    path('admin/create/', AdminProductCreateView.as_view(), name='admin-product-create'),
    path('admin/<uuid:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/<uuid:pk>/submit-inspection/', AdminSubmitInspectionView.as_view(), name='admin-product-submit-inspection'),
]
