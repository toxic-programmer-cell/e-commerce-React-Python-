from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticatedAndActive(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_active)

class IsUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role == 'USER'
        )

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role == 'ADMIN'
        )

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            (request.user.role == 'SUPER_ADMIN' or request.user.is_superuser)
        )

class IsAdminOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ['ADMIN', 'SUPER_ADMIN']
        )

class IsSellerOwnerOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active and 
            request.user.role in ['ADMIN', 'SUPER_ADMIN']
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'SUPER_ADMIN' or request.user.is_superuser:
            return True
        # For products
        if hasattr(obj, 'seller'):
            return obj.seller == request.user
        # For product variants or images
        if hasattr(obj, 'product') and hasattr(obj.product, 'seller'):
            return obj.product.seller == request.user
        return False
