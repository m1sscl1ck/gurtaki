# Fixtures Directory

This directory can contain Django fixture files (JSON, XML, or YAML) for loading test data.

## Using Fixtures

To load fixtures, use Django's `loaddata` command:

```bash
python manage.py loaddata fixture_name.json
```

## Note

Due to the complexity of relationships (foreign keys) and password hashing in the User model, the **management command approach** (`seed_data`) is recommended over fixtures for this project.

The `seed_data` management command handles:
- Proper password hashing for users
- Foreign key relationships automatically
- Date/time fields correctly
- Avoiding duplicates

## Creating Fixtures

If you want to create fixtures from existing data:

```bash
python manage.py dumpdata api.Category --indent 2 > api/fixtures/categories.json
python manage.py dumpdata api.Post --indent 2 > api/fixtures/posts.json
```

**Note:** User fixtures require special handling due to password hashing.

