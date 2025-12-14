# Testing the Attachment URL Generator

The attachment URL generator creates deterministic dummy URLs for posts that don't have real attachments. This ensures consistent URLs for the same post ID.

## How It Works

The generator uses the post ID modulo 5 to select from 5 file types:
- `document.pdf` (ID % 5 == 0)
- `image.jpg` (ID % 5 == 1)
- `spreadsheet.xlsx` (ID % 5 == 2)
- `presentation.pptx` (ID % 5 == 3)
- `archive.zip` (ID % 5 == 4)

URL format: `https://example.com/api/attachments/{post_id}/{file_name}`

## Testing Methods

### Method 1: Run Django Unit Tests

```bash
python manage.py test api.tests.AttachmentGeneratorTest -v 2
```

This runs comprehensive unit tests that verify:
- URL generation for posts without attachments
- Deterministic behavior (same ID = same URL)
- File type distribution
- URL pattern matching

### Method 2: Run Simple Test Script

```bash
python manage.py shell < test_attachment_simple.py
```

Or interactively:
```bash
python manage.py shell
```

Then copy-paste the code from `test_attachment_simple.py`.

### Method 3: Test via API

1. Start the Django server:
   ```bash
   python manage.py runserver
   ```

2. Get an authentication token (if needed):
   ```bash
   curl -X POST http://localhost:8000/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "your_username", "password": "your_password"}'
   ```

3. List posts and check attachment_url:
   ```bash
   curl -X GET http://localhost:8000/posts/ \
     -H "Authorization: Token your_token_here"
   ```

4. Check a specific post:
   ```bash
   curl -X GET http://localhost:8000/posts/1/ \
     -H "Authorization: Token your_token_here"
   ```

### Method 4: Test in Django Shell

```python
from api.models import Post
from api.serializers import PostSerializer
from django.test import RequestFactory

# Get a post
post = Post.objects.first()

# Create a request context
factory = RequestFactory()
request = factory.get('/posts/')

# Serialize the post
serializer = PostSerializer(post, context={'request': request})

# Check the attachment URL
print(serializer.data['attachment_url'])
```

## Expected Results

### Example URLs for Different Post IDs:

- Post ID 1: `https://example.com/api/attachments/1/image.jpg`
- Post ID 2: `https://example.com/api/attachments/2/spreadsheet.xlsx`
- Post ID 3: `https://example.com/api/attachments/3/presentation.pptx`
- Post ID 4: `https://example.com/api/attachments/4/archive.zip`
- Post ID 5: `https://example.com/api/attachments/5/document.pdf`
- Post ID 6: `https://example.com/api/attachments/6/image.jpg` (pattern repeats)

### Verification Checklist

- [ ] Same post ID always generates the same URL
- [ ] URL follows the pattern: `https://example.com/api/attachments/{id}/{filename}`
- [ ] File type matches the modulo pattern (ID % 5)
- [ ] All 5 file types appear in the distribution
- [ ] Posts with real attachments use their actual URL instead

## Code Location

The attachment generator is in:
- **File**: `api/serializers.py`
- **Method**: `PostSerializer.get_attachment_url()`
- **Lines**: 58-77

## Notes

- If a post has a real attachment file, the generator returns the actual file URL instead
- The generator is deterministic: same post ID = same generated URL
- This is useful for testing and development when you don't have actual files uploaded

