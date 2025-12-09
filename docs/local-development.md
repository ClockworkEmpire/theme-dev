# Local Theme Development

The HostNet theme dev server lets you build and preview themes locally without connecting to the HostNet platform. It renders your Liquid templates with mock data and provides live reload for rapid iteration.

---

## Quick Start

```bash
# Install (choose one)
npm install -g github:clockworkempire/theme-dev   # npm (uses Docker)
gem install hostnet-theme-dev                      # Ruby gem (native)

# Create a new theme
hostnet new my-theme

# Start the dev server
cd my-theme
hostnet dev

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
gem install hostnet-theme-dev
```

### Docker (Direct)

Run without installing anything:

```bash
docker run -v $(pwd):/theme -p 4000:4000 ghcr.io/clockworkempire/theme-dev
```

### For HostNet Developers

Run directly from the source tree with monorepo shortcuts:

```bash
# Use theme name directly
bin/theme-dev dev minimal
bin/theme-dev dev blank

# Or use full path
bin/theme-dev dev themes/minimal
bin/theme-dev dev lib/theme_dev_server/starters/minimal
```

See [Monorepo Workflow](#for-hostnet-developers-monorepo-workflow) below for the full development workflow.

---

## CLI Commands

### `hostnet new`

Create a new theme from a starter template.

```bash
hostnet new my-theme              # Blank scaffold
hostnet new my-theme --example    # Full example with sections and mock data
```

The blank scaffold includes:
- Basic layout with HTML skeleton
- Placeholder templates (index, collection, article, 404)
- Empty sections/snippets directories
- Minimal CSS

The `--example` flag copies the full minimal-theme example with working sections, snippets, and mock datasets.

### `hostnet dev`

Start the development server with live reload.

```bash
hostnet dev                      # Serve current directory
hostnet dev ./my-theme           # Serve specific path
hostnet dev --port 3000          # Custom port
hostnet dev --open               # Auto-open browser
hostnet dev --host 0.0.0.0       # Bind to all interfaces
```

### `hostnet update`

Pull the latest Docker image (npm users).

```bash
hostnet update
```

Ruby gem users should run `gem update hostnet-theme-dev` instead.

### `hostnet version`

Show version information.

```bash
hostnet version
```

### `hostnet help`

Show help for all commands or a specific command.

```bash
hostnet help
hostnet help new
hostnet help dev
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

**data/settings.json**
```json
{
  "primary_color": "#3b82f6",
  "show_newsletter": true,
  "footer_text": "Copyright 2025"
}
```

Overrides defaults from `config/settings_data.json`. Access via:
```liquid
{{ settings.primary_color }}
```

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

The dev server mimics HostNet's production routing:

| URL | Template | Context |
|-----|----------|---------|
| `/` | `templates/index.liquid` | Standard context |
| `/about` | `templates/about.liquid` | Standard context |
| `/blog` | `templates/collection.liquid` | `collection`, `mount`, `pagination` |
| `/blog/my-post` | `templates/article.liquid` | `article`, `mount` |
| `/anything-else` | `templates/404.liquid` | Standard context |

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
| Settings | `data/settings.json` | Site-specific settings |
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
hostnet dev --port 3001
```

### Changes not reloading

- Check the terminal for watcher errors
- Ensure file extensions are `.liquid`, `.css`, `.js`, or `.json`
- Try restarting the server

### Docker not found (npm users)

The npm package requires Docker to run the dev server. Install Docker from https://docs.docker.com/get-docker/

Alternatively, install the Ruby gem for native execution:
```bash
gem install hostnet-theme-dev
```

---

