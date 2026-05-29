---
name: drupal-local-deploy
description: Expert guidance for deploying Drupal sites locally from a backup. Covers Drupal 7 (no Composer, .zip archives, Drush 8) and D8+ (Composer, Drush 9+). Database import, files sync, Drush post-restore commands, environment config (Docker/Lando/DDEV/XAMPP), and troubleshooting.
---

# Drupal Local Deployment from Backup

Full workflow for restoring a Drupal site backup to a local development environment.

## When to use

- User has a Drupal backup (DB dump + files + code) and wants to run it locally
- User needs to migrate a live/production Drupal site to a local dev environment
- User needs to restore from a backup after a crash or environment move

## Anatomy of a Drupal backup

A complete Drupal backup has 3 components:

| Component | Typical format | What it contains |
|-----------|---------------|------------------|
| **Database** | `.sql`, `.sql.gz`, `.zip` | All content, config, users, taxonomy |
| **Files** | `.tar.gz`, `.zip`, directory copy | `sites/default/files/` — uploaded images, docs, etc. |
| **Code** | Git repo, `.tar.gz`, Composer-managed | Core, modules, themes, profiles, `composer.json` + `composer.lock` |

## Environment options (choose one)

### Option A: Lando (recommended for most Drupal sites)
- Requires Docker Desktop
- `.lando.yml` in project root configures the stack
- Native `lando db-import`, `lando drush` commands

### Option B: DDEV
- Requires Docker Desktop
- `.ddev/config.yaml` in project root
- `ddev import-db`, `ddev import-files`

### Option C: Docker Compose
- Custom `docker-compose.yml` with Nginx, PHP-FPM, MariaDB/PostgreSQL
- Manual service management

### Option D: XAMPP/WAMP (legacy, no Docker)
- Native PHP + MySQL on Windows
- No container isolation

## Step-by-step restore workflow

### 1. Set up the environment

If using **Lando**:
```bash
lando init
# Choose recipe: drupal10, drupal11, or custom
lando start
```

If using **DDEV**:
```bash
ddev config --project-type=drupal
ddev start
```

