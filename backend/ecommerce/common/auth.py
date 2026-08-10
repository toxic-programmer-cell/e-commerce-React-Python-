import jwt
import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

def generate_tokens_for_user(user):
    now = datetime.datetime.now(datetime.timezone.utc)
    access_payload = {
        'user_id': str(user.id),
        'email': user.email,
        'role': user.role,
        'token_type': 'access',
        'exp': now + datetime.timedelta(minutes=settings.JWT_ACCESS_EXP_MINUTES),
        'iat': now
    }
    refresh_payload = {
        'user_id': str(user.id),
        'token_type': 'refresh',
        'exp': now + datetime.timedelta(days=settings.JWT_REFRESH_EXP_DAYS),
        'iat': now
    }
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': settings.JWT_ACCESS_EXP_MINUTES * 60
    }

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')

        if payload.get('token_type') != 'access':
            raise AuthenticationFailed('Token type is invalid.')

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')

        if not user.is_active:
            raise AuthenticationFailed('User account is deactivated.')

        return (user, token)
