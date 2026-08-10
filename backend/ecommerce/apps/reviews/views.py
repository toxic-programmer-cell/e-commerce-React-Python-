from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import api_response
from common.pagination import StandardResultsSetPagination
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer, CreateReviewSerializer

class ProductReviewListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get(self, request, product_id):
        queryset = Review.objects.filter(product_id=product_id).select_related('user').order_by('-created_at')
        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = ReviewSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class CreateReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateReviewSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Review validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        product = serializer.validated_data['product_obj']
        review = Review.objects.create(
            user=request.user,
            product=product,
            order_id=serializer.validated_data['order_id'],
            rating=serializer.validated_data['rating'],
            title=serializer.validated_data['title'],
            comment=serializer.validated_data['comment']
        )

        return api_response(
            success=True,
            message="Thank you! Your product review has been published.",
            data=ReviewSerializer(review).data,
            status_code=status.HTTP_201_CREATED
        )