If starting fresh with **Docker Compose**, create `docker-compose.yml` with:
- Nginx or Apache web server
- PHP-FPM (matching the Drupal version's PHP requirement)
- MariaDB or PostgreSQL (matching the source DB type)
- Redis (optional, for cache)

### 2. Restore the code

**From a Git repository:**
```bash
git clone <repo-url> .
git checkout <branch>
```

**From a compressed archive:**
```bash
tar -xzf drupal-code.tar.gz .
# or on Windows:
# Use 7-Zip or tar -xzf
```

### 3. Install Composer dependencies
```bash
composer install --no-dev
# or if no composer.lock:
composer install
```

Common issues:
- PHP version mismatch — check `composer.json` `require.php` and match local PHP
- Missing extensions — Drupal needs: `pdo`, `mysql`/`pgsql`, `gd`, `curl`, `xml`, `mbstring`, `opcache`
- Memory limit — use `COMPOSER_MEMORY_LIMIT=-1 composer install`

### 4. Configure local settings

Create or edit `web/sites/default/settings.local.php` (or the equivalent path):

```php
<?php
$databases['default']['default'] = [
  'database' => 'drupal',
  'username' => 'drupal',
  'password' => 'drupal',
  'host' => 'localhost',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
];

$settings['hash_salt'] = 'local-dev-only-hash';

// Local dev overrides
$settings['skip_permissions_hardening'] = TRUE;
$settings['config_readonly'] = FALSE;
$settings['container_yamls'][] = DRUPAL_ROOT . '/sites/development.services.yml';

// Show all errors
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);
$config['system.logging']['error_level'] = 'verbose';
```

If using **Lando**, the `settings.local.php` should reference Lando's service names:
```php
$databases['default']['default'] = [
  'database' => 'drupal',
  'username' => 'drupal',
  'password' => 'drupal',
  'host' => 'database',    // Lando service name
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
];
```

If using **DDEV**, the database credentials are auto-configured.

### 5. Import the database

**With Lando:**
```bash
lando db-import path/to/database.sql
# or for gzipped:
lando db-import path/to/database.sql.gz
```

**With DDEV:**
```bash
ddev import-db --src=path/to/database.sql
```

**With Drush directly:**
```bash
drush sql:drop -y
drush sql:cli < path/to/database.sql
# or
drush sql:query --file=path/to/database.sql
```

**Using MySQL CLI directly:**
```bash
mysql -u drupal -p drupal < path/to/database.sql
```

### 6. Restore files

Copy the `sites/default/files/` directory (or `web/sites/default/files/` depending on docroot):

```bash
# From archive
tar -xzf files.tar.gz -C web/sites/default/

# From directory copy
cp -r /backup/files/* web/sites/default/files/

# Using rsync
rsync -avz /backup/files/ web/sites/default/files/
```

Set correct permissions:
```bash
chmod -R 755 web/sites/default/files/
# or on Windows, ensure the web server user has write access
```

### 7. Run post-restore Drush commands

```bash
# Run pending database updates
drush updb -y

# Import configuration (if config split is used)
drush cim -y

# Clear all caches
drush cr

# Rebuild node access permissions
drush php-eval 'node_access_rebuild();'

# Check status
drush status
```

### 8. Verify the site

```bash
# Generate a one-time login link
drush uli

# Check for warnings/errors
drush watchdog:show

# Verify all core modules
drush pm-list --status=enabled --type=module
```

## Troubleshooting common issues

### "The website encountered an unexpected error"
- Check PHP error log: `drush watchdog:show --severity=error`
- Check Drupal log at `/admin/reports/dblog`
- Common cause: PHP extension missing, database credentials wrong, file permissions

### "Class not found" / autoload errors
```bash
composer dump-autoload
drush cr
```

### Database connection refused
- Check DB service is running
- Verify credentials in `settings.local.php`
- For Docker: container names > `localhost` — use the database service name
- For Lando/DDEV: use the provided env vars

### "The provided hash salt is not correct"
Generate a new hash salt for local:
```bash
drush php:eval "echo \Drupal\Component\Utility\Crypt::randomBytesBase64(55);"
```

### White screen after restore
- Enable error display via `settings.local.php`
- Check PHP memory limit: `memory_limit = 256M`
- Check for PHP fatal errors in the server log
- Temporarily disable all custom modules: `drush pmu module_name`

### Config import fails
- Config may be split across environments
- Run: `drush cim -y --partial` for partial imports
- Check for missing config dependencies: `drush cim -y --source=../config/sync`

### Files not showing (images broken)
- Check `sites/default/files/` exists and has content
- Verify file permissions: web server must be able to read/write
- Run: `drush php:eval "file_scan_directory('public://', '/.*/');"` to test stream wrapper
- Check `settings.php` has correct `$settings['file_public_path']`

### "Access denied" on admin pages
```bash
drush user:login
drush user:role:add 'administrator' 1
```

## Drupal 7 specific workflow (from .zip archive, no Composer)

Drupal 7 is fundamentally different from D8+:
- **No Composer** — modules are raw PHP in `sites/all/modules/`, themes in `sites/all/themes/`
- **Requires PHP 5.6–7.4** (will NOT run on PHP 8+)
- **No `drush cim`** — configuration management was introduced in D8
- **Drush 8** is the last version that supports D7
- **No `composer.json`** — no `vendor/` directory, no `composer install` step
- **`settings.php`** uses `$databases` array or legacy `$db_url`
- **Hash salt** is `$drupal_hash_salt` (string), not `$settings['hash_salt']`

### Step-by-step D7 deployment from .zip

#### 1. Extract code from .zip (preserving original backup)

```bash
# Copy the zip to a working directory first (NEVER modify the original backup)
cp /backup/site-backup.zip /working-dir/
cd /working-dir

# Extract
unzip site-backup.zip
# OR on Windows with PowerShell:
# Expand-Archive -Path site-backup.zip -DestinationPath .
```

Typical D7 zip structure:
```
foldedup/
├── sites/
│   ├── default/
│   │   ├── settings.php    # DB credentials
│   │   ├── default.settings.php
│   │   └── files/           # Uploaded files
│   └── all/
│       ├── modules/          # Contrib/custom modules
│       └── themes/           # Contrib/custom themes
├── modules/                  # Core modules
├── themes/                   # Core themes
├── includes/
├── misc/
├── index.php
├── cron.php
├── update.php
├── xmlrpc.php
├── .htaccess
└── robots.txt
```

#### 2. Skip Composer — D7 has no dependency manager

No `composer install` needed. The code is self-contained PHP.

#### 3. Configure local settings

Create `sites/default/settings.local.php` (or edit `settings.php` directly for local):

```php
<?php
$databases['default']['default'] = array(
  'driver' => 'mysql',
  'database' => 'drupal7_local',
  'username' => 'root',
  'password' => 'root',
  'host' => 'localhost',
  'port' => '',
  'prefix' => 'drup_',
);

$drupal_hash_salt = 'your-local-hash-salt';

// Local dev overrides
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);
error_reporting(E_ALL);

// Ensure update.php can run from browser when not logged in as admin
$update_free_access = TRUE; // DISABLE after running updates!
```

#### 4. Import the database

Using MySQL/MariaDB CLI:
```bash
# Create the database first
mysql -u root -p -e "CREATE DATABASE drupal7_local CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# Import the dump
mysql -u root -p drupal7_local < path/to/database.sql

# On Windows with PowerShell:
# Get-Content path\to\database.sql | mysql -u root -p drupal7_local
```

Using Drush 8 (if available):
```bash
drush sql:create -y
drush sql:cli < path/to/database.sql
```

#### 5. Update DB credentials in settings.php

Edit `sites/default/settings.php` to match your local DB:
- Update `database`, `username`, `password`, `host`
- Keep the same `prefix` value (`drup_` in this case)
- Keep the same `$drupal_hash_salt` or generate a new one

#### 6. Set up the web server

**Option A: Docker Compose with PHP 7.4 + MariaDB 10**
Create `docker-compose.yml`:
```yaml
version: '3'
services:
  web:
    image: php:7.4-apache
    ports:
      - "8080:80"
    volumes:
      - ./drupal-site:/var/www/html
      - ./docker/php.ini:/usr/local/etc/php/php.ini
    depends_on:
      - db
  db:
    image: mariadb:10.5
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: drupal7_local
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql
volumes:
  db_data:
```

**Option B: XAMPP (no Docker)**
- Install XAMPP with PHP 7.4
- Place extracted site in `C:\xampp\htdocs\foldedup\`
- Start Apache + MySQL from XAMPP Control Panel
- Access at `http://localhost/foldedup/`

#### 7. Run updates

D7 does NOT use `drush cim`. Instead:

```bash
# Run database updates via Drush 8
drush updb -y

# Clear all caches
drush cc all

# OR via browser (if no Drush):
# Visit http://localhost/foldedup/update.php
```

#### 8. Drush 8 for D7

Drush 8 is the correct version for Drupal 7:
```bash
# Install Drush 8 globally via Composer
composer global require drush/drush:8.*
# OR download phar
wget https://github.com/drush-ops/drush/releases/download/8.4.12/drush.phar
```

D7 Drush commands:
| Command | Purpose |
|---------|---------|
| `drush status` | Check install status |
| `drush updb -y` | Run DB updates |
| `drush cc all` | Clear all caches |
| `drush uli` | One-time login link |
| `drush sql:cli` | SQL query interface |
| `drush pm-list` | List modules |
| `drush pm-enable` | Enable a module |
| `drush pm-disable` | Disable a module |

#### 9. D7-specific troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| PHP Fatal error on PHP 8 | D7 incompatible with PHP 8 | Use PHP 7.4 |
| PDOException "could not find driver" | Missing PHP MySQL extension | Enable `pdo_mysql` in php.ini |
| "Database name" empty | Wrong DB creds | Check settings.php |
| White screen of death | PHP error hidden | Enable `display_errors` in settings.php |
| update.php returns 403 | `$update_free_access` is FALSE | Set to TRUE temporarily |
| "Serialization failure" on login | Session table schema mismatch | Run `drush updb -y` |

## If the backup is an archive (tgz/tar.gz from Drush archive:dump)

Drush's `archive:dump` was removed in Drush 9+. If you have an old `archive:dump` output:

```bash
# Structure of an archive-dump output:
# archive.tar.gz
# ├── code/
# ├── database/
# │   └── database.sql
# └── files/

# Extract and restore manually:
tar -xzf archive.tar.gz
# Then follow steps 2-7 above for code/database/files separately
```

Or use Drush 8 (legacy) if the archive was created with it:
```bash
drush archive:restore /path/to/archive.tar.gz --destination-path=/path/to/restore
```

## Checklist

- [ ] Backup files preserved (read-only) — working copy created separately
- [ ] Docker Desktop running OR XAMPP/WAMP installed (if using local stack)
- [ ] PHP 7.4 available (D7 — NOT PHP 8+)
- [ ] MariaDB/MySQL service running
- [ ] Code extracted from .zip to working directory
- [ ] Database created and imported
- [ ] Files restored to `sites/default/files/`
- [ ] `settings.php` configured with correct local DB creds and prefix
- [ ] (D7) `drush updb -y` OR `update.php` completed without errors
- [ ] (D8+) `drush updb -y` and `drush cim -y` completed
- [ ] `drush cc all` (D7) or `drush cr` (D8+) completed
- [ ] Site loads and admin login works via `drush uli`
