# HostNet Theme Development Guide

Complete reference for building HostNet themes. This document is self-contained and covers all aspects of theme development.

---

## Table of Contents

1. [Overview](#overview)
2. [Theme Structure](#theme-structure)
3. [Liquid Templating](#liquid-templating)
4. [Global Objects](#global-objects)
5. [Custom Tags](#custom-tags)
6. [Custom Filters](#custom-filters)
7. [Sections and Snippets](#sections-and-snippets)
8. [Settings System](#settings-system)
9. [Datasets and Routing](#datasets-and-routing)
10. [Assets](#assets)
11. [Complete Examples](#complete-examples)

---

## Overview

A HostNet theme is a collection of Liquid templates, reusable components, and static assets that define how a website looks and functions.

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

### mount

On dataset pages only. Mount configuration.

```liquid
{{ mount.alias }}          # Dataset alias (e.g., "articles")
{{ mount.mount_path }}     # URL path (e.g., "/blog")
{{ mount.slug_field }}     # Field used for URLs
{{ mount.items_per_page }} # Records per page
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

### hostnet_render

Renders a snippet from `snippets/` with isolated scope.

**Basic:**
```liquid
{% hostnet_render 'icon' %}
```

**With variables:**
```liquid
{% hostnet_render 'article-card', article: post %}
{% hostnet_render 'button', text: 'Click', url: '/about' %}
```

**Collection iteration:**
```liquid
{% hostnet_render 'article-card' for articles as article %}
```

**Note:** `hostnet_render` uses database-backed template lookup. The name distinguishes it from Liquid's built-in file-based `render` tag.

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
{% hostnet_render 'article-card', article: post %}
{% hostnet_render 'article-card' for collection as article %}
```

### When to Use Each

| Use Sections When... | Use Snippets When... |
|----------------------|----------------------|
| Site owners should customize content | Content comes from passed variables |
| Component has configurable options | Component is purely presentational |
| Examples: Header, Footer, Hero | Examples: Cards, Buttons, Icons |

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

### URL Resolution Order

1. **Template match:** `/about` → `templates/about.liquid`
2. **Dataset list:** `/blog` → `templates/collection.liquid`
3. **Dataset item:** `/blog/my-post` → `templates/article.liquid`
4. **404:** `templates/404.liquid`

### Accessing Datasets

```liquid
<!-- On any page -->
{% for article in datasets.articles limit: 3 %}
  {{ article.title }}
{% endfor %}

<!-- On collection pages -->
{% for item in collection %}
  {{ item.title }}
{% endfor %}
```

### Dataset Records

Records have dynamic fields defined by site owner:

```liquid
{{ article.title }}
{{ article.slug }}
{{ article.excerpt }}
{{ article.content }}
{{ article.image | img_url: 'large' }}
{{ article.published_at | date: '%B %d, %Y' }}
{{ article.author }}
{{ article.category }}
```

### Generating URLs

```liquid
{{ article | item_url }}
# Output: /blog/my-article-slug

<a href="{{ article | item_url }}">Read more</a>
```

### Pagination

```liquid
{% if pagination.total_pages > 1 %}
  <nav class="pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}">← Previous</a>
    {% endif %}
    <span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span>
    {% if pagination.next_url %}
      <a href="{{ pagination.next_url }}">Next →</a>
    {% endif %}
  </nav>
{% endif %}
```

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
        {% hostnet_render 'article-card', article: article %}
      {% endfor %}
    </div>
  </section>
  {% endif %}
</div>
```

### Collection Page

```liquid
<!-- templates/collection.liquid -->
<div class="container mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold mb-8">{{ mount.alias | capitalize }}</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {% for item in collection %}
      {% hostnet_render 'article-card', article: item %}
    {% else %}
      <p class="col-span-3 text-gray-500 text-center py-12">No items found.</p>
    {% endfor %}
  </div>

  {% if pagination.total_pages > 1 %}
    {% hostnet_render 'pagination' %}
  {% endif %}
</div>
```

### Item Page

```liquid
<!-- templates/article.liquid -->
<article class="container mx-auto px-4 py-12 max-w-3xl">
  <nav class="text-sm text-gray-500 mb-6">
    <a href="/">Home</a> /
    <a href="{{ mount.mount_path }}">{{ mount.alias | capitalize }}</a> /
    <span>{{ article.title }}</span>
  </nav>

  <header class="mb-8">
    <h1 class="text-4xl font-bold">{{ article.title }}</h1>
    {% if article.published_at %}
      <time class="text-gray-500 mt-2 block">
        {{ article.published_at | date: '%B %d, %Y' }}
      </time>
    {% endif %}
  </header>

  {% if article.image %}
    <img src="{{ article.image | img_url: 'large' }}" alt="" class="w-full rounded-lg mb-8">
  {% endif %}

  <div class="prose prose-lg">{{ article.content }}</div>

  <a href="{{ mount.mount_path }}" class="inline-block mt-8 text-blue-600">
    ← Back to {{ mount.alias }}
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
        "default": "A website built with HostNet"
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
| `datasets` | Mounted datasets by alias |
| `collection` | Records on list pages |
| `pagination` | Page navigation info |
| `mount` | Dataset mount config |
| `content_for_layout` | Page content (layouts) |
| `section` | Section info (sections) |

### Custom Tags

| Tag | Purpose |
|-----|---------|
| `{% section 'name' %}` | Render section with settings |
| `{% hostnet_render 'name' %}` | Render snippet |
| `{% dropin 'name' %}` | Render user-managed HTML content |
| `{% schema %}...{% endschema %}` | Define section settings |
| `{% assign_global var = value %}` | Set variable accessible in layout (for page titles) |

### Custom Filters

| Filter | Example |
|--------|---------|
| `asset_url` | `{{ 'theme.css' \| asset_url }}` |
| `img_url` | `{{ image \| img_url: 'medium' }}` |
| `item_url` | `{{ article \| item_url }}` |
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

### URL Routing

1. Template match: `/about` → `templates/about.liquid`
2. Dataset list: `/blog` → `templates/collection.liquid`
3. Dataset item: `/blog/my-post` → `templates/article.liquid`
4. 404: `templates/404.liquid`
