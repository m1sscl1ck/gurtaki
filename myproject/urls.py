from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from api.views import register, login, manage_posts, get_post_detail 

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # AUTH
    path('api/auth/register/', register),
    path('api/auth/login/', login),
    
    path('api/posts/<int:post_id>/', get_post_detail),
    
    # POSTS (Загальний список та створення)
    path('api/posts/', manage_posts), 
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)