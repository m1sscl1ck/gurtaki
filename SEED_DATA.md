# Seed Data Documentation

This project includes test data seeding functionality to help you quickly set up a development environment with sample data.

## Quick Start

To seed the database with test data, simply run:

```bash
python manage.py seed_data
```

This will create:
- **4 regular users** (john_doe, jane_smith, alex_writer, sarah_tech)
- **1 admin user** (admin/admin123)
- **6 categories** (Technology, Web Development, Django, Python, Lifestyle, Tutorials)
- **10 posts** (8 published, 2 drafts) with various authors and categories

## Command Options

### Clear Existing Data

To clear existing data before seeding:

```bash
python manage.py seed_data --clear
```

**Warning:** This will delete all posts, categories, and regular users (but not superusers).

## Test Users

After seeding, you can log in with these credentials:

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full admin access

### Regular Users
All regular users have the password: `password123`

- `john_doe` - Tech enthusiast and blogger
- `jane_smith` - Content creator and digital marketer
- `alex_writer` - Professional writer and editor
- `sarah_tech` - Software engineer and tech blogger

## Sample Data Overview

### Categories
- Technology
- Web Development
- Django
- Python
- Lifestyle
- Tutorials

### Posts
The seed script creates 10 sample posts covering various topics:
- Django tutorials and guides
- Python programming articles
- Web development best practices
- Some published posts and some drafts

## Usage in Development

1. **First time setup:**
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

2. **Reset database:**
   ```bash
   python manage.py seed_data --clear
   ```

3. **Access admin panel:**
   - Go to `http://localhost:8000/admin/`
   - Login with `admin` / `admin123`

## Customization

You can modify the seed data by editing:
- `api/management/commands/seed_data.py`

The script uses `get_or_create()` methods, so running it multiple times won't create duplicates (unless you use `--clear`).

