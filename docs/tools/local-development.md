# Local Theme Development

The Site Swarm theme dev server lets you build and preview themes locally without connecting to the Site Swarm platform. It renders your Liquid templates with mock data and provides live reload for rapid iteration.

---

## Quick Start

```bash
# Install (choose one)
npm install -g github:clockworkempire/theme-dev   # npm (uses Docker)
gem install siteswarm-theme-dev                    # Ruby gem (native)

# Create a new theme
swarm new my-theme

# Start the dev server
cd my-theme
swarm dev

# Open http://localhost:4000
```

---

## Installation

### npm (Recommended)

Requires Docker to be installed.

```bash
npm install -g github:clockworkempire/theme-dev
```

### Ruby Gem

Native Ruby execution, no Docker required.

```bash
gem install siteswarm-theme-dev
```

### Docker (Direct)

Run without installing anything:

```bash
docker run -v $(pwd):/theme -p 4000:4000 ghcr.io/clockworkempire/theme-dev
```

### For Site Swarm Developers

Run directly from the source tree with monorepo shortcuts:

```bash
# Use theme name directly
bin/theme-dev dev blank

# Or use full path
bin/theme-dev dev themes/blank
bin/theme-dev dev lib/theme_dev_server/starters/blank
```

See [Monorepo Workflow](#for-hostnet-developers-monorepo-workflow) below for the full development workflow.

---

## CLI Commands

### `swarm new`

Create a new theme from a starter template.

```bash
swarm new my-theme
swarm new example-theme --example
```

The blank scaffold includes:
- Basic layout with HTML skeleton
- Placeholder templates (index, collection, article, 404)
- Empty sections/snippets directories
- Minimal CSS

Use `--example` for a working theme that demonstrates sections, component settings, a reusable snippet, SEO configuration, and local dataset records.

### `swarm dev`

Start the development server with live reload.

```bash
swarm dev                      # Serve current directory
swarm dev ./my-theme           # Serve specific path
swarm dev --port 3000          # Custom port
swarm dev --open               # Auto-open browser
swarm dev --host 0.0.0.0       # Bind to all interfaces
```

### `swarm update`

Pull the latest Docker image (npm users).

```bash
swarm update
```

Ruby gem users should run `gem update siteswarm-theme-dev` instead.

### `swarm version`

Show version information.

```bash
swarm version
```

### `swarm help`

Show help for all commands or a specific command.

```bash
swarm help
swarm help new
swarm help dev
```

### `swarm connect`

Connect to the Site Swarm server for remote editing via the browser-based Theme Editor. This creates a tunnel between your local files and the Site Swarm platform.

```bash
swarm connect                        # Connect using current environment
swarm connect ./my-theme             # Connect from specific path
swarm connect --env staging          # Use staging environment
swarm connect --open                 # Auto-open browser to editor
swarm connect --keepalive 60         # Custom keepalive interval (seconds)
```

When connected:
- Your local files are accessible through the Site Swarm Theme Editor
- Changes made in the browser are written to your local filesystem
- A convenience redirect runs at `http://localhost:4000` pointing to the editor
- Keepalive pings are sent every 30 seconds (configurable) to maintain the connection

**Requirements:**
- API key configured for the environment
- Account ID configured for the environment

### `swarm push`

Upload your theme to the Site Swarm server.

```bash
swarm push                           # Push current directory
swarm push ./my-theme                # Push specific path
swarm push --env production          # Push to production environment
swarm push --create                  # Create a new theme
swarm push --theme-id abc123         # Update existing theme
swarm push --theme-name "My Theme"   # Set theme name (for new themes)
```

**Modes:**
- **Create**: Use `--create` when pushing a new theme (no `theme_id` in config)
- **Update**: Automatically used when `theme_id` exists in environment config

### `swarm env`

Manage environments for connecting to different Site Swarm servers or accounts. Environments work like git remotes - each stores its own API key, server URL, account ID, and theme ID.

```bash
swarm env                            # List all environments
swarm env list                       # Same as above
swarm env show production            # Show production details
swarm env use staging                # Switch to staging environment
swarm env add local                  # Add new "local" environment
swarm env remove staging             # Remove staging environment
```

**Environment configuration** is stored in `.siteswarm.yml` in your theme directory:

```yaml
current_environment: development

# Keepalive interval for tunnel connections (seconds, default: 30)
keepalive_interval: 30

environments:
  development:
    server_url: http://localhost:3000
    account_id: acct_abc123
    theme_id: theme_xyz789

  production:
    server_url: https://siteswarm.io
    account_id: acct_def456
    theme_id: theme_uvw012
```

**API keys** are stored separately in `~/.siteswarm.yml` (not committed to git):

```yaml
environments:
  development:
    api_key: sk_dev_xxxxx
  production:
    api_key: sk_prod_xxxxx
```

**Using environments with commands:**

```bash
swarm connect --env staging
swarm push --env production
swarm dev --env local
```

---

## Theme Directory Structure

```
my-theme/
├── layout/
│   └── theme.liquid          # Required - base HTML wrapper
├── templates/
│   ├── index.liquid          # Homepage
│   ├── collection.liquid     # Dataset list pages
│   ├── article.liquid        # Dataset item pages
│   └── 404.liquid            # Not found page
├── sections/
│   └── *.liquid              # Reusable sections with settings
├── snippets/
│   └── *.liquid              # Reusable partials
├── assets/
│   ├── theme.css             # Stylesheets
│   └── theme.js              # JavaScript
├── config/
│   ├── settings_schema.json  # Theme settings definition
│   └── settings_data.json    # Default setting values
└── data/                     # Mock data for local dev (see below)
    ├── site.json
    ├── settings.json
    └── datasets/
        └── *.json
```

---

## Mock Data

The dev server uses mock data from the `data/` directory to populate your templates. You can either provide explicit data or use schema-based generation.

### Site Information

**data/site.json**
```json
{
  "name": "My Test Site",
  "subdomain": "test",
  "url": "http://localhost:4000"
}
```

This populates the `site` object in templates:
```liquid
{{ site.name }}  <!-- "My Test Site" -->
{{ site.url }}   <!-- "http://localhost:4000" -->
```

### Theme Settings

**config/settings_data.json**
```json
{
  "primary_color": "#3b82f6",
  "show_newsletter": true,
  "footer_text": "Copyright 2025"
}
```

This is the single source of truth for theme settings. Access via:
```liquid
{{ settings.primary_color }}
```

> **Note:** `data/settings.json` is no longer supported. All settings should be defined in `config/settings_data.json`, which is also what Rails imports when the theme is uploaded.

### Datasets (Schema-Based)

Instead of writing tedious fake content, define a schema and let the dev server generate realistic data automatically.

**data/datasets/articles.json**
```json
{
  "mount_path": "/blog",
  "alias": "articles",
  "slug_field": "slug",
  "count": 10,
  "schema": {
    "slug": "slug",
    "title": "sentence",
    "excerpt": "paragraph",
    "content": "paragraphs:3",
    "image": "image:800x400",
    "author": "name",
    "published_at": "date:past"
  }
}
```

This generates 10 articles with lorem ipsum text and placeholder images from picsum.photos.

### Schema Field Types

| Type | Example Output |
|------|----------------|
| `sentence` | "Lorem ipsum dolor sit amet" |
| `sentences:3` | Three sentences joined |
| `paragraph` | Full paragraph of text |
| `paragraphs:3` | Three paragraphs wrapped in `<p>` tags |
| `words:5` | Five random words |
| `name` | "Jane Smith" |
| `first_name` | "Jane" |
| `last_name` | "Smith" |
| `email` | "jane.smith@example.com" |
| `company` | "Acme Corporation" |
| `phone` | "(555) 123-4567" |
| `address` | Full street address |
| `city` | "New York" |
| `country` | "United States" |
| `slug` | "lorem-ipsum-dolor" |
| `url` | "https://example.com/page" |
| `date` | "2025-01-15" |
| `date:past` | Random date in past year |
| `date:future` | Random date in next year |
| `datetime` | ISO 8601 datetime |
| `number` | 42 |
| `number:1-100` | Random number in range |
| `price` | "29.99" |
| `percentage` | 0-100 |
| `boolean` | true or false |
| `image` | "https://picsum.photos/600/400?random=N" |
| `image:800x400` | Specific dimensions |
| `color` | "#a3b5c7" |
| `uuid` | UUID string |
| `title` | Short sentence without period |

### Hybrid: Schema + Explicit Records

Combine auto-generated data with specific test cases:

```json
{
  "mount_path": "/blog",
  "alias": "articles",
  "slug_field": "slug",
  "count": 5,
  "schema": {
    "slug": "slug",
    "title": "sentence",
    "excerpt": "paragraph"
  },
  "records": [
    {
      "slug": "welcome",
      "title": "Welcome to Our Blog",
      "excerpt": "This is a hand-crafted welcome post"
    }
  ]
}
```

Explicit records are appended after generated ones. If an explicit record has the same slug as a generated one, it replaces it.

---

## URL Routing

The dev server mimics Site Swarm's production routing:

| URL | Template | Context |
|-----|----------|---------|
| `/` | `templates/index.liquid` | Standard context |
| `/about` | `templates/about.liquid` | Standard context |
| `/about` | `page_templates/about.liquid` (if no template match) | `page` |
| `/about` | `page_templates/page.liquid` (if page record maps to it) | `page` |
| `/blog` | `templates/collection.liquid` | `collection`, `mount`, `pagination` |
| `/blog/my-post` | `templates/article.liquid` | `article`, `mount` |
| `/anything-else` | `templates/404.liquid` | Standard context |

### Resolution Order

1. **Exact template match** — `/about` → `templates/about.liquid`
2. **Implicit page_template file** — `/about` → `page_templates/about.liquid`
3. **Parameterized routes** — `/companies/acme` → template with `{% routes %}`
4. **Dataset slug match** — `/my-slug` → dataset record with matching slug
5. **Page record from pages.json** — `/about` → page record's assigned `page_template`
6. **Path conversion** — `/about/team` → `templates/about-team.liquid`
7. **404 fallback**

### Dataset Routing

Datasets are routed based on their `mount_path`:

```json
// data/datasets/articles.json
{
  "mount_path": "/blog",
  "alias": "articles",
  ...
}
```

- `/blog` → renders `collection.liquid` with all articles
- `/blog/my-slug` → renders `article.liquid` with the matching record

### Page Routing

Pages defined in `data/content/pages.json` are routed to their assigned page templates:

```json
// data/content/pages.json
{
  "records": [
    {"title": "About Us", "slug": "about", "page_template": "page"},
    {"title": "Contact", "slug": "contact", "page_template": "page"}
  ]
}
```

- `/about` → renders `page_templates/page.liquid` with the "About Us" page record
- `/contact` → renders `page_templates/page.liquid` with the "Contact" page record

This is the most common pattern: multiple pages sharing a single page_template. See [Content and Routing](../content-and-routing.md) for details.

---

## Live Reload

The dev server automatically reloads your browser when you save changes to:
- `.liquid` files (templates, sections, snippets, layouts)
- `.css` files
- `.js` files
- `.json` files (config, mock data)

A small JavaScript snippet is injected into every page that listens for reload events via Server-Sent Events.

---

## Differences from Production

| Feature | Dev Server | Production |
|---------|------------|------------|
| Data source | Mock JSON files | Database |
| Asset URLs | `/assets/file.css` | ActiveStorage URLs |
| Image variants | Not processed | Resized by ActiveStorage |
| Settings | `config/settings_data.json` | Site-specific settings |
| Caching | None | Full caching |
| HTTPS | No | Yes (via domains) |

### Filters That Behave Differently

- `asset_url` - Returns simple `/assets/path` instead of ActiveStorage URLs
- `img_url` - Returns the URL as-is (no image processing)

---

## Troubleshooting

### "Template not found"

Ensure your theme has `layout/theme.liquid`. This is the only required file.

### Liquid syntax errors

Check the error page for details. The dev server shows full error messages with stack traces.

### Mock data not loading

- Ensure JSON files are valid (use a JSON validator)
- Check file is in `data/datasets/` directory
- Verify `alias` matches what you're accessing in templates

### Port already in use

```bash
swarm dev --port 3001
```

### Changes not reloading

- Check the terminal for watcher errors
- Ensure file extensions are `.liquid`, `.css`, `.js`, or `.json`
- Try restarting the server

### Docker not found (npm users)

The npm package requires Docker to run the dev server. Install Docker from https://docs.docker.com/get-docker/

Alternatively, install the Ruby gem for native execution:
```bash
gem install siteswarm-theme-dev
```

---

## For Site Swarm Developers: Monorepo Workflow

When working on themes inside the Site Swarm monorepo, you have additional features:

### Theme Directory Structure

Themes are symlinked into a root `themes/` directory for easy access:

```
hostnet/
├── themes/                          # Edit themes here
│   └── blank -> ../lib/theme_dev_server/starters/blank
├── lib/theme_dev_server/starters/   # Source of truth
│   └── blank/
```

### Development Workflow

1. **Edit themes in `themes/`**:
   ```bash
   cd themes/blank
   # Make changes to templates, sections, etc.
   ```

2. **Preview with dev server** (monorepo shortcuts work):
   ```bash
   bin/theme-dev dev blank    # Same as: bin/theme-dev dev themes/blank
   ```

3. **Import into Rails database**:
   ```bash
   bin/theme-dev import blank                        # Creates/updates theme
   bin/theme-dev import blank --name "Custom Name"   # Custom theme name
   bin/theme-dev import blank --account acme         # Specific account
   ```

4. **Test in Rails**:
   ```bash
   bin/dev
   # Visit your site using the imported theme
   ```

### The `import` Command

**Monorepo only.** Imports a theme directory into the local Rails database.

```bash
bin/theme-dev import <path> [options]
```

| Option | Description |
|--------|-------------|
| `--name NAME` | Theme name (default: directory name) |
| `--account ACCOUNT` | Account ID or subdomain (default: first account) |

**Behavior:**
- Creates a new theme if it doesn't exist
- Creates a new version if the theme already exists
- Uses `ThemeUploadService` to process files
- Skips `data/` directory (mock data for dev server only)

**Examples:**
```bash
bin/theme-dev import blank
bin/theme-dev import ./my-custom-theme
bin/theme-dev import themes/blank --name "Production Theme"
bin/theme-dev import themes/blank --account my-company
```

---

## See Also

- [README](../README.md) - Theme structure and key concepts
- [Liquid Reference](liquid-reference.md) - Available tags and filters
- [Components](../components.md) - Sections, snippets, blocks, and settings
- [Dev Server Maintenance](dev-server-maintenance.md) - Internal developer documentation
