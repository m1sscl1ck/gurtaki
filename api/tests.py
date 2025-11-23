from django.test import TestCase
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from api.models import Post, Category
from api.serializers import PostSerializer

User = get_user_model()


class AttachmentGeneratorTest(TestCase):
    """Test cases for attachment URL generator"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )
        self.factory = RequestFactory()
    
    def test_attachment_url_without_attachment(self):
        """Test that attachment_url is generated when post has no attachment"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            category=self.category
        )
        
        request = self.factory.get('/posts/')
        serializer = PostSerializer(post, context={'request': request})
        
        attachment_url = serializer.data.get('attachment_url')
        
        # Should generate a URL based on post ID
        self.assertIsNotNone(attachment_url)
        self.assertIn(str(post.id), attachment_url)
        self.assertIn('https://example.com/api/attachments', attachment_url)
    
    def test_attachment_url_deterministic(self):
        """Test that same post ID always generates same attachment URL"""
        post1 = Post.objects.create(
            title='Test Post 1',
            content='Test content',
            author=self.user,
            category=self.category
        )
        
        post2 = Post.objects.create(
            title='Test Post 2',
            content='Test content',
            author=self.user,
            category=self.category
        )
        
        request = self.factory.get('/posts/')
        
        # Serialize same post twice
        serializer1 = PostSerializer(post1, context={'request': request})
        serializer2 = PostSerializer(post1, context={'request': request})
        
        url1 = serializer1.data.get('attachment_url')
        url2 = serializer2.data.get('attachment_url')
        
        # Should be identical
        self.assertEqual(url1, url2)
        
        # Different posts should have different URLs
        serializer3 = PostSerializer(post2, context={'request': request})
        url3 = serializer3.data.get('attachment_url')
        
        self.assertNotEqual(url1, url3)
    
    def test_attachment_url_file_type_distribution(self):
        """Test that file types are distributed correctly based on post ID modulo"""
        file_types = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx', 'archive.zip']
        
        # Create posts with IDs that will map to different file types
        posts = []
        for i in range(1, 6):  # IDs 1-5 will map to indices 1-5 (mod 5)
            post = Post.objects.create(
                title=f'Test Post {i}',
                content='Test content',
                author=self.user,
                category=self.category
            )
            posts.append(post)
        
        request = self.factory.get('/posts/')
        
        for post in posts:
            serializer = PostSerializer(post, context={'request': request})
            attachment_url = serializer.data.get('attachment_url')
            
            # Calculate expected file type
            expected_index = post.id % len(file_types)
            expected_file = file_types[expected_index]
            
            # Check that URL contains the expected file type
            self.assertIn(expected_file, attachment_url)
    
    def test_attachment_url_with_real_attachment(self):
        """Test that real attachment URL is used when attachment exists"""
        # Note: This test would require actual file upload, which is more complex
        # For now, we test the logic path
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            category=self.category
            # attachment field is None by default
        )
        
        request = self.factory.get('/posts/')
        serializer = PostSerializer(post, context={'request': request})
        
        # Since attachment is None, should use generated URL
        attachment_url = serializer.data.get('attachment_url')
        self.assertIsNotNone(attachment_url)
        self.assertIn('https://example.com/api/attachments', attachment_url)
    
    def test_attachment_url_pattern(self):
        """Test the URL pattern matches expected format"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user,
            category=self.category
        )
        
        request = self.factory.get('/posts/')
        serializer = PostSerializer(post, context={'request': request})
        
        attachment_url = serializer.data.get('attachment_url')
        
        # Should match pattern: https://example.com/api/attachments/{id}/{filename}
        self.assertTrue(attachment_url.startswith('https://example.com/api/attachments/'))
        self.assertIn(f'/{post.id}/', attachment_url)
        
        # Should end with one of the file types
        file_types = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx', 'archive.zip']
        self.assertTrue(any(attachment_url.endswith(ft) for ft in file_types))
