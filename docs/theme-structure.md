# Theme Structure

A HostNet theme is a collection of Liquid templates, assets, and configuration files organized in a specific directory structure.

---

## Directory Layout

```
my-theme/
├── layout/
│   └── theme.liquid            # Required - base HTML wrapper
│
├── templates/
│   ├── index.liquid            # Homepage (/)
│   ├── page.liquid             # Generic pages
│   ├── collection.liquid       # Dataset list pages
│   ├── article.liquid          # Dataset item pages (single record)
│   ├── search.liquid           # Search results
│   └── 404.liquid              # Not found page
│
├── sections/
│   ├── header.liquid           # Site header with navigation
│   ├── footer.liquid           # Site footer
│   ├── hero.liquid             # Homepage hero banner
│   └── newsletter.liquid       # Newsletter signup form
│
├── snippets/
│   ├── article-card.liquid     # Reusable article card
│   ├── product-card.liquid     # Reusable product card
│   ├── pagination.liquid       # Pagination controls
│   └── social-links.liquid     # Social media links
│
├── assets/
│   ├── theme.css               # Main stylesheet
│   ├── theme.js                # Main JavaScript
│   ├── images/
│   │   └── logo.svg
│   └── skins/                  # Optional color scheme variants
│       ├── warm.css
│       └── cool.css
│
├── config/
│   ├── settings_schema.json    # Theme settings definition
│   └── settings_data.json      # Default setting values
│
├── data/                       # Dev server mock data (not for production)
│   ├── site.json               # Site info and skin selection
│   └── datasets/
│       └── articles.json       # Mock dataset records
│
└── locales/
    ├── en.default.json         # English translations (default)
    └── es.json                 # Spanish translations
```

---

## Required Files

Only one file is required:

| File | Purpose |
|------|---------|
| `layout/theme.liquid` | Base HTML document that wraps all pages |

All other files are optional but recommended for a functional theme.

---

## Directory Reference

### layout/

Contains the base HTML structure that wraps all pages. The layout receives page content via `{{ content_for_layout }}`.

**theme.liquid** (required)
```liquid
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title | default: site.name }}</title>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body>
  {% section 'header' %}

  <main>
    {{ content_for_layout }}
  </main>

  {% section 'footer' %}

  <script src="{{ 'theme.js' | asset_url }}"></script>
</body>
</html>
```

You can create additional layouts (e.g., `checkout.liquid`, `landing.liquid`) for different page types, though this is an advanced use case.

---

### templates/

Page templates that render the main content area. The template name often corresponds to the URL or page type.

| Template | URL Pattern | Purpose |
|----------|-------------|---------|
| `index.liquid` | `/` | Homepage |
| `page.liquid` | `/about`, `/contact` | Static pages |
| `collection.liquid` | `/blog`, `/products` | Dataset list pages |
| `article.liquid` | `/blog/my-post` | Single dataset record |
| `search.liquid` | `/search` | Search results |
| `404.liquid` | Any unmatched URL | Not found page |

**Template routing:**

1. Exact match: `/about` looks for `templates/about.liquid`
2. Dataset list: `/blog` (mounted dataset) uses `collection.liquid`
3. Dataset item: `/blog/my-post` uses `article.liquid`
4. Fallback: `404.liquid`

**Example: index.liquid**
```liquid
<div class="container">
  {% section 'hero' %}

  <section class="featured-articles">
    <h2>Latest Articles</h2>
    <div class="grid">
      {% for article in datasets.articles limit: 3 %}
        {% hostnet_render 'article-card', article: article %}
      {% endfor %}
    </div>
  </section>
</div>
```

**Example: collection.liquid**
```liquid
<div class="container">
  <h1>{{ mount.alias | capitalize }}</h1>

  <div class="grid">
    {% for item in collection %}
      {% hostnet_render 'article-card', article: item %}
    {% else %}
      <p>No items found.</p>
    {% endfor %}
  </div>

  {% if pagination.total_pages > 1 %}
    {% hostnet_render 'pagination' %}
  {% endif %}
</div>
```

