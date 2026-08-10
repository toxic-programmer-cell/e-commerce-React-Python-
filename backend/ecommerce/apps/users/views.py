import jwt
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from common.response import api_response
from common.auth import generate_tokens_for_user
from apps.users.serializers import (
    UserSerializer, UserRegisterSerializer, UserLoginSerializer, ChangePasswordSerializer
)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = generate_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return api_response(
                success=True,
                message="User registered successfully.",
                data={"user": user_data, "tokens": tokens},
                status_code=status.HTTP_201_CREATED
            )
        return api_response(
            success=False,
            message="Registration failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Invalid login request.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return api_response(
                success=False,
                message="Invalid email or password.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        if not user_obj.is_active:
            return api_response(
                success=False,
                message="Account is deactivated. Please contact support.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        if not user_obj.check_password(password):
            return api_response(
                success=False,
                message="Invalid email or password.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        user = user_obj

        tokens = generate_tokens_for_user(user)
        user_data = UserSerializer(user).data
        return api_response(
            success=True,
            message="Login successful.",
            data={"user": user_data, "tokens": tokens}
        )

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return api_response(
                success=False,
                message="Refresh token is required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload.get('token_type') != 'refresh':
                return api_response(
                    success=False,
                    message="Invalid token type.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            user = User.objects.get(id=payload['user_id'])
            if not user.is_active:
                return api_response(
                    success=False,
                    message="User account is deactivated.",
                    status_code=status.HTTP_403_FORBIDDEN
                )

            tokens = generate_tokens_for_user(user)
            return api_response(
                success=True,
                message="Token refreshed successfully.",
                data={"tokens": tokens}
            )
        except Exception:
            return api_response(
                success=False,
                message="Invalid or expired refresh token.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(
            success=True,
            message="Profile retrieved.",
            data=serializer.data
        )

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return api_response(
                success=True,
                message="Profile updated successfully.",
                data=UserSerializer(user).data
            )
        return api_response(
            success=False,
            message="Profile update failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message="Validation failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(serializer.validated_data['old_password']):
            return api_response(
                success=False,
                message="Incorrect current password.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return api_response(
            success=True,
            message="Password updated successfully."
        )
