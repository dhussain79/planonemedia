# PlanOneMedia â€” Drupal 11 Rebuild Plan

> **Created:** 2026-05-30
> **Project Directory:** `Opencode/PlanOneMedia/`
> **Legacy Source:** `Opencode/foldedup/` (Drupal 7 backup)
> **Status:** Planning â€” Awaiting approval to begin Phase 1

---

## 1. Project Overview

**PlanOneMedia** is an Traditional & Digital Media Trading Platform for the KSA & GCC Media Suppliers, Agencies and Client. The legacy site (foldedup.com) was built on Drupal 7 and contains **1,600+ media listings** with supplier data, rate cards, taxonomy, and media assets.

### Goal
Rebuild PlanOneMedia on **Drupal 11** using best practices, migrating only the **database content and media assets** from the D7 site â€” no legacy functionality, modules, or themes.

### What We're Migrating
- âœ… Content nodes (media listings, pages, articles)
- âœ… Users (supplier/media owner accounts)
- âœ… Taxonomy terms (media types, regions, cities)
- âœ… Media files (images, documents from `sites/default/files/`)


### What We're NOT Migrating
- âŒ D7 modules or their configuration
- âŒ D7 themes or templates
- âŒ D7 views, blocks, or page layouts
- âŒ D7 contrib module settings (domain_301_redirect, etc.)

---

## 2. Design Decisions (from /grill-me Interview)

| Decision | Choice | Rationale |
|---|---|---|
| **Platform** | Drupal 11 (latest stable) | Best practices for Drupal development; natural D7â†’D11 migration path |
| **Local Dev Environment** | DDEV | Drupal community standard; wraps Docker; `ddev start/drush/composer` |
| **Project Directory** | `Opencode/PlanOneMedia/` | Clean separation from legacy D7 in `foldedup/` |
| **Composer Template** | `drupal/recommended-project` | Official template; `web/` docroot; clean `.gitignore` |
| **Database Engine** | MySQL 8.0+ | Direct compatibility with D7 MySQL dump; more common in hosting |
| **Migration Strategy** | Drupal Migrate API (D7â†’D11) | Built-in `migrate_drupal` + `migrate_plus` + `migrate_tools`; reads D7 DB and creates clean D11 content |
| **Frontend/Theme** | Custom theme via Starterkit generator | Clean Twig templates; modern CSS/JS; no third-party dependency |
| **Multilingual** | Arabic + English from the start | GCC market requires Arabic; RTL in custom theme; core multilingual modules |
| **Version Control** | GitHub (`dhussain79/planonemedia`) | Backup existing Next.js work first, then fresh D11 codebase |
| **Site Machine Name** | `planonemedia` | Database name, DDEV project name, internal identifiers |
| **Development Approach** | Phase-based (4 phases) | Foundation â†’ Data Migration â†’ Core Features â†’ Business Logic |

---

## 3. Technology Stack

### Core
| Component | Technology | Version |
|---|---|---|
| CMS | Drupal | 11.x (latest stable) |
| PHP | PHP | 8.3+ |
| Database | MySQL | 8.0+ |
| Web Server | Nginx (via DDEV) | Latest |
| Package Manager | Composer | 2.x |
| CLI Tool | Drush | 13.x |
| Local Dev | DDEV | Latest |
| AI/Agent Integration | Drupal MCP (`mcp_server`) | ^1.0 |
| Version Control | Git + GitHub | â€” |

### Key Drupal Modules (Planned)
| Module | Purpose |
|---|---|
| `drupal/core` (media, views, content_translation, locale) | Core functionality |
| `drupal/migrate_drupal` | D7â†’D11 migration framework |
| `drupal/migrate_plus` | Extended migration source plugins |
| `drupal/migrate_tools` | Drush migration commands |
| `drupal/pathauto` | Automatic URL aliases |
| `drupal/metatag` | SEO meta tags |
| `drupal/paragraphs` | Flexible content composition |
| `drupal/admin_toolbar` | Enhanced admin navigation |
| `drupal/config_split` | Environment-specific config |
| `drupal/stage_file_proxy` | Proxy production files in dev |
| `drupal/webform` | Form builder (contact, inquiries) |
| `drupal/mcp_server` | **MCP (Model Context Protocol) server** â€” exposes Drupal as tools/resources for AI agents |
| `drupal/search_api` + `drupal/search_api_solr` | Advanced search (Phase 3) |
| `drupal/geofield` + `drupal/leaflet` | Map-based discovery (Phase 3) |
| `drupal/entity_print` | PDF invoice generation (Phase 4) |

