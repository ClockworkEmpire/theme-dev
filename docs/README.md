# Theme Development

Build custom themes for Site Swarm sites.

---

## Quick Start

```bash
# Install the CLI
npm install -g github:clockworkempire/theme-dev

# Create and run a new theme
swarm new my-theme
cd my-theme
swarm dev

# Open http://localhost:4000
```

**New to theme development?** Start with the [Getting Started](getting-started.md) tutorial.

**Need a quick reference?** The [Cheat Sheet](cheat-sheet.md) has everything on one page.

---

## Installation

| Method | Command | Notes |
|--------|---------|-------|
| **npm** | `npm install -g github:clockworkempire/theme-dev` | Requires Docker |
| **Ruby gem** | `gem install siteswarm-theme-dev` | Native Ruby, no Docker |
| **Docker** | `docker pull ghcr.io/clockworkempire/theme-dev` | Direct container usage |

See [Local Development](tools/local-development.md) for detailed installation and usage.

---

## CLI Commands

```bash
# Local development
swarm new <name>           # Create a new theme (blank scaffold)
swarm new <name> --example # Create from full example theme
swarm dev [path]           # Start dev server with live reload
swarm lint [path]          # Validate theme structure and schemas
swarm lint --fix [path]    # Auto-fix issues and scaffold missing schemas

# Server integration
swarm connect [path]       # Connect to Site Swarm for browser-based editing
swarm push [path]          # Upload theme to Site Swarm server
swarm env                  # Manage environments (server URLs, API keys)

# Utility
swarm update               # Pull latest Docker image
swarm help                 # Show help
```

---

## Documentation

### Start Here

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Build your first theme step-by-step |

### Reference

| Document | Description |
|----------|-------------|
| [Architecture Decisions](architecture-decisions.md) | When to use datasets vs settings, sections vs snippets, routing strategies |
| [Components](components.md) | Sections, snippets, blocks, drop-ins, and settings |
| [Content and Routing](content-and-routing.md) | Templates, page templates, datasets, URL routing |
| [Search](search.md) | Search template, result variables, forms, pagination |
| [Liquid Reference](liquid-reference.md) | Complete templating language reference |
| [Cheat Sheet](cheat-sheet.md) | Condensed reference card |

### Tools

| Document | Description |
|----------|-------------|
| [Local Development](tools/local-development.md) | Dev server, CLI commands, mock data |
| [Linting](tools/linting.md) | Theme validation, auto-fix, default extraction |
| [Sample Content](tools/sample-content.md) | Authors, tags, posts, pages, drop-ins for themes |

### For Site Swarm Developers

| Document | Description |
|----------|-------------|
| [Dev Server Maintenance](dev-server-maintenance.md) | Updating the dev server when core rendering changes |

---

## Theme Structure

```
theme/
├── siteswarm.json              # Theme manifest (name, version, category, tags)
├── layout/
│   └── theme.liquid            # Required - base HTML wrapper
├── templates/                  # Dataset rendering (article, collection)
│   ├── index.liquid
│   ├── collection.liquid
│   ├── article.liquid
│   └── 404.liquid
├── page_templates/             # Static pages with per-page settings
│   ├── about.liquid
│   └── service.liquid
├── sections/                   # Configurable components
│   ├── header.liquid
│   └── footer.liquid
├── snippets/                   # Reusable partials
│   ├── card.liquid
│   └── pagination.liquid
├── dropins/                    # Default content (user-overridable)
│   └── promo-banner.liquid
├── assets/                     # CSS, JS, images, fonts
│   ├── theme.css
│   └── theme.js
├── config/                     # Settings and schemas
│   ├── settings_schema.json    # Theme settings definition
│   ├── settings_data.json      # Default values
│   ├── sections/               # Section schemas (sidecar pattern)
│   │   ├── header.json
│   │   └── footer.json
│   ├── snippets/               # Snippet schemas
│   ├── templates/              # Template schemas
│   └── page_templates/         # Page template schemas
├── locales/                    # Translations (en.json, es.json)
└── data/                       # Dev server sample content
    ├── site.json
    └── content/
```

**Required file:** `layout/theme.liquid`

---

## Key Concepts

### Liquid Templating

Output data:
```liquid
{{ site.name }}
{{ article.title }}
```

Control flow:
```liquid
{% if article.featured %}
  <span>Featured</span>
{% endif %}
```

Loops:
```liquid
{% for article in datasets.articles %}
  {{ article.title }}
{% endfor %}
```

### Modular Components

**Sections** have settings (header, footer, hero):
```liquid
{% section 'header' %}
```

**Snippets** receive data (cards, buttons):
```liquid
{% swarm_render 'article-card', article: post %}
```

**Drop-ins** are user-managed HTML blocks (disclaimers, promos):
```liquid
{% dropin 'footer-disclaimer' %}
```

### Dynamic Content

Access datasets anywhere:
```liquid
{% for product in datasets.products limit: 4 %}
  {% swarm_render 'product-card', product: product %}
{% endfor %}
```

Generate URLs:
```liquid
<a href="{{ article | item_url }}">{{ article.title }}</a>
```

---

## Starter Templates

### Blank (default)

```bash
swarm new my-theme
```

Minimal scaffold with placeholder templates. Good for starting from scratch.

### Minimal Example

```bash
swarm new my-theme --example
```

Full working theme with header/footer sections, hero, article/company card snippets, pagination, mock datasets, and complete settings schema.

Also available at [examples/minimal-theme/](examples/minimal-theme/).

---

## Prerequisites

To build Site Swarm themes, you should be familiar with:

- HTML and CSS
- Basic templating concepts (variables, loops, conditionals)

No server-side programming knowledge required.

---

## Getting Help

- Check the [Cheat Sheet](cheat-sheet.md) for quick answers
- Review the [examples](examples/) for working code
