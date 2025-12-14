"""
Role-based permissions for Django REST Framework.

This module provides permission classes based on user roles:
- Student: Basic read/write access to own content
- Privileged: Extended access to manage content
- Administrator: Full access to all resources
"""

from rest_framework import permissions
from .models import User


class IsStudentOrHigher(permissions.BasePermission):
    """
    Permission class that allows access to students and higher roles.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            User.Role.STUDENT,
            User.Role.PRIVILEGED,
            User.Role.ADMINISTRATOR,
        ]


class IsPrivilegedOrHigher(permissions.BasePermission):
    """
    Permission class that allows access to privileged users and administrators.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            User.Role.PRIVILEGED,
            User.Role.ADMINISTRATOR,
        ]


class IsAdministrator(permissions.BasePermission):
    """
    Permission class that allows access only to administrators.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == User.Role.ADMINISTRATOR


class IsOwnerOrPrivileged(permissions.BasePermission):
    """
    Permission class that allows access to the owner of an object,
    or to privileged users and administrators.
    """
    def has_object_permission(self, request, view, obj):
        # Administrators and privileged users have full access
        if request.user.role in [User.Role.PRIVILEGED, User.Role.ADMINISTRATOR]:
            return True
        
        # Check if user is the owner (for objects with author/owner field)
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows read access to all authenticated users,
    but write access only to the owner of the object.
    """
    def has_permission(self, request, view):
        # Allow read access to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Write access requires authentication
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Administrators and privileged users have full write access
        if request.user.role in [User.Role.PRIVILEGED, User.Role.ADMINISTRATOR]:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class CanCreatePost(permissions.BasePermission):
    """
    Permission class that allows creating posts only to privileged users and administrators.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only privileged and administrators can create posts
        if request.method == 'POST':
            return request.user.role in [
                User.Role.PRIVILEGED,
                User.Role.ADMINISTRATOR,
            ]
        
        # For other methods, allow if authenticated
        return True


class CanDeletePost(permissions.BasePermission):
    """
    Permission class that allows deleting posts only to privileged users and administrators.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only privileged and administrators can delete posts
        if request.method == 'DELETE':
            return request.user.role in [
                User.Role.PRIVILEGED,
                User.Role.ADMINISTRATOR,
            ]
        
        # For other methods, allow if authenticated
        return True

    def has_object_permission(self, request, view, obj):
        # Only privileged and administrators can delete posts
        if request.method == 'DELETE':
            return request.user.role in [
                User.Role.PRIVILEGED,
                User.Role.ADMINISTRATOR,
            ]
        
        # For other methods, allow if authenticated
        return True


class CanPublishPost(permissions.BasePermission):
    """
    Permission class that allows publishing posts only to privileged users and administrators.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For POST requests, check if user is trying to publish
        if request.method == 'POST':
            is_published = request.data.get('is_published', False)
            if is_published:
                return request.user.role in [
                    User.Role.PRIVILEGED,
                    User.Role.ADMINISTRATOR,
                ]
        
        # For other methods, allow if authenticated
        return True

    def has_object_permission(self, request, view, obj):
        # Administrators and privileged users can always publish/unpublish
        if request.user.role in [User.Role.PRIVILEGED, User.Role.ADMINISTRATOR]:
            return True
        
        # Check if user is trying to change publish status
        if request.method in ['PUT', 'PATCH']:
            if 'is_published' in request.data:
                new_publish_status = request.data.get('is_published')
                if new_publish_status != obj.is_published:
                    # Only privileged/administrator can change publish status
                    return False
        
        # Owner can edit their own posts (but not change publish status)
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        return False

