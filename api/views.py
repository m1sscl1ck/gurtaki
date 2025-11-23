from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Post, User
from .permissions import (
    IsStudentOrHigher,
    IsPrivilegedOrHigher,
    IsOwnerOrReadOnly,
    CanCreatePost,
    CanDeletePost,
    CanPublishPost,
)
from .serializers import PostSerializer, RegisterSerializer, UserSerializer


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello, world!"})


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "token": token.key,
            }
        )


class PostListCreateView(generics.ListCreateAPIView):
    """
    List all posts or create a new post.
    
    Permissions:
    - All authenticated users can view posts
    - Students can only see published posts
    - Privileged and Administrators can see all posts
    - Only Privileged/Administrator can create posts
    - Only Privileged/Administrator can publish posts directly
    """
    serializer_class = PostSerializer
    permission_classes = [IsStudentOrHigher, CanCreatePost, CanPublishPost]

    def get_queryset(self):
        """
        Filter posts based on user role:
        - Students: Only published posts
        - Privileged/Administrators: All posts
        """
        queryset = Post.objects.select_related("author", "category").all()
        
        if self.request.user.role == User.Role.STUDENT:
            # Students can only see published posts
            queryset = queryset.filter(is_published=True)
        # Privileged and Administrators can see all posts
        
        return queryset.order_by('-pinned', '-created_at')

    def perform_create(self, serializer):
        """
        Create a new post. Only privileged/administrator users can create posts.
        """
        user = self.request.user
        serializer.save(author=user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a post.
    
    Permissions:
    - All authenticated users can view posts (students only published)
    - Only owner can update (unless privileged/administrator)
    - Only Privileged/Administrator can delete posts
    - Only Privileged/Administrator can change publish status
    """
    queryset = Post.objects.select_related("author", "category").all()
    serializer_class = PostSerializer
    permission_classes = [IsStudentOrHigher, IsOwnerOrReadOnly, CanDeletePost, CanPublishPost]
    lookup_field = 'pk'

    def get_queryset(self):
        """
        Filter posts based on user role for detail view.
        Students can see published posts or their own unpublished posts.
        """
        queryset = Post.objects.select_related("author", "category").all()
        
        if self.request.user.role == User.Role.STUDENT:
            # Students can see published posts or their own posts
            from django.db.models import Q
            queryset = queryset.filter(
                Q(is_published=True) | Q(author=self.request.user)
            )
        
        return queryset


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the current user's profile.
    
    Permissions:
    - Users can only view/update their own profile
    - Administrators can view/update any profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        Return the current user's profile.
        Administrators can access other users via ?user_id parameter.
        """
        user_id = self.request.query_params.get('user_id')
        
        # Administrators can view other users
        if user_id and self.request.user.role == User.Role.ADMINISTRATOR:
            try:
                return User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return self.request.user
        
        # Regular users can only view their own profile
        return self.request.user


class PinnedPostsView(generics.ListAPIView):
    """
    List all pinned posts.
    
    Permissions:
    - All authenticated users can view pinned posts
    - Students can only see published pinned posts
    - Privileged and Administrators can see all pinned posts
    """
    serializer_class = PostSerializer
    permission_classes = [IsStudentOrHigher]

    def get_queryset(self):
        """
        Filter pinned posts based on user role:
        - Students: Only published pinned posts
        - Privileged/Administrators: All pinned posts
        """
        queryset = Post.objects.select_related("author", "category").filter(pinned=True)
        
        if self.request.user.role == User.Role.STUDENT:
            # Students can only see published pinned posts
            queryset = queryset.filter(is_published=True)
        # Privileged and Administrators can see all pinned posts
        
        return queryset.order_by('-created_at')
