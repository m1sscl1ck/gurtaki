from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Post


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'name', 'dormitory_number', 'pass_photo')
    
    def get_name(self, obj):
        """Combine first_name and last_name into a single name field"""
        parts = [obj.first_name, obj.last_name]
        return ' '.join(filter(None, parts)) or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True, required=True)
    dormitory_number = serializers.CharField(required=True, allow_blank=False)
    pass_photo = serializers.ImageField(required=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'name', 'dormitory_number', 'pass_photo', 'password')

    def create(self, validated_data):
        name = validated_data.pop('name')
        # Split name into first_name and last_name if possible
        name_parts = name.strip().split(maxsplit=1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Generate username from name if not provided
        username = validated_data.get('username')
        if not username:
            base_username = name.lower().replace(' ', '_')
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            validated_data['username'] = username
        
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=first_name,
            last_name=last_name,
            dormitory_number=validated_data['dormitory_number'],
            pass_photo=validated_data['pass_photo'],
            password=validated_data['password'],
            email='',  # Email not required, set to empty string
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




