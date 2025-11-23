from django.contrib import admin
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from api.views import (
    hello_world,
    LoginView,
    PostListCreateView,
    PostDetailView,
    PinnedPostsView,
    RegisterView,
    UserProfileView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world),  # наш перший API
    path('api/token-auth/', obtain_auth_token, name='api_token_auth'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('posts/', PostListCreateView.as_view(), name='posts'),
    path('posts/pinned/', PinnedPostsView.as_view(), name='pinned-posts'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]
