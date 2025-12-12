# Theme Development

Build custom themes for HostNet sites.

---

## Quick Start

```bash
# Install the CLI
npm install -g github:clockworkempire/theme-dev

# Create and run a new theme
hostnet new my-theme
cd my-theme
hostnet dev

# Open http://localhost:4000
```

**New to theme development?** Start with the [Getting Started](getting-started.md) tutorial to build your first theme in 15 minutes.

**Need a quick reference?** The [Cheat Sheet](CHEAT-SHEET.md) has all the essentials on one page.

**Building with AI?** Feed [THEME-DEVELOPMENT-GUIDE.md](THEME-DEVELOPMENT-GUIDE.md) to your LLM for complete context.

---

## Installation

| Method | Command | Notes |
|--------|---------|-------|
| **npm** | `npm install -g github:clockworkempire/theme-dev` | Requires Docker |
| **Ruby gem** | `gem install hostnet-theme-dev` | Native Ruby, no Docker |
| **Docker** | `docker pull ghcr.io/clockworkempire/theme-dev` | Direct container usage |

See [Local Development](local-development.md) for detailed installation and usage.

---

## CLI Commands

```bash
hostnet new <name>           # Create a new theme (blank scaffold)
hostnet new <name> --example # Create from full example theme
hostnet dev [path]           # Start dev server with live reload
hostnet update               # Pull latest Docker image
hostnet help                 # Show help
```

---

## Documentation

### Tutorials

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Build your first theme step-by-step |

### Reference

| Document | Description |
|----------|-------------|
| [Theme Structure](theme-structure.md) | Directory layout and file organization |
| [Liquid Reference](liquid-reference.md) | Complete templating language reference |
| [Sections, Snippets & Drop-Ins](sections-and-snippets.md) | Building reusable components |
| [Settings Schema](settings-schema.md) | Configurable theme options |
| [Datasets and Routing](datasets-and-routing.md) | Dynamic content and URL patterns |
| [Assets and Styling](assets-and-styling.md) | CSS, JavaScript, images, fonts |
| [Local Development](local-development.md) | Dev server, CLI commands, mock data |

### Quick Reference

| Document | Description |
|----------|-------------|
| [Cheat Sheet](CHEAT-SHEET.md) | Condensed reference card |
| [Full Guide](THEME-DEVELOPMENT-GUIDE.md) | Complete guide in one document |

### For HostNet Developers

| Document | Description |
|----------|-------------|
| [Dev Server Maintenance](dev-server-maintenance.md) | Updating the dev server when core rendering changes |

---

## Starter Templates

Two starter templates are available:

### Blank (default)

```bash
hostnet new my-theme
```

Minimal scaffold with placeholder templates. Good for starting from scratch.

### Minimal Example

```bash
hostnet new my-theme --example
```

Full working theme with:
- Header/footer sections with settings
- Hero section
- Article and company card snippets
- Pagination component
- Mock datasets (articles, companies)
- Complete settings schema

The example theme is also available at [examples/minimal-theme/](examples/minimal-theme/).

---

## Key Concepts

### Theme = Templates + Components + Assets

```
theme/
├── layout/theme.liquid       # HTML wrapper
├── templates/*.liquid        # Page content
├── sections/*.liquid         # Configurable components
├── snippets/*.liquid         # Reusable partials
├── assets/*                  # CSS, JS, images
└── config/*.json             # Settings
```

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
{% hostnet_render 'article-card', article: post %}
```

**Drop-ins** are user-managed HTML blocks (disclaimers, promos):
```liquid
{% dropin 'footer-disclaimer' %}
```

### Dynamic Content

Access datasets anywhere:
```liquid
{% for product in datasets.products limit: 4 %}
  {% hostnet_render 'product-card', product: product %}
{% endfor %}
```

Generate URLs:
```liquid
<a href="{{ article | item_url }}">{{ article.title }}</a>
```

---

## Prerequisites

To build HostNet themes, you should be familiar with:

- HTML and CSS
- Basic templating concepts (variables, loops, conditionals)

No server-side programming knowledge required.

---

## Getting Help

- Check the [Cheat Sheet](CHEAT-SHEET.md) for quick answers
- Read the [Full Guide](THEME-DEVELOPMENT-GUIDE.md) for comprehensive documentation
- Review the [examples](examples/) for working code
