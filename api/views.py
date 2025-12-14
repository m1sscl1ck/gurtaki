from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import Post, StudentProfile
import os # 👈 ДОДАНО: Необхідний імпорт для чистоти коду

# --- РЕЄСТРАЦІЯ (ТІЛЬКИ ІМ'Я + ПАРОЛЬ, АКТИВАЦІЯ ОДРАЗУ) ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return Response({'detail': 'Введіть ім\'я та пароль'}, status=400)

        if User.objects.filter(username=username).exists():
             return Response({'detail': 'Це ім\'я зайняте'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        user.is_active = True
        user.save()

        StudentProfile.objects.create(
            user=user,
            dorm_number=data.get('dorm_number', 0), 
            student_id_photo=None
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


# --- ПОСТИ (FIXED: GET з image_url) ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_posts(request):
    
    try:
        user_profile = request.user.profile
        user_dorm = user_profile.dorm_number
    except Exception as e:
        return Response({'detail': 'Ви не авторизовані або профіль не знайдено.'}, status=401)

    if request.method == 'GET':
        posts = Post.objects.filter(dorm_number=user_dorm).order_by('-created_at')
        
        data = []
        # 👇 ВИПРАВЛЕННЯ: ВСТАНОВЛЕННЯ БАЗОВОЇ АДРЕСИ
        # ВИКОРИСТОВУЄМО ВАШУ IP, щоб уникнути 127.0.0.1
        BASE_ADDRESS = 'http://172.23.168.1:8000' 

        for post in posts:
            image_url = None
            if post.image: 
                # Створюємо повний URL: IP_ADDRESS:PORT/media/path/to/image.jpg
                image_url = BASE_ADDRESS + post.image.url
            
            # 👇 СТВОРЕННЯ СЛОВНИКА ДАНИХ З image_url
            data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'created_at': post.created_at,
                'dorm_number': post.dorm_number,
                'image_url': image_url,
            })
        
        # DEBUG: Перевірка, що URL генерується
        if data and data[0]['image_url']:
            print(f"\n✅ Sending Image URL: {data[0]['image_url']}\n")
            
        return Response(data)

    elif request.method == 'POST':
        try:
            if not request.data.get('title') or not request.data.get('content'):
                 return Response({'detail': 'Необхідно вказати заголовок та зміст.'}, status=400)
            
            # 👇 ДОДАНО: Обробка зображення (якщо надсилається)
            Post.objects.create(
                title=request.data['title'],
                content=request.data['content'],
                dorm_number=user_dorm,
                image=request.data.get('image', None) # Припускаємо, що поле називається 'image'
            )
            print("🚀 Пост успішно створено!")
            return Response({'message': 'Пост додано!'})
        
        except Exception as e:
            print(f"🛑 КРИТИЧНА ПОМИЛКА СЕРВЕРА: {e}")
            return Response({'detail': 'Помилка при збереженні поста: ' + str(e)}, status=500)


# --- ДЕТАЛІ ПОСТА (ЗАЛИШАЄМО БЕЗ ЗМІН) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post_detail(request, post_id):
    try:
        user_dorm = request.user.profile.dorm_number
        
        # Нам також потрібно повертати URL зображення тут, але для простоти поки повертаємо .values()
        post = Post.objects.get(id=post_id, dorm_number=user_dorm)
        
        return Response(list(Post.objects.filter(id=post_id).values()))
        
    except Post.DoesNotExist:
        return Response({'detail': 'Оголошення не знайдено або доступ заборонено.'}, status=404)
    except Exception as e:
        return Response({'detail': str(e)}, status=500)
