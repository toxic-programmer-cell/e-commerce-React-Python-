from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import api_response
from common.pagination import StandardResultsSetPagination
from common.permissions import IsAdmin, IsAdminOrSuperAdmin, IsSellerOwnerOrSuperAdmin
from apps.products.models import Category, Brand, Product
from apps.products.serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer, 
    ProductDetailSerializer, ProductCreateUpdateSerializer
)

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories, many=True)
        return api_response(success=True, message="Categories retrieved.", data=serializer.data)

class BrandListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        brands = Brand.objects.filter(is_active=True)
        serializer = BrandSerializer(brands, many=True)
        return api_response(success=True, message="Brands retrieved.", data=serializer.data)

class PublicProductListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        # Strict Public Security: ONLY Approved and Active products
        queryset = Product.objects.filter(
            status=Product.Status.APPROVED, 
            is_active=True
        ).select_related('category', 'brand').prefetch_related('images')

        # 1. Server-side Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search) |
                Q(sku__icontains=search) |
                Q(category__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        # 2. Server-side Filtering
        category_slug = request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        brand_slug = request.query_params.get('brand')
        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)

        min_price = request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # 3. Server-side Sorting with whitelist safety
        ordering = request.query_params.get('ordering', '-created_at')
        allowed_ordering = {
            'created_at': 'created_at',
            '-created_at': '-created_at',
            'price': 'price',
            '-price': '-price',
            'rating': '-average_rating',
            '-rating': 'average_rating',
            'name': 'name',
            '-name': '-name',
        }
        safe_ordering = allowed_ordering.get(ordering, '-created_at')
        queryset = queryset.order_by(safe_ordering)

        # 4. Server-side Pagination
        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class PublicProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk_or_slug):
        try:
            if pk_or_slug.count('-') > 0 and not len(pk_or_slug) == 36:
                product = Product.objects.select_related('category', 'brand', 'seller')\
                                         .prefetch_related('images', 'variants')\
                                         .get(slug=pk_or_slug, status=Product.Status.APPROVED, is_active=True)
            else:
                product = Product.objects.select_related('category', 'brand', 'seller')\
                                         .prefetch_related('images', 'variants')\
                                         .get(id=pk_or_slug, status=Product.Status.APPROVED, is_active=True)
            
            serializer = ProductDetailSerializer(product)
            return api_response(success=True, message="Product detail retrieved.", data=serializer.data)
        except Product.DoesNotExist:
            return api_response(success=False, message="Product not found or not published.", status_code=status.HTTP_404_NOT_FOUND)

class AdminProductListView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        if request.user.role == 'SUPER_ADMIN' or request.user.is_superuser:
            queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(seller=request.user)

        queryset = queryset.select_related('category', 'brand').prefetch_related('images')

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(sku__icontains=search)
            )

        queryset = queryset.order_by('-created_at')
        paginator = self.pagination_class()
        page_results = paginator.paginate_queryset(queryset, request)
        serializer = ProductListSerializer(page_results, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdminProductCreateView(APIView):
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request):
        serializer = ProductCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return api_response(
                success=True,
                message="Product created in DRAFT state. You can now submit it for inspection.",
                data=ProductDetailSerializer(product).data,
                status_code=status.HTTP_201_CREATED
            )
        return api_response(
            success=False,
            message="Product creation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class AdminProductDetailView(APIView):
    permission_classes = [IsSellerOwnerOrSuperAdmin]

    def get_object(self, pk):
        try:
            product = Product.objects.get(pk=pk)
            self.check_object_permissions(self.request, product)
            return product
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return api_response(success=False, message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(success=True, message="Product retrieved.", data=ProductDetailSerializer(product).data)

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return api_response(success=False, message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)

        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return api_response(
                success=True,
                message="Product updated successfully.",
                data=ProductDetailSerializer(updated).data
            )
        return api_response(
            success=False,
            message="Product update failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class AdminSubmitInspectionView(APIView):
    permission_classes = [IsSellerOwnerOrSuperAdmin]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            self.check_object_permissions(request, product)

            if product.status not in [Product.Status.DRAFT, Product.Status.REJECTED]:
                return api_response(
                    success=False,
                    message=f"Product cannot be submitted from status '{product.status}'. Must be DRAFT or REJECTED.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            product.status = Product.Status.SUBMITTED
            product.rejection_reason = ""
            product.save(update_fields=['status', 'rejection_reason'])

            return api_response(
                success=True,
                message="Product successfully submitted for SuperAdmin inspection.",
                data=ProductDetailSerializer(product).data
            )
        except Product.DoesNotExist:
            return api_response(success=False, message="Product not found.", status_code=status.HTTP_404_NOT_FOUND)