**Example: article.liquid**
```liquid
<article class="container">
  <header>
    <h1>{{ article.title }}</h1>
    <time>{{ article.published_at | date: '%B %d, %Y' }}</time>
  </header>

  {% if article.image %}
    <img src="{{ article.image | img_url: 'large' }}" alt="{{ article.title }}">
  {% endif %}

  <div class="content">
    {{ article.content }}
  </div>
</article>
```

---

### sections/

Reusable page sections with configurable settings. Sections are included with `{% section 'name' %}` and can define their own settings via `{% schema %}`.

**Key characteristics:**
- Have their own settings (configured by site owner)
- Access settings via `section.settings`
- Included in templates with `{% section 'name' %}`
- Schema defined with `{% schema %}` block

**Example: hero.liquid**
```liquid
<section class="hero" style="background-color: {{ section.settings.bg_color }}">
  <div class="hero-content">
    <h1>{{ section.settings.title | default: site.name }}</h1>
    <p>{{ section.settings.subtitle }}</p>
    {% if section.settings.button_text %}
      <a href="{{ section.settings.button_url }}" class="btn">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Welcome"
    },
    {
      "type": "textarea",
      "id": "subtitle",
      "label": "Subtitle"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text"
    },
    {
      "type": "url",
      "id": "button_url",
      "label": "Button URL",
      "default": "#"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#3b82f6"
    }
  ]
}
{% endschema %}
```

---

### snippets/

Simple reusable partials without settings. Snippets are included with `{% hostnet_render 'name' %}` and receive variables explicitly passed to them.

**Key characteristics:**
- No settings schema
- Receive variables explicitly via render tag
- Isolated variable scope
- Best for repeated UI patterns

**Example: article-card.liquid**
```liquid
<article class="card">
  {% if article.image %}
    <img
      src="{{ article.image | img_url: 'medium' }}"
      alt="{{ article.title }}"
      class="card-image"
    >
  {% endif %}

  <div class="card-body">
    <h3 class="card-title">
      <a href="{{ article | item_url }}">{{ article.title }}</a>
    </h3>

    {% if article.excerpt %}
      <p class="card-text">{{ article.excerpt | truncate_words: 20 }}</p>
    {% endif %}

    <div class="card-meta">
      <time>{{ article.published_at | date: '%b %d, %Y' }}</time>
    </div>
  </div>
</article>
```

**Using the snippet:**
```liquid
{% hostnet_render 'article-card', article: post %}
{% hostnet_render 'article-card' for collection as article %}
```

**Example: pagination.liquid**
```liquid
<nav class="pagination" aria-label="Pagination">
  {% if pagination.prev_url %}
    <a href="{{ pagination.prev_url }}" class="pagination-prev">
      ← Previous
    </a>
  {% else %}
    <span class="pagination-prev pagination-disabled">← Previous</span>
  {% endif %}

  <span class="pagination-info">
    Page {{ pagination.current_page }} of {{ pagination.total_pages }}
  </span>

  {% if pagination.next_url %}
    <a href="{{ pagination.next_url }}" class="pagination-next">
      Next →
    </a>
  {% else %}
    <span class="pagination-next pagination-disabled">Next →</span>
  {% endif %}
</nav>
```

---

### assets/

Static files like CSS, JavaScript, images, and fonts. Referenced in templates with the `asset_url` filter.

**Supported file types:**
- Stylesheets: `.css`
- JavaScript: `.js`
- Images: `.png`, `.jpg`, `.gif`, `.webp`, `.svg`, `.ico`
- Fonts: `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`

**Referencing assets:**
```liquid
<!-- In layout/theme.liquid -->
<link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
<script src="{{ 'theme.js' | asset_url }}"></script>
<img src="{{ 'logo.svg' | asset_url }}" alt="Logo">
```

**Organization:**

You can organize assets into subdirectories:
```
assets/
├── theme.css
├── theme.js
├── images/
│   ├── logo.svg
│   └── hero-bg.jpg
└── fonts/
    └── custom-font.woff2
```

