from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Post


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id',
            'title',
            'slug',
            'content',
            'author',
            'category',
            'attachment',
            'attachment_url',
            'is_published',
            'created_at',
            'updated_at',
            'published_at',
        )
        read_only_fields = ('slug', 'created_at', 'updated_at', 'published_at', 'attachment_url')

    def get_attachment_url(self, obj):
        """
        Return dummy URL for attachment.
        If attachment exists, return its URL, otherwise return a dummy URL.
        """
        if obj.attachment:
            # If there's a real attachment, return its URL
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        
        # Return deterministic dummy URL based on post ID
        post_id = obj.id if obj.id else 'new'
        # Use post ID modulo to select file type for consistency
        file_types = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx', 'archive.zip']
        file_index = (post_id % len(file_types)) if isinstance(post_id, int) else 0
        file_name = file_types[file_index] if isinstance(post_id, int) else file_types[0]
        
        return f"https://example.com/api/attachments/{post_id}/{file_name}"




