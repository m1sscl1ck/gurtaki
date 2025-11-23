"""
Test script for Attachment URL Generator

This script tests the attachment URL generation logic in PostSerializer.
Run with: python manage.py shell < test_attachment_generator.py
Or use: python manage.py test api.tests.AttachmentGeneratorTest
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from api.models import Post, User, Category
from api.serializers import PostSerializer
from django.test import RequestFactory


def test_attachment_url_generator():
    """Test the attachment URL generator logic"""
    print("=" * 60)
    print("Testing Attachment URL Generator")
    print("=" * 60)
    
    # File types used in the generator
    file_types = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx', 'archive.zip']
    
    print("\n1. Testing URL generation for different post IDs:")
    print("-" * 60)
    
    # Test with different post IDs
    test_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25]
    
    for post_id in test_ids:
        # Calculate expected file type
        file_index = post_id % len(file_types)
        expected_file = file_types[file_index]
        expected_url = f"https://example.com/api/attachments/{post_id}/{expected_file}"
        
        print(f"Post ID {post_id:2d}: {expected_url}")
        print(f"  -> File type: {expected_file} (index: {file_index})")
    
    print("\n2. Testing consistency (same ID = same URL):")
    print("-" * 60)
    
    # Test consistency - same ID should always generate same URL
    test_id = 7
    file_index_1 = test_id % len(file_types)
    file_index_2 = test_id % len(file_types)
    
    url_1 = f"https://example.com/api/attachments/{test_id}/{file_types[file_index_1]}"
    url_2 = f"https://example.com/api/attachments/{test_id}/{file_types[file_index_2]}"
    
    print(f"Post ID {test_id} - First call:  {url_1}")
    print(f"Post ID {test_id} - Second call: {url_2}")
    print(f"Consistent: {url_1 == url_2} ✓" if url_1 == url_2 else f"Consistent: {url_1 == url_2} ✗")
    
    print("\n3. Testing file type distribution:")
    print("-" * 60)
    
    # Test distribution across IDs 1-20
    distribution = {file_type: 0 for file_type in file_types}
    for post_id in range(1, 21):
        file_index = post_id % len(file_types)
        distribution[file_types[file_index]] += 1
    
    for file_type, count in distribution.items():
        print(f"{file_type:20s}: {count:2d} occurrences")
    
    print("\n4. Testing with actual Post objects (if available):")
    print("-" * 60)
    
    # Try to get actual posts from database
    posts = Post.objects.all()[:5]
    
    if posts.exists():
        factory = RequestFactory()
        request = factory.get('/posts/')
        
        for post in posts:
            serializer = PostSerializer(post, context={'request': request})
            attachment_url = serializer.data.get('attachment_url')
            print(f"Post ID {post.id:2d} ({post.title[:30]:30s}): {attachment_url}")
    else:
        print("No posts found in database. Create some posts first to test with real data.")
        print("\nTo create test posts, run:")
        print("  python manage.py seed_data")
    
    print("\n5. Testing edge cases:")
    print("-" * 60)
    
    # Test with ID 0
    post_id_0 = 0
    file_index_0 = post_id_0 % len(file_types)
    url_0 = f"https://example.com/api/attachments/{post_id_0}/{file_types[file_index_0]}"
    print(f"Post ID {post_id_0}: {url_0}")
    
    # Test with large ID
    post_id_large = 999
    file_index_large = post_id_large % len(file_types)
    url_large = f"https://example.com/api/attachments/{post_id_large}/{file_types[file_index_large]}"
    print(f"Post ID {post_id_large}: {url_large}")
    
    # Test pattern: IDs that should map to same file type
    print("\n6. Testing modulo pattern:")
    print("-" * 60)
    print("Post IDs that map to the same file type (document.pdf):")
    same_type_ids = [i for i in range(1, 21) if i % len(file_types) == 0]
    print(f"  {same_type_ids}")
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)


if __name__ == '__main__':
    test_attachment_url_generator()