---

## 4. Development Phases

### Phase 1 â€” Foundation (Week 1-2)

**Goal:** Scaffold a working Drupal 11 site with DDEV, custom theme, multilingual support, and content types.

#### 1.1 Environment Setup
- [x] Install DDEV on Windows (requires Docker Desktop)
- [x] Create DDEV project in `PlanOneMedia/` with `ddev config --project-type=drupal --php-version=8.3 --database=mysql:8.0`
- [x] Scaffold Drupal 11 via `ddev composer create drupal/recommended-project`
- [x] Verify site loads at `https://planonemedia.ddev.site`
- [x] Install Drush: `ddev composer require drush/drush`
- [x] Run Drupal installation: `ddev drush site:install --db-url=mysql://db:db@db/db`

#### 1.2 Agentic Development â€” Drupal MCP Setup

**Goal:** Install and configure Drupal MCP so AI agents (OpenCode, Claude Code) can directly interact with the Drupal site â€” creating content types, adding fields, managing config, running Drush â€” all from the chat without the UI.

- [x] Install MCP Server module: `ddev composer require 'drupal/mcp_server:^1.0'`
- [x] Install Tool API module: `ddev composer require 'drupal/simple_oauth_21:^1.0' 'drupal/tool_api:^1.0'`
- [x] Enable modules: `ddev drush en mcp_server simple_oauth_21 tool_api -y`
- [x] Create dedicated MCP user with `Use MCP server` permission
- [ ] Generate OAuth2 tokens for MCP authentication
- [x] Verify MCP endpoint responds: `curl https://planonemedia.ddev.site/_mcp`
- [ ] Test with MCP Inspector: `npx @modelcontextprotocol/inspector`
- [x] Configure OpenCode `opencode.json` to connect to Drupal MCP:
  ```json
  {
    "mcpServers": {
      "drupal": {
        "command": "docker",
        "args": [
          "run", "-i", "--rm",
          "-e", "DRUPAL_AUTH_USER",
          "-e", "DRUPAL_AUTH_PASSWORD",
          "--network=host",
          "ghcr.io/omedia/mcp-server-drupal:latest",
          "--drupal-url=https://planonemedia.ddev.site",
          "--unsafe-net"
        ],
        "env": {
          "DRUPAL_AUTH_USER": "mcp_user",
          "DRUPAL_AUTH_PASSWORD": "<generated-password>"
        }
      }
    }
  }
  ```
- [ ] Verify agent can list available tools: content type CRUD, field management, block config, cache rebuild, etc.
- [ ] Document available MCP tools and their usage for the team

> **Why this matters:** With MCP, the AI agent becomes a first-class Drupal developer â€” it can scaffold content types, add fields, configure views, run migrations, and debug issues without context-switching to the browser. Every phase below assumes MCP is available.

#### 1.3 Version Control
- [ ] Backup existing Next.js code from `dhussain79/planonemedia` repo (tag/branch `nextjs-archive`)
- [ ] Initialize fresh Git in `PlanOneMedia/`
- [ ] Push to GitHub `dhussain79/planonemedia` on a new `drupal-11` branch (or reset `main`)

#### 1.4 Custom Theme
- [ ] Generate custom theme: `ddev drush generate theme` or use Starterkit
- [ ] Theme name: `planonemedia_theme`
- [ ] Set up SCSS/CSS build pipeline (or use vanilla CSS)
- [ ] Configure RTL stylesheet support for Arabic
- [ ] Create base layout templates (page, header, footer, navigation)

#### 1.5 Multilingual Setup
- [ ] Enable core modules: `locale`, `language`, `content_translation`, `interface_translation`
- [ ] Add Arabic language
- [ ] Set English as default, Arabic as secondary
- [ ] Configure language detection (URL prefix: `/ar/`, `/en/`)
- [ ] Import Arabic translations

