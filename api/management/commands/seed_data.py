"""
Django management command to seed the database with test data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear  # Clear existing data first
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, Category, Post


class Command(BaseCommand):
    help = 'Seeds the database with test data (users, categories, and posts)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Post.objects.all().delete()
            Category.objects.all().delete()
            # Don't delete superusers, only regular users
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write(self.style.SUCCESS('Starting to seed data...'))

        # Create Users
        users = self.create_users()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(users)} users'))

        # Create Categories
        categories = self.create_categories()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(categories)} categories'))

        # Create Posts
        posts = self.create_posts(users, categories)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(posts)} posts'))

        self.stdout.write(self.style.SUCCESS('\n✓ Database seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('\nYou can now login to the admin panel with:'))
        self.stdout.write(self.style.SUCCESS('  Username: admin'))
        self.stdout.write(self.style.SUCCESS('  Password: admin123'))

    def create_users(self):
        """Create test users"""
        users = []

        # Create admin user if it doesn't exist
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'bio': 'System administrator with full access to the platform.',
                'is_staff': True,
                'is_superuser': True,
                'role': User.Role.ADMINISTRATOR,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            users.append(admin)
            self.stdout.write('  Created admin user')

        # Create regular users
        user_data = [
            {
                'username': 'john_doe',
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'bio': 'Tech enthusiast and blogger. Love writing about web development and programming.',
                'role': User.Role.STUDENT,
            },
            {
                'username': 'jane_smith',
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'bio': 'Content creator and digital marketer. Passionate about sharing knowledge.',
                'role': User.Role.PRIVILEGED,
            },
            {
                'username': 'alex_writer',
                'email': 'alex@example.com',
                'first_name': 'Alex',
                'last_name': 'Writer',
                'bio': 'Professional writer and editor. Specializing in technology and lifestyle content.',
                'role': User.Role.STUDENT,
            },
            {
                'username': 'sarah_tech',
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Tech',
                'bio': 'Software engineer and tech blogger. Focused on Python and Django development.',
                'role': User.Role.PRIVILEGED,
            },
        ]

        for data in user_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    **data,
                    'is_staff': False,
                    'is_superuser': False,
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                users.append(user)

        return users

    def create_categories(self):
        """Create test categories"""
        categories_data = [
            {
                'name': 'Technology',
                'description': 'Articles about technology, programming, and software development.',
            },
            {
                'name': 'Web Development',
                'description': 'Tutorials and guides about web development, frameworks, and tools.',
            },
            {
                'name': 'Django',
                'description': 'Everything related to Django framework - tutorials, tips, and best practices.',
            },
            {
                'name': 'Python',
                'description': 'Python programming language articles, tutorials, and resources.',
            },
            {
                'name': 'Lifestyle',
                'description': 'Lifestyle articles, tips, and personal experiences.',
            },
            {
                'name': 'Tutorials',
                'description': 'Step-by-step tutorials and guides for various topics.',
            },
        ]

        categories = []
        for data in categories_data:
            category, created = Category.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            if created:
                categories.append(category)

        return categories

    def create_posts(self, users, categories):
        """Create test posts"""
        posts_data = [
            {
                'title': 'Getting Started with Django REST Framework',
                'content': '''Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Django. 
                
In this tutorial, we'll cover the basics of setting up DRF, creating serializers, views, and API endpoints.

## Installation

First, install Django REST Framework:
```bash
pip install djangorestframework
```

## Basic Setup

Add 'rest_framework' to your INSTALLED_APPS in settings.py, and you're ready to go!

## Creating Your First API

Start by creating a serializer for your model, then create viewsets or API views to handle requests.

This is just the beginning - DRF offers many powerful features like authentication, permissions, pagination, and more.''',
                'author_username': 'sarah_tech',
                'category_name': 'Django',
                'is_published': True,
                'days_ago': 5,
            },
            {
                'title': 'Understanding Python Decorators',
                'content': '''Python decorators are a powerful feature that allows you to modify the behavior of functions or classes.

## What are Decorators?

Decorators are functions that wrap other functions, adding functionality without modifying the original function's code.

## Basic Example

```python
def my_decorator(func):
    def wrapper():
        print("Something is happening before the function is called.")
        func()
        print("Something is happening after the function is called.")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
```

Decorators are widely used in frameworks like Flask and Django for route handling, authentication, and more.''',
                'author_username': 'john_doe',
                'category_name': 'Python',
                'is_published': True,
                'days_ago': 10,
            },
            {
                'title': 'Modern Web Development Best Practices',
                'content': '''Web development has evolved significantly over the years. Here are some best practices to follow in 2024:

## 1. Responsive Design
Always design with mobile-first approach. Your website should work seamlessly across all devices.

## 2. Performance Optimization
- Minimize HTTP requests
- Use CDN for static assets
- Implement lazy loading
- Optimize images

## 3. Security
- Always use HTTPS
- Implement proper authentication
- Sanitize user inputs
- Keep dependencies updated

## 4. Code Quality
- Write clean, readable code
- Follow coding standards
- Use version control
- Write tests

These practices will help you build better, more maintainable web applications.''',
                'author_username': 'jane_smith',
                'category_name': 'Web Development',
                'is_published': True,
                'days_ago': 3,
            },
            {
                'title': 'Building RESTful APIs with Django',
                'content': '''RESTful APIs are the backbone of modern web applications. Django makes it easy to build robust APIs.

## Key Concepts

- **Resources**: Everything is a resource (users, posts, etc.)
- **HTTP Methods**: Use GET, POST, PUT, DELETE appropriately
- **Status Codes**: Return proper HTTP status codes
- **JSON**: Use JSON for data exchange

## Best Practices

1. Use proper HTTP methods
2. Return appropriate status codes
3. Implement pagination for large datasets
4. Add filtering and searching capabilities
5. Document your API

With Django REST Framework, you can build production-ready APIs quickly and efficiently.''',
                'author_username': 'sarah_tech',
                'category_name': 'Django',
                'is_published': True,
                'days_ago': 7,
            },
            {
                'title': 'Python List Comprehensions Explained',
                'content': '''List comprehensions are a concise way to create lists in Python. They're more readable and often faster than traditional loops.

## Basic Syntax

```python
# Traditional approach
squares = []
for x in range(10):
    squares.append(x**2)

# List comprehension
squares = [x**2 for x in range(10)]
```

## With Conditions

```python
# Even numbers only
evens = [x for x in range(20) if x % 2 == 0]

# Nested comprehensions
matrix = [[i*j for j in range(3)] for i in range(3)]
```

List comprehensions are a Pythonic way to write clean, efficient code.''',
                'author_username': 'alex_writer',
                'category_name': 'Python',
                'is_published': True,
                'days_ago': 12,
            },
            {
                'title': 'Draft: Advanced Django Performance Tips',
                'content': '''This is a draft article about Django performance optimization. It's not yet published.

We'll cover:
- Database query optimization
- Caching strategies
- Async views
- Connection pooling

Stay tuned for the full article!''',
                'author_username': 'john_doe',
                'category_name': 'Django',
                'is_published': False,
                'days_ago': 1,
            },
            {
                'title': 'Draft: My Journey into Web Development',
                'content': '''This is a personal story about my journey into web development. Still working on it!''',
                'author_username': 'jane_smith',
                'category_name': 'Lifestyle',
                'is_published': False,
                'days_ago': 2,
            },
            {
                'title': 'Introduction to React for Django Developers',
                'content': '''If you're a Django developer looking to add interactivity to your frontend, React is a great choice.

## Why React?

React allows you to build dynamic user interfaces while Django handles the backend. This separation of concerns makes your application more maintainable.

## Getting Started

1. Set up a React project
2. Create API endpoints in Django
3. Connect React to your Django API
4. Build your components

## Example Integration

You can use tools like Django REST Framework to create APIs that React can consume. This creates a powerful full-stack application.

This is just the beginning - there's much more to explore!''',
                'author_username': 'sarah_tech',
                'category_name': 'Web Development',
                'is_published': True,
                'days_ago': 15,
            },
            {
                'title': 'Python Virtual Environments: A Complete Guide',
                'content': '''Virtual environments are essential for Python development. They allow you to isolate project dependencies.

## Creating a Virtual Environment

```bash
python -m venv myenv
```

## Activating (Windows)
```bash
myenv\Scripts\activate
```

## Activating (Linux/Mac)
```bash
source myenv/bin/activate
```

## Installing Packages

```bash
pip install package_name
```

## Best Practices

- Always use virtual environments
- Create a requirements.txt file
- Don't commit the virtual environment folder
- Use different environments for different projects

Virtual environments help keep your projects organized and dependencies isolated.''',
                'author_username': 'alex_writer',
                'category_name': 'Python',
                'is_published': True,
                'days_ago': 8,
            },
            {
                'title': 'Django Models: Relationships and Best Practices',
                'content': '''Django models define the structure of your database. Understanding relationships is crucial.

## Types of Relationships

1. **One-to-Many (ForeignKey)**: A post belongs to one author
2. **Many-to-Many**: A post can have many tags
3. **One-to-One**: A user has one profile

## Best Practices

- Use related_name for reverse relationships
- Add indexes for frequently queried fields
- Use select_related() and prefetch_related() to optimize queries
- Set appropriate on_delete behaviors

## Example

```python
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag)
```

Understanding these relationships will help you build better Django applications.''',
                'author_username': 'john_doe',
                'category_name': 'Django',
                'is_published': True,
                'days_ago': 6,
            },
        ]

        posts = []
        now = timezone.now()

        for data in posts_data:
            try:
                author = User.objects.get(username=data['author_username'])
                category = Category.objects.get(name=data['category_name'])
                
                created_at = now - timedelta(days=data['days_ago'])
                published_at = created_at if data['is_published'] else None

                post, created = Post.objects.get_or_create(
                    title=data['title'],
                    defaults={
                        'content': data['content'],
                        'author': author,
                        'category': category,
                        'is_published': data['is_published'],
                        'created_at': created_at,
                        'published_at': published_at,
                    }
                )
                if created:
                    posts.append(post)
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  User {data["author_username"]} not found, skipping post'))
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  Category {data["category_name"]} not found, skipping post'))

        return posts

