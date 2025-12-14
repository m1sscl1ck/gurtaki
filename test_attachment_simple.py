"""
Simple test script for Attachment URL Generator
Run with: python manage.py shell
Then copy-paste the code below, or run: python manage.py shell < test_attachment_simple.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from api.models import Post, User, Category
from api.serializers import PostSerializer
from django.test import RequestFactory

print("=" * 70)
print("ATTACHMENT URL GENERATOR TEST")
print("=" * 70)

# File types used in the generator
file_types = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx', 'archive.zip']

print("\n1. Testing URL generation pattern:")
print("-" * 70)
print(f"File types: {file_types}")
print(f"Total file types: {len(file_types)}")
print("\nPost ID -> File Type Mapping (first 15 IDs):")
print("-" * 70)

for post_id in range(1, 16):
    file_index = post_id % len(file_types)
    file_name = file_types[file_index]
    url = f"https://example.com/api/attachments/{post_id}/{file_name}"
    print(f"ID {post_id:2d} -> {file_name:20s} -> {url}")

print("\n2. Testing with actual database posts:")
print("-" * 70)

factory = RequestFactory()
request = factory.get('/posts/')

# Get existing posts or create test data
posts = Post.objects.all()[:10]

if posts.exists():
    print(f"Found {posts.count()} post(s) in database:\n")
    for post in posts:
        serializer = PostSerializer(post, context={'request': request})
        attachment_url = serializer.data.get('attachment_url')
        
        # Calculate expected file type
        file_index = post.id % len(file_types)
        expected_file = file_types[file_index]
        
        print(f"Post ID {post.id:3d}: {post.title[:40]:40s}")
        print(f"  URL: {attachment_url}")
        print(f"  Expected file: {expected_file}")
        print(f"  Match: {'✓' if expected_file in attachment_url else '✗'}")
        print()
else:
    print("No posts found in database.")
    print("\nTo test with real data, create posts first:")
    print("  python manage.py seed_data")
    print("\nOr create a test post manually in Django admin.")

print("\n3. Testing consistency:")
print("-" * 70)

# Test that same ID always generates same URL
if posts.exists():
    test_post = posts.first()
    serializer1 = PostSerializer(test_post, context={'request': request})
    serializer2 = PostSerializer(test_post, context={'request': request})
    
    url1 = serializer1.data.get('attachment_url')
    url2 = serializer2.data.get('attachment_url')
    
    print(f"Post ID {test_post.id} - First call:  {url1}")
    print(f"Post ID {test_post.id} - Second call: {url2}")
    print(f"Consistent: {'✓ YES' if url1 == url2 else '✗ NO'}")

print("\n4. File type distribution (IDs 1-20):")
print("-" * 70)

distribution = {file_type: 0 for file_type in file_types}
for post_id in range(1, 21):
    file_index = post_id % len(file_types)
    distribution[file_types[file_index]] += 1

for file_type, count in distribution.items():
    bar = '█' * count
    print(f"{file_type:20s}: {count:2d} {bar}")

print("\n" + "=" * 70)
print("Test completed!")
print("=" * 70)