#### 1.6 Content Types
Based on the D7 database structure, create these content types:

- [ ] **Media Listing** â€” The core entity (maps to D7 media/OOH nodes)
  - Title, Description (translatable)
  - Media type (taxonomy reference)
  - Location (region, city, geo coordinates)
  - Rate card (pricing fields)
  - Images (media reference, multiple)
  - Supplier (entity reference to user/supplier profile)
  - Status (available, booked, maintenance)

- [ ] **Supplier Profile** â€” Media owner/company
  - Company name, contact info
  - Logo, description
  - Portfolio (reference to their listings)

- [ ] **Page** â€” Static pages (About, Contact, Terms)
- [ ] **Article** â€” News/blog posts

#### 1.7 Taxonomy
- [ ] Media Type (Billboard, Unipole, Digital Screen, Bridge Banner, etc.)
- [ ] Region (KSA, UAE, Bahrain, Kuwait, Oman, Qatar)
- [ ] City (Riyadh, Jeddah, Dubai, etc.)
- [ ] Listing Status (Available, Booked, Under Maintenance)

---

### Phase 2 â€” Data Migration (Week 3-4)

**Goal:** Import D7 content, users, and media files into the fresh D11 site using Drupal's Migrate API.

#### 2.1 Prerequisites
- [ ] Install migration modules: `migrate_drupal`, `migrate_plus`, `migrate_tools`
- [ ] Start D7 Docker stack: `docker compose up -d` (from `foldedup/deploy/`)
- [ ] Configure D11 to connect to D7 database as migration source
- [ ] Copy D7 `sites/default/files/` to accessible location for file migration

#### 2.2 Database Assessment
- [ ] Run `ddev drush migrate:upgrade --legacy-db-url=... --configure-only` to generate migration configs
- [ ] Review generated migration YAML files
- [ ] Identify content types and their field mappings
- [ ] Assess data quality â€” run SQL queries to check:
  - Total nodes by content type
  - Nodes with missing required fields
  - Users with valid email addresses
  - File references integrity
  - Taxonomy term usage

#### 2.3 Migration Execution
- [ ] Migrate users first (supplier accounts)
- [ ] Migrate taxonomy terms (media types, regions, cities)
- [ ] Migrate files and media entities
- [ ] Migrate content nodes (media listings)
- [ ] Run `ddev drush migrate:status` to verify
- [ ] Rollback and re-run as needed for data cleanup

#### 2.4 Data Cleanup
- [ ] Remove test/spam content
- [ ] Normalize inconsistent data formats
- [ ] Verify media file integrity
- [ ] Update broken internal links
- [ ] Generate URL aliases with Pathauto

---

### Phase 3 â€” Core Features (Week 5-8)

**Goal:** Build the user-facing features that make PlanOneMedia a functional marketplace.

#### 3.1 Listing Discovery
- [ ] Views for browsing media listings (grid + list + map)
- [ ] Faceted search (by type, region, city, price range)
- [ ] Map-based discovery with Leaflet/Mapbox
- [ ] Individual listing detail pages
- [ ] Image galleries with lightbox

#### 3.2 Supplier Features
- [ ] Supplier profile pages
- [ ] Supplier dashboard (manage own listings)
- [ ] Listing CRUD for authenticated suppliers
- [ ] Media upload workflow

#### 3.3 Search
- [ ] Search API with Solr or Database backend
- [ ] Autocomplete search
- [ ] Saved searches / alerts

#### 3.4 User Experience
- [ ] Responsive design (mobile-first)
- [ ] RTL layout for Arabic
- [ ] Language switcher
- [ ] Breadcrumbs and navigation
- [ ] SEO (metatags, structured data, XML sitemap)

---

### Phase 4 â€” Business Logic (Week 9-12+)

**Goal:** Add the marketplace-specific business features.

#### 4.1 Booking Workflow
- [ ] Booking request form
- [ ] Availability calendar per listing
- [ ] Booking status tracking (requested â†’ confirmed â†’ completed)
- [ ] Email notifications to supplier and buyer

#### 4.2 Invoicing
- [ ] PDF invoice generation with VAT
- [ ] Direct bank transfer instructions
- [ ] Invoice history for buyers and suppliers