Reference with full path:
```liquid
{{ 'images/logo.svg' | asset_url }}
{{ 'fonts/custom-font.woff2' | asset_url }}
```

#### Skinning System

Themes can support multiple color schemes (skins) using CSS custom properties. Skins are stored in the `assets/skins/` subdirectory.

**Directory structure:**
```
assets/
├── theme.css              # Main stylesheet with default colors
└── skins/
    ├── warm.css           # Warm color variant
    ├── cool.css           # Cool color variant
    └── forest.css         # Green color variant
```

**theme.css defines the design tokens:**
```css
:root {
  /* Brand colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;

  /* Semantic surfaces */
  --color-bg-page: #f9fafb;
  --color-bg-card: #ffffff;
  --color-bg-header: #111827;
  --color-bg-hero: #111827;

  /* Text colors */
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-muted: #6b7280;
}
```

**Skin files override only the variables they change:**
```css
/* assets/skins/warm.css */
:root {
  --color-primary: #d97706;
  --color-primary-hover: #b45309;
  --color-primary-light: #fef3c7;

  --color-bg-header: #78350f;
  --color-bg-hero: #78350f;
}
```

**Loading skins in layout:**
```liquid
{% assign active_skin = request.skin | default: site.skin | default: 'default' %}
{% if active_skin != 'default' and active_skin != '' %}
  <link rel="stylesheet" href="{{ 'skins/' | append: active_skin | append: '.css' | asset_url }}">
{% endif %}
```

**Skin selection:**
- Production: Set via `site.skin` in site settings
- Development: Override with URL parameter `?skin=warm`

---

### config/

Theme configuration files that define settings and defaults.

**settings_schema.json**

Defines the settings available in the theme. Organized into groups:

```json
[
  {
    "name": "General",
    "settings": [
      {
        "type": "text",
        "id": "site_tagline",
        "label": "Tagline",
        "default": "Your tagline here"
      },
      {
        "type": "image_picker",
        "id": "logo",
        "label": "Logo"
      }
    ]
  },
  {
    "name": "Colors",
    "settings": [
      {
        "type": "color",
        "id": "primary_color",
        "label": "Primary Color",
        "default": "#3b82f6"
      },
      {
        "type": "color",
        "id": "text_color",
        "label": "Text Color",
        "default": "#1f2937"
      }
    ]
  }
]
```

**settings_data.json**

Default values for all settings:

```json
{
  "site_tagline": "Your tagline here",
  "primary_color": "#3b82f6",
  "text_color": "#1f2937"
}
```

Site owners can override these values. Their customizations are stored separately and merged with defaults at render time.

---

### locales/

Translation files for multi-language support.

**en.default.json** (default language)
```json
{
  "general": {
    "read_more": "Read more",
    "view_all": "View all",
    "search": "Search"
  },
  "cart": {
    "add_to_cart": "Add to cart",
    "checkout": "Checkout"
  }
}
```

**es.json** (Spanish)
```json
{
  "general": {
    "read_more": "Leer más",
    "view_all": "Ver todo",
    "search": "Buscar"
  }
}
```

Access translations in templates:
```liquid
{{ 'general.read_more' | t }}
```

---

## File Naming Conventions

| Directory | Extension | Example |
|-----------|-----------|---------|
| layout/ | `.liquid` | `theme.liquid` |
| templates/ | `.liquid` | `article.liquid` |
| sections/ | `.liquid` | `hero.liquid` |
| snippets/ | `.liquid` | `card.liquid` |
| config/ | `.json` | `settings_schema.json` |
| locales/ | `.json` | `en.default.json` |
| assets/ | varies | `theme.css`, `app.js` |

**Naming tips:**
- Use lowercase with hyphens: `article-card.liquid`
- Be descriptive: `featured-products.liquid` not `fp.liquid`
- Match template names to URL paths when possible

---

## Theme Upload

Themes are uploaded as ZIP files. The ZIP should contain the theme directory structure at the root level or inside a single top-level folder.

**Valid structures:**

