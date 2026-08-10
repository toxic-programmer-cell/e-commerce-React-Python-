from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'

    def test_user_registration(self):
        payload = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('tokens', response.data['data'])

    def test_user_login(self):
        user = User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password="Password123!",
            role=User.Role.USER
        )
        response = self.client.post(self.login_url, {"email": "login@example.com", "password": "Password123!"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access_token', response.data['data']['tokens'])