#### 4.3 Communication
- [ ] Contact form per listing
- [ ] Mass email capabilities for media owner outreach
- [ ] Notification system

#### 4.4 Analytics & Admin
- [ ] Admin dashboard with key metrics
- [ ] Listing performance analytics
- [ ] User activity reports

---

## 5. Legacy Site Reference

### D7 Database Summary
| Property | Value |
|---|---|
| SQL Dump | `foldedup/backup/planonem_foldedup.sql` (635MB) |
| Source Code | `foldedup/deploy/` (extracted D7 site) |
| Tables | 227 (prefix: `drup_`) |
| Docker Stack | PHP 7.4 + MariaDB 10.5 |
| Containers | `foldedup-web` (8080), `foldedup-db` (3307) |
| Credentials | root / root / planonem_foldedup |
| Admin User | administrator / dan@foldedup.com |
| Restart Command | `docker compose up -d` (from `foldedup/deploy/`) |

### D7 Contrib Modules (93 installed)
Key modules that indicate site functionality:
- **Content:** `cck`, `references`, `field_group`, `paragraphs` (via entity)
- **Views/Display:** `views`, `views_php`, `views_litepager`, `jcarousel`
- **Media:** `lightbox2`, `imagecache_actions`, `video_filter`
- **Search:** `apachesolr`, `apachesolr_autocomplete`, `finder`
- **SEO:** `metatag`, `metatags_quick`, `pathauto`, `xmlsitemap`, `globalredirect`
- **Forms:** `webform`, `captcha`, `contact_attach`
- **Social:** `easy_social`, `twitter`, `views_fb_like`
- **Commerce:** `ms_core`, `ms_membership`, `currency`, `fivestar`, `votingapi`
- **Navigation:** `responsive_menus`, `responsive_navigation`, `responsive_dropdown_menus`
- **Responsive:** `responsive_tables`, `responsive_tables_filter`, `zurb_responsive_tables`, `footable`
- **Taxonomy:** `taxonomy_manager`, `taxonomy_menu`, `term_reference_tree`, `similarterms`
- **Admin:** `admin_menu`, `module_filter`, `switchtheme`
- **Email:** `mailsystem`, `mailmime`
- **Ads:** `simpleads`
- **User:** `logintoboggan`, `invite`, `revisioning`

### D7 Themes
- `corp`, `malinis`, `mayo`, `newsflash`, `omega`, `pro`, `zurb-foundation`

---

## 6. GitHub Repo Strategy

### Current State
- Repo: `dhussain79/planonemedia`
- Contains: Next.js + Prisma + Neon scaffold
- Deployed: https://planonemedia.vercel.app

### Plan
1. **Backup current work:**
   - Create Git tag: `v0-nextjs-archive`
   - Create branch: `archive/nextjs-prisma`
   - Already have local backup in `p1mpm/planonemedia-alpha/` and `p1mpm/planonemedia-beta/`

2. **Fresh Drupal 11 codebase:**
   - Option A: New `main` branch with Drupal 11 (force-push after archiving)
   - Option B: New `drupal-11` branch, switch default branch later
   - Recommended: **Option B** â€” safer, preserves history

---

## 7. File Structure (After Phase 1)

```
PlanOneMedia/
â”œâ”€â”€ .ddev/                        # DDEV config (committed)
â”‚   â”œâ”€â”€ config.yaml
â”‚   â””â”€â”€ docker-compose.*.yaml
â”œâ”€â”€ .opencode/                    # OpenCode config (committed)
â”‚   â””â”€â”€ opencode.json             # MCP server config for Drupal
â”œâ”€â”€ .claude/                      # Claude Code config (committed)
â”‚   â””â”€â”€ settings.local.json       # MCP server config for Drupal
â”œâ”€â”€ config/                       # Drupal config export (committed)
â”‚   â””â”€â”€ sync/
â”œâ”€â”€ web/                          # Drupal docroot
â”‚   â”œâ”€â”€ core/                     # Drupal core (not committed)
â”‚   â”œâ”€â”€ modules/
â”‚   â”‚   â”œâ”€â”€ contrib/              # Composer-managed modules
â”‚   â”‚   â””â”€â”€ custom/               # Custom modules
â”‚   â”‚       â””â”€â”€ planonemedia_core/ # Project-specific logic
â”‚   â”œâ”€â”€ themes/
â”‚   â”‚   â””â”€â”€ custom/
â”‚   â”‚       â””â”€â”€ planonemedia_theme/ # Custom theme
â”‚   â”œâ”€â”€ sites/
â”‚   â”‚   â””â”€â”€ default/
â”‚   â”‚       â”œâ”€â”€ files/            # Uploaded files (not committed)
â”‚   â”‚       â””â”€â”€ settings.php
â”‚   â””â”€â”€ index.php
â”œâ”€â”€ vendor/                       # Composer deps (not committed)
â”œâ”€â”€ composer.json
â”œâ”€â”€ composer.lock
â”œâ”€â”€ .gitignore
â”œâ”€â”€ plan.md                       # This file
â””â”€â”€ README.md
```

