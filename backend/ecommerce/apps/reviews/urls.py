from django.urls import path
from apps.reviews.views import ProductReviewListView, CreateReviewView

urlpatterns = [
    path('product/<uuid:product_id>/', ProductReviewListView.as_view(), name='product-reviews'),
    path('', CreateReviewView.as_view(), name='create-review'),
]