```
# Option 1: Files at root
my-theme.zip
├── layout/
├── templates/
├── sections/
└── ...

# Option 2: Single folder
my-theme.zip
└── my-theme/
    ├── layout/
    ├── templates/
    ├── sections/
    └── ...
```

**Ignored files:**
- Hidden files (starting with `.`)
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- `__MACOSX/` directory

**Validation:**
- `layout/theme.liquid` must exist
- All `.liquid` files must have valid Liquid syntax
- JSON config files must be valid JSON

---

## Development Data (data/)

When developing themes locally with the Theme Dev Server, the `data/` directory provides mock data that simulates production content.

> **Note:** The `data/` directory is only used during development. In production, data comes from the HostNet database.

### Directory Structure

```
data/
├── site.json              # Site info and settings
└── datasets/
    ├── articles.json      # Blog articles dataset
    └── businesses.json    # Business listings dataset
```

### site.json

Contains site metadata and skin configuration:

```json
{
  "name": "My Directory Site",
  "subdomain": "directory-demo",
  "url": "http://localhost:4000",
  "skin": "default",
  "available_skins": ["default", "warm", "cool", "forest"]
}
```

Available in templates as `site.*`:
```liquid
<title>{{ page_title | default: site.name }}</title>
```

### Dataset Files

Each JSON file in `data/datasets/` defines a dataset with its routing and content.

**Basic structure:**
```json
{
  "alias": "articles",
  "mount_path": "/blog",
  "slug_field": "slug",
  "list_template": "blog",
  "item_template": "article",
  "schema": { ... },
  "records": [ ... ]
}
```

| Field | Purpose |
|-------|---------|
| `alias` | Reference name for `datasets.alias` access |
| `mount_path` | URL path where collection is mounted |
| `slug_field` | Field used for item URLs |
| `list_template` | Template for listing page (e.g., `/blog`) |
| `item_template` | Template for item pages (e.g., `/blog/my-post`) |
| `schema` | Auto-generates fake data using Faker |
| `records` | Explicit mock records (merged with generated) |

**Example with explicit records:**
```json
{
  "alias": "businesses",
  "mount_path": "/listings",
  "slug_field": "slug",
  "list_template": "collection",
  "item_template": "business",
  "records": [
    {
      "name": "Precision Plumbing",
      "slug": "precision-plumbing",
      "description": "Full-service plumbing company...",
      "category": "Plumbing",
      "phone": "(555) 234-5678",
      "lat": 39.7817,
      "lng": -89.6501,
      "google_place_id": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
      "featured": true,
      "rating": 4.8
    }
  ]
}
```

**Schema for auto-generated data:**
```json
{
  "schema": {
    "name": "company",
    "slug": "slug",
    "description": "paragraph",
    "category": { "type": "enum", "values": ["Plumbing", "Electrical", "HVAC"] },
    "phone": "phone",
    "email": "email",
    "rating": { "type": "float", "min": 1, "max": 5 },
    "featured": "boolean"
  },
  "count": 10
}
```

Supported schema types: `company`, `name`, `slug`, `paragraph`, `sentence`, `phone`, `email`, `street_address`, `city`, `state`, `zip`, `url`, `boolean`, `date`, `enum`, `float`, `integer`

### Accessing Datasets in Templates

**Direct access (recommended for specific datasets):**
```liquid
{% for item in datasets.articles %}
  {% hostnet_render 'article-card', item: item %}
{% endfor %}
```

**Via collection variable (when routed through mount_path):**
```liquid
{% comment %} In collection.liquid when visiting /blog {% endcomment %}
{% for item in collection %}
  {% hostnet_render 'article-card', item: item %}
{% endfor %}
```

**Mount info available as `mount`:**
```liquid
<h1>{{ mount.alias | capitalize }}</h1>
<p>Viewing items from {{ mount.mount_path }}</p>
```

### URL Generation

Use the `item_url` filter to generate URLs from records:

```liquid
<a href="{{ item | item_url }}">{{ item.title }}</a>
```

This produces URLs like `/blog/my-post` based on the dataset's `mount_path` and `slug_field`.
