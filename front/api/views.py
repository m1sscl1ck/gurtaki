from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import Post, StudentProfile
import os

@api_view(['POST'])
@permission_classes([AllowAny])
# Ми прибрали MultiPartParser, оскільки не очікуємо файлів
def register(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return Response({'detail': 'Введіть ім\'я та пароль'}, status=400)

        if User.objects.filter(username=username).exists():
             return Response({'detail': 'Це ім\'я зайняте'}, status=400)

        # 1. Створення користувача
        user = User.objects.create_user(username=username, password=password)
        user.is_active = True # <-- АКТИВАЦІЯ ОДРАЗУ!
        user.save()

        # 2. Створення профілю
        StudentProfile.objects.create(
            user=user,
            dorm_number=data.get('dorm_number', 0), # Використовуємо 0
            student_id_photo=None # Без фото
        )

        return Response({'message': 'Успіх! Акаунт створено та активовано.'})

    except Exception as e:
        return Response({'detail': str(e)}, status=400)


# --- ВХІД ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'detail': 'Невірні дані'}, status=400)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_posts(request):
    try:
        user_profile = request.user.profile
        user_dorm = user_profile.dorm_number
    except StudentProfile.DoesNotExist:
        return Response({'detail': 'Профіль користувача не знайдено.'}, status=400)

    if request.method == 'GET':
        posts = Post.objects.filter(dorm_number=user_dorm).order_by('-created_at')
        
        data = []
        for post in posts:
            image_url = None
            if post.image: 
                BASE_ADDRESS = 'http://172.23.168.1:8000' 
                image_url = BASE_ADDRESS + post.image.url
                
            data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'created_at': post.created_at,
                'dorm_number': post.dorm_number,
                'image_url': image_url,
            })

        return Response(data)

    elif request.method == 'POST':
        try:
            
            if not request.data.get('title') or not request.data.get('content'):
                 return Response({'detail': 'Необхідно вказати заголовок та зміст.'}, status=400)
                 
            Post.objects.create(
                title=request.data['title'],
                content=request.data['content'],
                dorm_number=user_dorm,
                image=request.data.get('image', None) 
            )
            return Response({'message': 'Пост додано!'})
        
        except Exception as e:
            return Response({'detail': 'Помилка при збереженні поста: ' + str(e)}, status=500)