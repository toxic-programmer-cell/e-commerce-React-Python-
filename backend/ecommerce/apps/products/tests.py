from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Category, Brand, Product
from common.auth import generate_tokens_for_user

User = get_user_model()

class ProductInspectionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        self.seller = User.objects.create_user(
            username="seller", email="seller@example.com", password="Password123!", role=User.Role.ADMIN
        )
        self.superadmin = User.objects.create_user(
            username="superadmin", email="superadmin@example.com", password="Password123!", role=User.Role.SUPER_ADMIN, is_superuser=True
        )
        self.customer = User.objects.create_user(
            username="customer", email="customer@example.com", password="Password123!", role=User.Role.USER
        )

        self.category = Category.objects.create(name="Tech", slug="tech")
        self.brand = Brand.objects.create(name="BrandX", slug="brandx")

        self.seller_token = generate_tokens_for_user(self.seller)['access_token']
        self.superadmin_token = generate_tokens_for_user(self.superadmin)['access_token']

    def test_product_inspection_flow(self):
        # 1. Seller creates product as DRAFT
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.seller_token}')
        create_payload = {
            "name": "Test Wireless Mouse",
            "description": "Ergonomic high-DPI gaming mouse.",
            "short_description": "Wireless mouse.",
            "category": str(self.category.id),
            "brand": str(self.brand.id),
            "sku": "MOUSE-001",
            "price": "49.99",
            "stock": 100
        }
        res_create = self.client.post('/api/products/admin/create/', create_payload, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        product_id = res_create.data['data']['id']
        
        product = Product.objects.get(id=product_id)
        self.assertEqual(product.status, Product.Status.DRAFT)

        # 2. Public API should NOT list draft product
        res_public = self.client.get('/api/products/public/')
        self.assertEqual(res_public.data['data']['count'], 0)

        # 3. Seller submits for inspection
        res_sub = self.client.post(f'/api/products/admin/{product_id}/submit-inspection/')
        self.assertEqual(res_sub.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.status, Product.Status.SUBMITTED)

        # 4. SuperAdmin approves product
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.superadmin_token}')
        res_appr = self.client.post(f'/api/super-admin/inspections/{product_id}/approve/')
        self.assertEqual(res_appr.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.status, Product.Status.APPROVED)

        # 5. Public API SHOULD list approved product now
        res_public_after = self.client.get('/api/products/public/')
        self.assertEqual(res_public_after.data['data']['count'], 1)
