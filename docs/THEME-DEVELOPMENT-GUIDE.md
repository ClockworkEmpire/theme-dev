# Site Swarm Theme Development Guide

Complete reference for building Site Swarm themes. This document is self-contained and covers all aspects of theme development.

---

## Table of Contents

1. [Overview](#overview)
2. [Theme Structure](#theme-structure)
3. [Liquid Templating](#liquid-templating)
4. [Global Objects](#global-objects)
5. [Custom Tags](#custom-tags)
6. [Custom Filters](#custom-filters)
7. [Sections and Snippets](#sections-and-snippets)
8. [Page Templates](#page-templates)
9. [Settings System](#settings-system)
10. [Datasets and Routing](#datasets-and-routing)
11. [Assets](#assets)
12. [Complete Examples](#complete-examples)

---

## Overview

A Site Swarm theme is a collection of Liquid templates, reusable components, and static assets that define how a website looks and functions.

**Key concepts:**
- **Liquid** - Template language with `{{ output }}` and `{% logic %}`
- **Layouts** - Base HTML wrapper for all pages
- **Templates** - Page-specific content
- **Sections** - Reusable components with configurable settings
- **Snippets** - Simple reusable partials
- **Datasets** - Dynamic content (articles, products, etc.) configured by site owners

---

## Theme Structure

```
theme/
├── siteswarm.json              # Theme manifest (name, version, category)
│
├── layout/
│   └── theme.liquid            # Required - base HTML wrapper
│
├── templates/
│   ├── index.liquid            # Homepage (/)
│   ├── page.liquid             # Generic pages
│   ├── collection.liquid       # Dataset list pages
│   ├── article.liquid          # Dataset item pages
│   └── 404.liquid              # Not found page
│
├── page_templates/
│   ├── about.liquid            # Static pages with per-page settings
│   ├── contact.liquid
│   └── service.liquid
│
├── sections/
│   ├── header.liquid           # Configurable components
│   ├── footer.liquid
│   └── hero.liquid
│
├── snippets/
│   ├── article-card.liquid     # Reusable partials
│   ├── pagination.liquid
│   └── icon.liquid
│
├── assets/
│   ├── theme.css
│   └── theme.js
│
└── config/
    ├── settings_schema.json    # Theme settings definition
    └── settings_data.json      # Default values
```

**Required file:** `layout/theme.liquid`

### File Types

| Directory | Purpose | Settings |
|-----------|---------|----------|
| layout/ | HTML wrapper | No |
| templates/ | Page content | No |
| sections/ | Reusable components | Yes (via schema) |
| snippets/ | Simple partials | No |
| assets/ | Static files | No |
| config/ | Configuration | N/A |

### Theme Manifest

The `siteswarm.json` manifest declares theme metadata (note: `hostnet.json` is still supported for backward compatibility):

```json
{
  "name": "My Theme",
  "version": "1.0.0",
  "category": "business",
  "subcategory": "agency",
  "description": "Theme description",
  "author": "Your Name"
}
```

Categories help users discover themes. Available categories: `business`, `portfolio`, `blog`, `directory`, `ecommerce`, `landing_page`, `events`, `nonprofit`, `education`, `personal`, `other`.

See [Theme Structure - Theme Manifest](theme-structure.md#theme-manifest-siteswarmjson) for full manifest documentation.

---

## Liquid Templating

### Output

Output variables with double curly braces:

```liquid
{{ site.name }}
{{ article.title }}
{{ settings.primary_color }}
```

### Tags

Control logic with `{% %}`:

```liquid
{% if article.featured %}
  <span class="badge">Featured</span>
{% endif %}

{% for article in collection %}
  <h2>{{ article.title }}</h2>
{% endfor %}
```

### Filters

Transform output with `|`:

```liquid
{{ article.title | upcase }}
{{ article.published_at | date: '%B %d, %Y' }}
{{ article.content | truncate_words: 30 }}
```

### Control Flow

**if / elsif / else:**
```liquid
{% if article.featured %}
  Featured
{% elsif article.new %}
  New
{% else %}
  Regular
{% endif %}
```

**unless:**
```liquid
{% unless article.draft %}
  Published content
{% endunless %}
```

**case / when:**
```liquid
{% case article.category %}
  {% when 'news' %}
    News article
  {% when 'tutorial' %}
    Tutorial
  {% else %}
    Other
{% endcase %}
```

### Iteration

**for loop:**
```liquid
{% for article in collection %}
  {{ article.title }}
{% else %}
  No articles found.
{% endfor %}
```

**Loop controls:**
```liquid
{% for article in datasets.articles limit: 5 %}
{% for article in datasets.articles offset: 3 %}
{% for article in collection reversed %}
```

**forloop object:**
```liquid
{{ forloop.index }}    # 1, 2, 3...
{{ forloop.index0 }}   # 0, 1, 2...
{{ forloop.first }}    # true on first
{{ forloop.last }}     # true on last
{{ forloop.length }}   # total count
```

### Variables

**assign:**
```liquid
{% assign featured = datasets.articles | where: 'featured', true %}
```

**capture:**
```liquid
{% capture full_title %}{{ article.title }} | {{ site.name }}{% endcapture %}
```

**assign_global:** (passes variable up to layout)
```liquid
{% assign_global page_title = "Services - My Company" %}
{% assign_global page_description = "Professional services..." %}
```

Use `assign_global` when templates need to pass data to the layout (e.g., page titles for SEO). Regular `assign` variables are template-scoped.

### Standard Filters

| Filter | Example | Output |
|--------|---------|--------|
| `upcase` | `{{ 'hello' \| upcase }}` | `HELLO` |
| `downcase` | `{{ 'HELLO' \| downcase }}` | `hello` |
| `capitalize` | `{{ 'hello' \| capitalize }}` | `Hello` |
| `truncate` | `{{ 'hello world' \| truncate: 8 }}` | `hello...` |
| `strip` | `{{ '  hi  ' \| strip }}` | `hi` |
| `replace` | `{{ 'hello' \| replace: 'l', 'L' }}` | `heLLo` |
| `split` | `{{ 'a,b,c' \| split: ',' }}` | Array |
| `join` | `{{ array \| join: ', ' }}` | String |
| `first` | `{{ array \| first }}` | First element |
| `last` | `{{ array \| last }}` | Last element |
| `size` | `{{ array \| size }}` | Count |
| `default` | `{{ value \| default: 'fallback' }}` | Fallback if nil/empty |
| `plus` | `{{ 4 \| plus: 2 }}` | `6` |
| `minus` | `{{ 4 \| minus: 2 }}` | `2` |
| `times` | `{{ 4 \| times: 2 }}` | `8` |

### Operators

| Operator | Description |
|----------|-------------|
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |
| `and` | Both true |
| `or` | Either true |
| `contains` | String/array contains |

---

## Global Objects

Available in all templates.

### site

Current site information.

```liquid
{{ site.name }}           # Site display name
{{ site.subdomain }}      # Site subdomain
{{ site.url }}            # Current environment URL
{{ site.staging_url }}    # Staging URL
{{ site.production_url }} # Production URL
```

### settings

Theme settings from `config/settings_schema.json` merged with site customizations.

```liquid
{{ settings.logo_text }}
{{ settings.primary_color }}
{{ settings.show_newsletter }}
```

### request

Current HTTP request.

```liquid
{{ request.path }}    # URL path
{{ request.host }}    # Hostname
{{ request.method }}  # HTTP method
```

### datasets

Access to all mounted datasets by alias.

```liquid
{% for article in datasets.articles %}
  {{ article.title }}
{% endfor %}

{% for product in datasets.products limit: 4 %}
  {{ product.name }}
{% endfor %}

{{ datasets.articles.size }}   # Count
{{ datasets.articles.first }}  # First record
```

### collection

On dataset list pages only. Contains paginated records for current page.

```liquid
{% for item in collection %}
  {{ item.title }}
{% endfor %}
```

### pagination

On dataset list pages only. Pagination metadata.

```liquid
{{ pagination.current_page }}  # Current page (1-indexed)
{{ pagination.total_pages }}   # Total pages
{{ pagination.prev_url }}      # Previous page URL or nil
{{ pagination.next_url }}      # Next page URL or nil
```

### dataset

On dataset item pages only. Dataset configuration for the matched record.

```liquid
{{ dataset.alias }}          # Dataset alias (e.g., "services")
{{ dataset.slug_field }}     # Field used for URLs (e.g., "slug")
{{ dataset.item_template }}  # Template name (e.g., "service")
```

### content_for_layout

In layouts only. Contains rendered page content.

```liquid
<main>{{ content_for_layout }}</main>
```

### section

In sections only. Section metadata and settings.

```liquid
{{ section.id }}               # Unique section identifier
{{ section.settings.title }}   # Section setting value
```

---

## Custom Tags

### section

Renders a section from `sections/` with its settings.

```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'footer' %}
```

### swarm_render

Renders a snippet from `snippets/` with isolated scope.

**Basic:**
```liquid
{% swarm_render 'icon' %}
```

**With variables:**
```liquid
{% swarm_render 'article-card', article: post %}
{% swarm_render 'button', text: 'Click', url: '/about' %}
```

**Collection iteration:**
```liquid
{% swarm_render 'article-card' for articles as article %}
```

**Note:** `swarm_render` uses database-backed template lookup. The name distinguishes it from Liquid's built-in file-based `render` tag. (The legacy `hostnet_render` tag still works for backward compatibility.)

### schema

Defines section settings (metadata only, renders nothing).

```liquid
{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "title", "label": "Title" }
  ]
}
{% endschema %}
```

### dropin

Renders user-managed HTML content from the dashboard. Drop-ins are stored in the database, not theme files, and are managed by site owners.

```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'announcement-banner' %}
{% dropin 'cookie-notice' %}
```

**Key characteristics:**
- Plain HTML only (no Liquid processing)
- Managed via dashboard, not theme files
- Cascading scope: site-specific overrides account-wide
- Returns empty string if not found

**With fallback:**
```liquid
{% capture content %}{% dropin 'promo-banner' %}{% endcapture %}
{{ content | default: '<p>Default promotional text</p>' }}
```

**Common drop-in placements:**
| Name | Purpose | Location |
|------|---------|----------|
| `announcement-banner` | Top-of-page announcements | Layout (before header) |
| `cookie-notice` | GDPR/privacy notice | Layout (before `</body>`) |
| `footer-disclaimer` | Legal disclaimers | Footer section |
| `social-links` | Social media icons | Footer section |
| `article-cta` | Call-to-action after content | Article template |

---

## Custom Filters

### asset_url

Generates URL for theme assets.

```liquid
{{ 'theme.css' | asset_url }}
{{ 'images/logo.svg' | asset_url }}
```

### img_url

Generates sized image URL.

```liquid
{{ article.image | img_url: 'small' }}    # 100x100
{{ article.image | img_url: 'medium' }}   # 300x300
{{ article.image | img_url: 'large' }}    # 600x600
{{ article.image | img_url: 'xlarge' }}   # 1200x1200
{{ article.image | img_url: '800x400' }}  # Custom
```

### item_url

Generates URL for a dataset record.

```liquid
{{ article | item_url }}   # /blog/my-article-slug
```

### link_to

Generates HTML anchor tag.

```liquid
{{ 'About' | link_to: '/about' }}
# Output: <a href="/about">About</a>
```

### date

Formats date using strftime.

```liquid
{{ article.published_at | date: '%B %d, %Y' }}  # January 15, 2025
{{ article.published_at | date: '%Y-%m-%d' }}   # 2025-01-15
{{ 'now' | date: '%Y' }}                        # Current year
```

### truncate_words

Truncates to word count.

```liquid
{{ article.content | truncate_words: 30 }}
```

### slugify

Creates URL-friendly slug.

```liquid
{{ 'Hello World!' | slugify }}  # hello-world
```

### stylesheet_tag

Generates link element.

```liquid
{{ 'theme.css' | asset_url | stylesheet_tag }}
# Output: <link rel="stylesheet" href="/assets/theme.css">
```

### script_tag

Generates script element.

```liquid
{{ 'theme.js' | asset_url | script_tag }}
# Output: <script src="/assets/theme.js"></script>
```

---

## Sections and Snippets

### Sections

Reusable components with configurable settings.

```liquid
<!-- sections/hero.liquid -->
<section class="hero" style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
</section>

{% schema %}
{
  "name": "Hero",
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
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#3b82f6"
    }
  ]
}
{% endschema %}
```

**Usage:**
```liquid
{% section 'hero' %}
```

### Snippets

Simple reusable partials without settings.

```liquid
<!-- snippets/article-card.liquid -->
<article class="card">
  {% if article.image %}
    <img src="{{ article.image | img_url: 'medium' }}" alt="">
  {% endif %}
  <h3><a href="{{ article | item_url }}">{{ article.title }}</a></h3>
  <p>{{ article.excerpt | truncate_words: 20 }}</p>
</article>
```

**Usage:**
```liquid
{% swarm_render 'article-card', article: post %}
{% swarm_render 'article-card' for collection as article %}
```

### When to Use Each

| Use Sections When... | Use Snippets When... |
|----------------------|----------------------|
| Site owners should customize content | Content comes from passed variables |
| Component has configurable options | Component is purely presentational |
| Examples: Header, Footer, Hero | Examples: Cards, Buttons, Icons |

---

## Page Templates

Page templates are for static pages (about, contact, services) that need per-page settings, distinct from `templates/` which render dataset records.

### Directory Structure

| Directory | Purpose | Settings Storage |
|-----------|---------|------------------|
| `page_templates/` | Static pages | Per-page (in Page record) |
| `templates/` | Dataset rendering | Global (site settings) |

### Creating a Page Template

```liquid
{# page_templates/service.liquid #}
<h1>{{ settings.headline }}</h1>
<div class="prose">{{ settings.body }}</div>

{% schema %}
{
  "name": "Service Page",
  "settings": [
    { "id": "headline", "type": "text", "label": "Headline" },
    { "id": "body", "type": "richtext", "label": "Body Content" }
  ]
}
{% endschema %}
```

### Page ↔ PageTemplate Relationship

One page_template can have many Pages with different slugs and settings:

```
page_templates/service.liquid
    ├── Page: "Plumbing" (slug: plumbing)    → /plumbing
    ├── Page: "Electrical" (slug: electrical) → /electrical
    └── Page: "HVAC" (slug: hvac)            → /hvac
```

See [Page Templates](page-templates.md) for full documentation.

---

## Settings System

### Theme Settings

**config/settings_schema.json:**
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
      }
    ]
  }
]
```

**Access in templates:**
```liquid
{{ settings.site_tagline }}
{{ settings.primary_color }}
```

### Section Settings

Defined in `{% schema %}` blocks:

```liquid
{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "title", "label": "Title" }
  ]
}
{% endschema %}
```

**Access in section:**
```liquid
{{ section.settings.title }}
```

### Setting Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single line | Headings, labels |
| `textarea` | Multi-line | Descriptions |
| `richtext` | Rich text editor | Content with formatting |
| `image_picker` | Image selector | Hero images, logos |
| `url` | URL input | Links |
| `checkbox` | Boolean toggle | Show/hide options |
| `range` | Numeric slider | Counts, sizes |
| `select` | Dropdown | Layout options |
| `color` | Color picker | Theme colors |

### Setting Properties

```json
{
  "type": "text",
  "id": "hero_title",
  "label": "Hero Title",
  "default": "Welcome",
  "info": "Displayed on homepage"
}
```

---

## Datasets and Routing

Site Swarm uses **fallthrough slug resolution** for dataset URLs, enabling SEO-friendly root-level URLs for all content types.

### URL Resolution Algorithm

When a request comes in, URLs are resolved in this order:

1. **Exact template match:** `/about` → `templates/about.liquid`
2. **Parameterized routes:** Templates with `{% routes %}` blocks (e.g., `/services/:slug`)
3. **Fallthrough slug resolution:** Check each dataset alphabetically by alias for matching slug
4. **Hyphenated path conversion:** `/about/team` → `templates/about-team.liquid`
5. **404 fallback:** `templates/404.liquid`

### Fallthrough Slug Resolution

This is the key feature enabling root-level URLs for multiple dataset types. When a URL like `/tree-removal` is requested:

1. System checks each dataset **alphabetically by alias**
2. For each dataset, looks for a record where the slug field matches "tree-removal"
3. First match wins, renders using that dataset's item template

**Example scenario:**
- Dataset "locations" (alias: `locations`) - records like `austin-tx`, `leander-tx`
- Dataset "services" (alias: `services`) - records like `tree-removal`, `stump-grinding`

A request to `/tree-removal`:
1. Check `locations` first (alphabetically before `services`) - no match
2. Check `services` - **MATCH!** → Renders with `service.liquid` template

A request to `/austin-tx`:
1. Check `locations` - **MATCH!** → Renders with `location.liquid` template

**Why alphabetical?** Provides predictable, consistent behavior. If you need explicit control over which dataset handles a slug, use parameterized routes.

### Root-Level URLs (Default)

By default, all dataset items have root-level URLs:

```liquid
{% for service in datasets.services %}
  <a href="{{ service | item_url }}">{{ service.title }}</a>
  <!-- Output: /tree-removal, /stump-grinding, etc. -->
{% endfor %}

{% for location in datasets.locations %}
  <a href="{{ location | item_url }}">{{ location.name }}</a>
  <!-- Output: /austin-tx, /leander-tx, etc. -->
{% endfor %}
```

The `item_url` filter always generates root-level URLs based on the record's slug.

### Nested URLs with Parameterized Routes

For URLs like `/services/tree-removal` or `/locations/austin-tx`, use parameterized routes:

**templates/services.liquid** (collection page):
```liquid
<!-- Collection page at /services -->
<h1>Our Services</h1>
{% for service in datasets.services %}
  <a href="/services/{{ service.slug }}">{{ service.title }}</a>
{% endfor %}
```

**templates/service-detail.liquid** (item page with parameterized route):
```liquid
{% routes %}
/services/:slug
{% endroutes %}

{% assign service = datasets.services | where: "slug", slug | first %}

{% if service %}
  <h1>{{ service.title }}</h1>
  <div>{{ service.content }}</div>
{% else %}
  <p>Service not found</p>
{% endif %}
```

**How it works:**
1. Request: `/services/tree-removal`
2. Router finds template with matching `{% routes %}` pattern
3. Extracts `slug = "tree-removal"` from URL
4. Template uses `slug` variable to look up record

### Multiple Parameterized Routes

A template can define multiple route patterns:

```liquid
{% routes %}
/services/:slug
/our-services/:slug
{% endroutes %}

{% assign service = datasets.services | where: "slug", slug | first %}
<!-- Both /services/tree-removal and /our-services/tree-removal work -->
```

### Multi-Segment Routes

Routes can have multiple parameters:

```liquid
{% routes %}
/locations/:city/:slug
{% endroutes %}

{% assign business = datasets.businesses | where: "city", city | where: "slug", slug | first %}

<h1>{{ business.name }} in {{ business.city | capitalize }}</h1>
```

This handles URLs like `/locations/austin/joes-plumbing`.

### Accessing Route Parameters

In parameterized templates, extracted parameters are available as variables:

```liquid
{% routes %}
/blog/:year/:month/:slug
{% endroutes %}

<!-- Variables available: year, month, slug -->
Year: {{ year }}
Month: {{ month }}
Slug: {{ slug }}

{% assign post = datasets.posts | where: "slug", slug | first %}
```

Parameters are also available in `route_params` object:

```liquid
{{ route_params.year }}
{{ route_params.month }}
{{ route_params.slug }}
```

### Dataset Configuration

Datasets are configured in `siteswarm.json`:

```json
{
  "name": "Tree Service Theme",
  "version": "1.0.0",
  "datasets": {
    "services": {
      "name": "Services",
      "slug_field": "slug",
      "item_template": "service",
      "description": "Tree care services offered"
    },
    "locations": {
      "name": "Service Areas",
      "slug_field": "slug",
      "item_template": "location",
      "description": "Cities and areas we serve"
    },
    "testimonials": {
      "name": "Testimonials",
      "slug_field": "slug",
      "item_template": "testimonial"
    }
  }
}
```

**Dataset properties:**
| Property | Purpose |
|----------|---------|
| `name` | Human-readable name shown in dashboard |
| `slug_field` | Field used for URL slugs (default: "slug") |
| `item_template` | Template for individual items (default: "article") |
| `description` | Help text for site owners |

### Mock Data for Development

During local development, create mock data in `data/datasets/`:

**data/datasets/services.json:**
```json
{
  "alias": "services",
  "name": "Services",
  "slug_field": "slug",
  "item_template": "service",
  "records": [
    {
      "slug": "tree-removal",
      "title": "Tree Removal",
      "description": "Professional tree removal services",
      "price": "$500+"
    },
    {
      "slug": "stump-grinding",
      "title": "Stump Grinding",
      "description": "Complete stump removal",
      "price": "$150+"
    }
  ]
}
```

**data/datasets/locations.json:**
```json
{
  "alias": "locations",
  "name": "Service Areas",
  "slug_field": "slug",
  "item_template": "location",
  "records": [
    {
      "slug": "austin-tx",
      "name": "Austin",
      "state": "TX",
      "description": "Serving the greater Austin area"
    },
    {
      "slug": "leander-tx",
      "name": "Leander",
      "state": "TX",
      "description": "Full service in Leander"
    }
  ]
}
```

### Accessing Datasets in Templates

**Loop through all records:**
```liquid
{% for service in datasets.services %}
  <h2>{{ service.title }}</h2>
{% endfor %}
```

**Limit and offset:**
```liquid
{% for service in datasets.services limit: 3 %}
{% for service in datasets.services offset: 3 limit: 3 %}
```

**Filter records:**
```liquid
{% assign featured = datasets.services | where: "featured", true %}
{% for service in featured %}
  {{ service.title }}
{% endfor %}
```

**Sort records:**
```liquid
{% assign by_price = datasets.services | sort: "price" %}
{% assign by_name = datasets.services | sort: "title" %}
{% assign newest = datasets.posts | sort: "published_at" | reverse %}
```

**Get specific record:**
```liquid
{% assign service = datasets.services | where: "slug", "tree-removal" | first %}
{{ service.title }}
```

**Count records:**
```liquid
{{ datasets.services.size }} services available
```

### Dataset Context on Item Pages

When rendering a dataset item page, the `dataset` object provides metadata:

```liquid
<!-- templates/service.liquid -->
<nav class="breadcrumb">
  <a href="/">Home</a> /
  <a href="/services">{{ dataset.alias | capitalize }}</a> /
  <span>{{ service.title }}</span>
</nav>

<!-- dataset properties -->
{{ dataset.alias }}         <!-- "services" -->
{{ dataset.slug_field }}    <!-- "slug" -->
{{ dataset.item_template }} <!-- "service" -->
```

### Collection Pages (Template-Driven)

Collection pages are created as regular templates. There are no automatic collection URLs.

**templates/services.liquid:**
```liquid
<h1>Our Services</h1>
<div class="grid grid-cols-3 gap-6">
  {% for service in datasets.services %}
    <div class="card">
      <h2>{{ service.title }}</h2>
      <p>{{ service.description }}</p>
      <a href="{{ service | item_url }}">Learn More</a>
    </div>
  {% endfor %}
</div>
```

This renders at `/services` (template match).

### Pagination

For paginated collections, use template-driven pagination:

```liquid
<!-- templates/blog.liquid -->
{% assign per_page = 10 %}
{% assign page = request.params.page | default: 1 | plus: 0 %}
{% assign offset = page | minus: 1 | times: per_page %}
{% assign total = datasets.posts.size %}
{% assign total_pages = total | divided_by: per_page | ceil %}

<h1>Blog</h1>

{% for post in datasets.posts limit: per_page offset: offset %}
  {% swarm_render 'post-card', post: post %}
{% endfor %}

<nav class="pagination">
  {% if page > 1 %}
    <a href="/blog?page={{ page | minus: 1 }}">← Previous</a>
  {% endif %}

  <span>Page {{ page }} of {{ total_pages }}</span>

  {% if page < total_pages %}
    <a href="/blog?page={{ page | plus: 1 }}">Next →</a>
  {% endif %}
</nav>
```

### Complete Multi-Dataset Example

Here's a complete example for a tree service business with services, locations, and testimonials:

**siteswarm.json:**
```json
{
  "name": "Tree Service Pro",
  "version": "1.0.0",
  "datasets": {
    "locations": {
      "name": "Service Areas",
      "slug_field": "slug",
      "item_template": "location"
    },
    "services": {
      "name": "Services",
      "slug_field": "slug",
      "item_template": "service"
    },
    "testimonials": {
      "name": "Testimonials",
      "slug_field": "slug",
      "item_template": "testimonial"
    }
  }
}
```

**templates/index.liquid (Homepage):**
```liquid
{% section 'hero' %}

<section class="services">
  <h2>Our Services</h2>
  <div class="grid">
    {% for service in datasets.services limit: 6 %}
      <a href="{{ service | item_url }}" class="card">
        <h3>{{ service.title }}</h3>
        <p>{{ service.description | truncate: 100 }}</p>
      </a>
    {% endfor %}
  </div>
  <a href="/services">View All Services</a>
</section>

<section class="locations">
  <h2>Areas We Serve</h2>
  <ul>
    {% for location in datasets.locations %}
      <li><a href="{{ location | item_url }}">{{ location.name }}, {{ location.state }}</a></li>
    {% endfor %}
  </ul>
</section>
```

**templates/services.liquid (Collection page):**
```liquid
<h1>Our Services</h1>
{% for service in datasets.services %}
  <div class="service-card">
    <h2><a href="{{ service | item_url }}">{{ service.title }}</a></h2>
    <p>{{ service.description }}</p>
    {% if service.price %}
      <span class="price">Starting at {{ service.price }}</span>
    {% endif %}
  </div>
{% endfor %}
```

**templates/service.liquid (Item page via fallthrough):**
```liquid
<article>
  <h1>{{ service.title }}</h1>
  {% if service.image %}
    <img src="{{ service.image | img_url: 'large' }}" alt="">
  {% endif %}
  <div class="content">{{ service.content }}</div>

  <aside class="related-locations">
    <h3>Available In:</h3>
    {% for location in datasets.locations %}
      <a href="{{ location | item_url }}">{{ location.name }}</a>
    {% endfor %}
  </aside>
</article>
```

**templates/location.liquid (Item page via fallthrough):**
```liquid
<article>
  <h1>{{ location.name }}, {{ location.state }}</h1>
  <div class="content">{{ location.description }}</div>

  <section class="services-in-area">
    <h2>Services in {{ location.name }}</h2>
    {% for service in datasets.services %}
      <a href="{{ service | item_url }}">{{ service.title }}</a>
    {% endfor %}
  </section>
</article>
```

**URL structure:**
- `/` → Homepage
- `/services` → Services collection (template match)
- `/tree-removal` → Service item (fallthrough: services)
- `/stump-grinding` → Service item (fallthrough: services)
- `/austin-tx` → Location item (fallthrough: locations)
- `/leander-tx` → Location item (fallthrough: locations)

### Best Practices

1. **Use descriptive slugs:** `tree-removal` not `service-1`
2. **Avoid slug collisions:** Don't use the same slug in multiple datasets
3. **Create collection templates:** Make `/services`, `/locations` pages as templates
4. **Consider SEO:** Root-level URLs are great for SEO
5. **Use parameterized routes for hierarchy:** When you need `/category/item` structure

---

## Assets

### CSS

```liquid
<link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
```

Or use helper:
```liquid
{{ 'theme.css' | asset_url | stylesheet_tag }}
```

### JavaScript

```liquid
<script src="{{ 'theme.js' | asset_url }}"></script>
```

Or use helper:
```liquid
{{ 'theme.js' | asset_url | script_tag }}
```

### Images

**Theme images:**
```liquid
<img src="{{ 'logo.svg' | asset_url }}" alt="Logo">
```

**Dataset images with sizing:**
```liquid
<img src="{{ article.image | img_url: 'medium' }}" alt="">
```

### Dynamic CSS from Settings

```liquid
<style>
  :root {
    --color-primary: {{ settings.primary_color | default: '#3b82f6' }};
  }
</style>
```

---

## Complete Examples

### Layout

```liquid
<!-- layout/theme.liquid -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title | default: site.name }}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body class="min-h-screen flex flex-col bg-gray-50">
  {% section 'header' %}
  <main class="flex-1">{{ content_for_layout }}</main>
  {% section 'footer' %}
  <script src="{{ 'theme.js' | asset_url }}"></script>
</body>
</html>
```

### Homepage

```liquid
<!-- templates/index.liquid -->
<div class="container mx-auto px-4 py-12">
  {% section 'hero' %}

  {% if datasets.articles.size > 0 %}
  <section class="py-12">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold">Latest Articles</h2>
      <a href="/articles" class="text-blue-600">View all →</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {% for article in datasets.articles limit: 3 %}
        {% swarm_render 'article-card', article: article %}
      {% endfor %}
    </div>
  </section>
  {% endif %}
</div>
```

### Collection Page (Services Listing)

```liquid
<!-- templates/services.liquid -->
<div class="container mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold mb-8">Our Services</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {% for service in datasets.services %}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold">{{ service.title }}</h2>
        <p class="text-gray-600 mt-2">{{ service.description | truncate: 100 }}</p>
        <a href="{{ service | item_url }}" class="text-blue-600 mt-4 inline-block">
          Learn more →
        </a>
      </div>
    {% else %}
      <p class="col-span-3 text-gray-500 text-center py-12">No services found.</p>
    {% endfor %}
  </div>
</div>
```

### Item Page

```liquid
<!-- templates/service.liquid -->
<article class="container mx-auto px-4 py-12 max-w-3xl">
  <nav class="text-sm text-gray-500 mb-6">
    <a href="/">Home</a> /
    <a href="/services">Services</a> /
    <span>{{ service.title }}</span>
  </nav>

  <header class="mb-8">
    <h1 class="text-4xl font-bold">{{ service.title }}</h1>
    {% if service.price %}
      <p class="text-2xl text-green-600 mt-2">{{ service.price }}</p>
    {% endif %}
  </header>

  {% if service.image %}
    <img src="{{ service.image | img_url: 'large' }}" alt="" class="w-full rounded-lg mb-8">
  {% endif %}

  <div class="prose prose-lg">{{ service.content }}</div>

  <a href="/services" class="inline-block mt-8 text-blue-600">
    ← Back to Services
  </a>
</article>
```

### Header Section

```liquid
<!-- sections/header.liquid -->
<header class="bg-white shadow-sm">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold">
        {{ section.settings.logo_text | default: site.name }}
      </a>
      <nav class="flex gap-6">
        {% assign links = section.settings.nav_links | split: '|' %}
        {% for link in links %}
          {% assign parts = link | split: ':' %}
          <a href="{{ parts[1] | strip }}" class="text-gray-600 hover:text-gray-900">
            {{ parts[0] | strip }}
          </a>
        {% endfor %}
      </nav>
    </div>
  </div>
</header>

{% schema %}
{
  "name": "Header",
  "settings": [
    {
      "type": "text",
      "id": "logo_text",
      "label": "Logo Text"
    },
    {
      "type": "textarea",
      "id": "nav_links",
      "label": "Navigation Links",
      "info": "Format: Label:URL | Label:URL",
      "default": "Home:/ | Articles:/articles"
    }
  ]
}
{% endschema %}
```

### Article Card Snippet

```liquid
<!-- snippets/article-card.liquid -->
<article class="bg-white rounded-lg shadow-sm overflow-hidden">
  {% if article.image %}
    <a href="{{ article | item_url }}">
      <img src="{{ article.image | img_url: 'medium' }}" alt="" class="w-full h-48 object-cover">
    </a>
  {% endif %}
  <div class="p-6">
    <h3 class="font-bold text-lg mb-2">
      <a href="{{ article | item_url }}" class="hover:text-blue-600">
        {{ article.title }}
      </a>
    </h3>
    {% if article.excerpt %}
      <p class="text-gray-600 text-sm">{{ article.excerpt | truncate_words: 20 }}</p>
    {% endif %}
    <div class="flex justify-between items-center mt-4 text-sm text-gray-500">
      {% if article.published_at %}
        <time>{{ article.published_at | date: '%b %d, %Y' }}</time>
      {% endif %}
      <a href="{{ article | item_url }}" class="text-blue-600">Read more →</a>
    </div>
  </div>
</article>
```

### Pagination Snippet

```liquid
<!-- snippets/pagination.liquid -->
<nav class="flex justify-center gap-4 mt-12" aria-label="Pagination">
  {% if pagination.prev_url %}
    <a href="{{ pagination.prev_url }}" class="px-4 py-2 border rounded hover:bg-gray-50">
      ← Previous
    </a>
  {% else %}
    <span class="px-4 py-2 border rounded text-gray-400">← Previous</span>
  {% endif %}

  <span class="px-4 py-2">
    Page {{ pagination.current_page }} of {{ pagination.total_pages }}
  </span>

  {% if pagination.next_url %}
    <a href="{{ pagination.next_url }}" class="px-4 py-2 border rounded hover:bg-gray-50">
      Next →
    </a>
  {% else %}
    <span class="px-4 py-2 border rounded text-gray-400">Next →</span>
  {% endif %}
</nav>
```

### Settings Schema

```json
[
  {
    "name": "General",
    "settings": [
      {
        "type": "text",
        "id": "site_description",
        "label": "Site Description",
        "default": "A website built with Site Swarm"
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
  },
  {
    "name": "Social Media",
    "settings": [
      {
        "type": "url",
        "id": "twitter_url",
        "label": "Twitter URL"
      },
      {
        "type": "url",
        "id": "facebook_url",
        "label": "Facebook URL"
      }
    ]
  }
]
```

---

## Quick Reference

### Global Objects

| Object | Description |
|--------|-------------|
| `site` | Site info (name, url, subdomain) |
| `settings` | Theme settings |
| `request` | Current request (path, host) |
| `datasets` | All datasets by alias |
| `dataset` | Dataset config (on item pages) |
| `route_params` | URL parameters (parameterized routes) |
| `content_for_layout` | Page content (layouts) |
| `section` | Section info (sections) |

### Custom Tags

| Tag | Purpose |
|-----|---------|
| `{% section 'name' %}` | Render section with settings |
| `{% swarm_render 'name' %}` | Render snippet |
| `{% dropin 'name' %}` | Render user-managed HTML content |
| `{% schema %}...{% endschema %}` | Define section settings |
| `{% routes %}...{% endroutes %}` | Define parameterized URL routes |
| `{% assign_global var = value %}` | Set variable accessible in layout (for page titles) |

### Custom Filters

| Filter | Example |
|--------|---------|
| `asset_url` | `{{ 'theme.css' \| asset_url }}` |
| `img_url` | `{{ image \| img_url: 'medium' }}` |
| `item_url` | `{{ article \| item_url }}` → `/my-slug` |
| `link_to` | `{{ 'Text' \| link_to: '/url' }}` |
| `date` | `{{ date \| date: '%B %d, %Y' }}` |
| `truncate_words` | `{{ text \| truncate_words: 20 }}` |
| `slugify` | `{{ 'Hello!' \| slugify }}` |
| `stylesheet_tag` | `{{ url \| stylesheet_tag }}` |
| `script_tag` | `{{ url \| script_tag }}` |

### Image Sizes

| Size | Dimensions |
|------|------------|
| `small` | 100x100 |
| `medium` | 300x300 |
| `large` | 600x600 |
| `xlarge` | 1200x1200 |
| Custom | `WxH` |

### Setting Types

| Type | Description |
|------|-------------|
| `text` | Single line |
| `textarea` | Multi-line |
| `richtext` | Rich text editor |
| `image_picker` | Image selector |
| `url` | URL input |
| `checkbox` | Boolean |
| `range` | Numeric slider |
| `select` | Dropdown |
| `color` | Color picker |

### URL Routing (Fallthrough Resolution)

1. **Template match:** `/about` → `templates/about.liquid`
2. **Parameterized routes:** `/services/:slug` → template with `{% routes %}`
3. **Fallthrough slug:** `/my-slug` → first dataset with matching record
4. **Hyphenated path:** `/about/team` → `templates/about-team.liquid`
5. **404 fallback:** `templates/404.liquid`

**Fallthrough order:** Datasets checked alphabetically by alias (e.g., `locations` before `services`)
