# Database Configuration Guide

This project supports both **SQLite** (default) and **PostgreSQL** databases.

## Quick Start: Using SQLite (Default)

**No setup required!** SQLite is already configured and will work immediately.

Just run:
```bash
python manage.py migrate
```

The database file (`db.sqlite3`) will be created automatically.


## Using PostgreSQL

### Step 1: Install PostgreSQL
Make sure PostgreSQL is installed and running on your system.

### Step 2: Create the Database
Open PostgreSQL and create a database:
```sql
CREATE DATABASE gurtaki;
```

### Step 3: Set Environment Variables

**On Windows (PowerShell):**
```powershell
$env:USE_POSTGRESQL="1"
$env:DB_NAME="gurtaki"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_password_here"
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
```

**On Windows (Command Prompt):**
```cmd
set USE_POSTGRESQL=1
set DB_NAME=gurtaki
set DB_USER=postgres
set DB_PASSWORD=your_password_here
set DB_HOST=localhost
set DB_PORT=5432
```

**On Linux/Mac:**
```bash
export USE_POSTGRESQL=1
export DB_NAME=gurtaki
export DB_USER=postgres
export DB_PASSWORD=your_password_here
export DB_HOST=localhost
export DB_PORT=5432
```

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Run Migrations
```bash
python manage.py migrate
```

---

## Switching Back to SQLite

Simply unset the `USE_POSTGRESQL` environment variable or set it to `0`:
```powershell
$env:USE_POSTGRESQL="0"
```

---

## Configuration Summary

| Setting | SQLite (Default) | PostgreSQL |
|---------|-----------------|------------|
| **Setup Required** | None | Install PostgreSQL, create database |
| **Environment Variable** | None needed | `USE_POSTGRESQL=1` |
| **Best For** | Development, testing | Production, larger projects |
| **Database File** | `db.sqlite3` (auto-created) | Requires manual creation |