---

## 8. Interview Log (Design Decisions)

### Session â€” 2026-05-30

**Q1: Technology platform?**
> **A:** Drupal 11 (latest stable) â€” Modern Drupal with Composer, Twig templates, config management. Best path for reusing D7 database structure and media assets.

**Q2: Local development environment?**
> **A:** DDEV â€” Purpose-built for Drupal. One-command setup, automatic Composer/Drush/Xdebug, `.ddev/` config committed to repo.

**Q3: Project directory?**
> **A:** `Opencode/PlanOneMedia/` â€” Clean start, separate from D7 backup.

**Q4: Drupal project template?**
> **A:** `drupal/recommended-project` â€” Official Composer template. Clean `web/` docroot, separate `vendor/`, proper `.gitignore`.
> *Context:* User deferred to analysis of project plans in `p1mpm/`. After reviewing the OOH Media marketplace requirements (1,600+ listings, suppliers, multilingual, maps), recommended against distributions (Varbase, Thunder) in favor of clean template with targeted contrib modules.

**Q5: Database engine?**
> **A:** MySQL 8.0+ â€” Direct compatibility with D7 dump; more common in hosting.

**Q6: Migration strategy?**
> **A:** Drupal Migrate API (D7â†’D11) â€” Built-in `migrate_drupal` + `migrate_plus` + `migrate_tools`. User noted database may need significant cleanup.

**Q7: Frontend/theme approach?**
> **A:** Custom theme built from scratch using Drupal 11's Starterkit generator. Clean Twig templates, modern CSS/JS, no third-party dependency.

**Q8: Multilingual support?**
> **A:** Arabic + English from the start â€” Core multilingual modules, RTL in custom theme, URL prefix detection (`/ar/`, `/en/`).

**Q9: Version control?**
> **A:** GitHub (`dhussain79/planonemedia`) â€” Backup existing Next.js work first (tag + branch), then fresh D11 codebase.

**Q10: Development phasing?**
> **A:** Phase-based â€” Foundation â†’ Data Migration â†’ Core Features â†’ Business Logic.

**Q11: Site machine name?**
> **A:** `planonemedia` â€” Database name, DDEV project name, internal identifiers.

**Q12: AI agent integration for development?**
> **A:** Drupal MCP (`mcp_server` module) â€” Install in Phase 1 so AI agents can create content types, manage config, run migrations, and execute Drush commands directly from the chat. This enables fully agentic development across all phases.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| D7 database has corrupt/incomplete data | High | Medium | Phase 2 data assessment queries before migration; cleanup scripts |
| DDEV/Docker performance on Windows | Medium | Low | WSL2 backend for Docker Desktop; DDEV mutagen for file sync |
| D7 content types don't map cleanly to D11 | Medium | Medium | Generate migration configs first (`--configure-only`), review before executing |
| Media files missing or broken references | Medium | Medium | File integrity check script in Phase 2; `stage_file_proxy` for dev |
| Arabic translations incomplete | Low | Low | Import community translations; manual review for custom strings |
| Custom theme development slower than expected | Medium | Medium | Start with minimal viable theme; iterate |
| Drupal MCP module not stable | Medium | Medium | Fallback: use `jsonrpc_mcp` module or Docker-based `mcp-server-drupal` container |
| MCP OAuth setup complexity | Low | Low | Document token generation steps; test with MCP Inspector first |

