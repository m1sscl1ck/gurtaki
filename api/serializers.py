from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Post


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True, required=True, help_text="Full name")
    dormitory_number = serializers.CharField(required=True, allow_blank=False)
    pass_photo = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'dormitory_number', 'pass_photo', 'password')

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        pass_photo = validated_data.pop('pass_photo', None)
        dormitory_number = validated_data.pop('dormitory_number', '')
        password = validated_data.pop('password')
        
        # Split name into first_name and last_name, or use as username
        name_parts = name.strip().split(maxsplit=1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Generate username from name if not provided
        username = validated_data.get('username')
        if not username:
            # Create username from first name + last name initial or just first name
            base_username = name.lower().replace(' ', '')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
        
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            dormitory_number=dormitory_number,
            pass_photo=pass_photo,
            password=password,
        )
        return user


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Post
        fields = (
            'id',
            'title',
            'slug',
            'content',
            'author',
            'category',
            'is_published',
            'created_at',
            'updated_at',
            'published_at',
        )
        read_only_fields = ('slug', 'created_at', 'updated_at', 'published_at')