---

## 10. Agentic Development & Drupal MCP Best Practices

To fully leverage AI agents (like OpenCode, Claude Code, or Cursor) in customizing Drupal 11, we will implement the **Model Context Protocol (MCP)** and follow industry best practices for 2025/2026.

### 10.1 What is MCP for Drupal?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that enables AI agents to securely interact with Drupal's data, configuration, and tools. By installing the `mcp_server` and `tool_api` modules, Drupal becomes an active "orchestration layer." 

AI agents can directly:
- **Manage content types** (Create, read, update fields and entity types)
- **Run Drush commands** (Cache rebuild, config import, cron)
- **Manage configuration** (Read/write Drupal config YAML)
- **Query content** (Search nodes, users, taxonomy)
- **Run migrations** (Execute and monitor D7â†’D11 migration)

### 10.2 Best Practices for Customizing Drupal using Agents

To ensure maintainable, secure, and high-quality AI-driven development, we will adopt the following architectural and workflow patterns:

#### A. Governance and Security
- **Narrow Surface Area:** Do not expose the entire site unconditionally. Use **Simple OAuth 2.1** to grant agents "least privilege" access to only the tools needed for the current task.
- **Audit Trails:** Ensure all agent actions (e.g., config changes, node creation via MCP) are logged. Consider an MCP Audit module pattern so AI actions are traceable independently of regular user watchdog logs.
- **Automated Validation (Agentic-First):** Before the agent commits configuration changes or new PHP modules, it must automatically run PHPUnit or Vitest tests to validate its output.

#### B. Architecture & Code Organization
- **Decouple Logic and Orchestration:** Use custom Drupal modules as thin "protocol adapter" boundaries. Keep editorial rendering concerns (Twig templates, CSS) strictly separate from agent orchestration logic.
- **Composable Tool Plugins:** Instead of writing one-off Drush scripts, the agent should create reusable "Tool API" plugins that can be exposed back via MCP, expanding its own capabilities recursively.

#### C. Agent Design Patterns & AGENTS.md
- **Standardized Instructions:** We will maintain an `AGENTS.md` file in the project root. This file provides specific coding standards, schema details, and environmental constraints so the AI agent always has context on *how* to write code for this specific Drupal project.
- **Hierarchical Delegation:** For complex tasks (like building the booking workflow), the main agent acts as the "Assistant" orchestrator, delegating specific sub-tasks (like creating the PDF invoice plugin) to specialized sub-agents.

### 10.3 Workflow Impact Per Phase

| Phase | Traditional Workflow | Agent-Assisted Workflow (with MCP) |
|-------|------------|----------|
| **P1: Foundation** | Manually click through UI to create content types and fields. | Agent scaffolds content types + fields in seconds via MCP tools, applying best practice naming conventions. |
| **P2: Migration** | Write migration YAML files manually, guess field mappings. | Agent inspects D7 DB, auto-generates migration configs, runs `drush migrate:import`, and iteratively fixes errors. |
| **P3: Features** | Build Views in UI, configure Search API manually. | Agent creates Views config YAML, sets up Search API indexes, and configures facets directly. |
| **P4: Business Logic** | Write custom PHP modules, forms, and services by hand. | Agent reads `AGENTS.md` standards, generates module scaffold, writes hooks/plugins, and validates them with tests. |

### 10.4 Configuration Files

The MCP client configuration lives in the repository so all team members (and AI agents) share the same integration:
- **OpenCode:** `PlanOneMedia/.opencode/opencode.json` (or root `opencode.json`)
- **Claude Code:** `PlanOneMedia/.claude/settings.local.json`
- **Cursor:** `PlanOneMedia/.cursor/mcp.json`

---

## 11. Next Steps

1. **Approve this plan** â€” Review and confirm decisions
2. **Install DDEV** â€” `choco install ddev` or manual install
3. **Scaffold Drupal 11** â€” `ddev config` + `ddev composer create`
4. **Install Drupal MCP** â€” `ddev composer require drupal/mcp_server` + configure agent connection
5. **Begin Phase 1** â€” Content types, taxonomy, theme, multilingual (using MCP tools)

---

*This plan will be updated as we progress through each phase.*

