# HostNet Theme Cheat Sheet

Quick reference for theme development. For full documentation, see [THEME-DEVELOPMENT-GUIDE.md](THEME-DEVELOPMENT-GUIDE.md).

---

## Theme Structure

```
theme/
├── layout/
│   └── theme.liquid          # Required - base HTML wrapper
├── templates/
│   ├── index.liquid          # Homepage
│   ├── page.liquid           # Generic pages
│   ├── collection.liquid     # Dataset list pages
│   ├── article.liquid        # Dataset item pages
│   └── 404.liquid            # Not found page
├── sections/
│   ├── header.liquid         # Reusable sections with settings
│   └── footer.liquid
├── snippets/
│   ├── card.liquid           # Reusable partials (no settings)
│   └── pagination.liquid
├── assets/
│   ├── theme.css
│   └── theme.js
└── config/
    ├── settings_schema.json  # Theme settings definition
    └── settings_data.json    # Default values
```

**Required file:** `layout/theme.liquid`

---

## Global Objects

| Object | Description | Example |
|--------|-------------|---------|
| `site` | Site info | `{{ site.name }}` |
| `settings` | Theme settings | `{{ settings.logo_text }}` |
| `request` | Current request | `{{ request.path }}` |
| `datasets` | Mounted datasets | `{% for p in datasets.posts %}` |
| `collection` | Records (list pages) | `{% for item in collection %}` |
| `pagination` | Page info (list pages) | `{{ pagination.current_page }}` |
| `mount` | Dataset mount info | `{{ mount.alias }}` |
| `content_for_layout` | Page content (layouts) | `{{ content_for_layout }}` |
| `section` | Section context | `{{ section.settings.title }}` |

### Object Properties

```liquid
# site
{{ site.name }}
{{ site.subdomain }}
{{ site.url }}
{{ site.staging_url }}
{{ site.production_url }}

# request
{{ request.path }}
{{ request.host }}
{{ request.method }}

# pagination
{{ pagination.current_page }}
{{ pagination.total_pages }}
{{ pagination.next_url }}
{{ pagination.prev_url }}

# mount
{{ mount.alias }}
{{ mount.mount_path }}
{{ mount.slug_field }}
{{ mount.items_per_page }}
```

---

## Custom Tags

### Section Tag
```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'footer' %}
```
Renders a section from `sections/` with its settings applied.

### Render Tag
```liquid
{% hostnet_render 'card' %}
{% hostnet_render 'card', item: article %}
{% hostnet_render 'card', item: article, show_image: true %}
{% hostnet_render 'card' for articles as article %}
```
Renders a snippet from `snippets/` with isolated variable scope.

### Schema Tag (sections only)
```liquid
{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "title", "label": "Title", "default": "Welcome" }
  ]
}
{% endschema %}
```
Defines configurable settings for a section. Renders nothing.

---

## Custom Filters

| Filter | Input | Output |
|--------|-------|--------|
| `asset_url` | `{{ 'theme.css' \| asset_url }}` | `/assets/theme.css` |
| `img_url` | `{{ image \| img_url: 'medium' }}` | Sized image URL |
| `item_url` | `{{ article \| item_url }}` | `/blog/my-article` |
| `link_to` | `{{ 'About' \| link_to: '/about' }}` | `<a href="/about">About</a>` |
| `date` | `{{ date \| date: '%B %d, %Y' }}` | `January 15, 2025` |
| `truncate_words` | `{{ text \| truncate_words: 20 }}` | First 20 words... |
| `slugify` | `{{ 'Hello World!' \| slugify }}` | `hello-world` |
| `stylesheet_tag` | `{{ url \| stylesheet_tag }}` | `<link rel="stylesheet">` |
| `script_tag` | `{{ url \| script_tag }}` | `<script src="...">` |

### Image Sizes

| Size | Dimensions |
|------|------------|
| `small` | 100x100 |
| `medium` | 300x300 |
| `large` | 600x600 |
| `xlarge` | 1200x1200 |
| `WxH` | Custom, e.g., `400x300` |

```liquid
{{ article.image | img_url: 'medium' }}
{{ article.image | img_url: '800x400' }}
```

---

## Setting Types

| Type | Description |
|------|-------------|
| `text` | Single line input |
| `textarea` | Multi-line input |
| `richtext` | Rich text editor |
| `image_picker` | Image selector |
| `url` | URL input |
| `checkbox` | Boolean toggle |
| `range` | Numeric slider |
| `select` | Dropdown options |
| `color` | Color picker |
| `dataset` | Dataset selector |

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

## URL Routing

Priority order:

1. **Template match:** `/about` → `templates/about.liquid`
2. **Dataset list:** `/blog` → `templates/collection.liquid`
3. **Dataset item:** `/blog/my-post` → `templates/article.liquid`
4. **404:** `templates/404.liquid`

---

## Common Patterns

### Layout Template
```liquid
<!DOCTYPE html>
<html>
<head>
  <title>{{ page_title | default: site.name }}</title>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body>
  {% section 'header' %}
  <main>{{ content_for_layout }}</main>
  {% section 'footer' %}
  <script src="{{ 'theme.js' | asset_url }}"></script>
</body>
</html>
```

### Reusable Card Snippet
```liquid
<!-- snippets/article-card.liquid -->
<article class="card">
  {% if article.image %}
    <img src="{{ article.image | img_url: 'medium' }}" alt="{{ article.title }}">
  {% endif %}
  <h3><a href="{{ article | item_url }}">{{ article.title }}</a></h3>
  <p>{{ article.excerpt | truncate_words: 20 }}</p>
</article>
```

### Using Card in Collection
```liquid
<div class="grid">
  {% for article in collection %}
    {% hostnet_render 'article-card', article: article %}
  {% else %}
    <p>No articles found.</p>
  {% endfor %}
</div>

{% if pagination.total_pages > 1 %}
  {% hostnet_render 'pagination' %}
{% endif %}
```

### Pagination Snippet
```liquid
<!-- snippets/pagination.liquid -->
<nav class="pagination">
  {% if pagination.prev_url %}
    <a href="{{ pagination.prev_url }}">Previous</a>
  {% endif %}

  <span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span>

  {% if pagination.next_url %}
    <a href="{{ pagination.next_url }}">Next</a>
  {% endif %}
</nav>
```

### Section with Settings
```liquid
<!-- sections/hero.liquid -->
<section class="hero" style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
  {% if section.settings.button_text %}
    <a href="{{ section.settings.button_url }}">{{ section.settings.button_text }}</a>
  {% endif %}
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "title", "label": "Title", "default": "Welcome" },
    { "type": "textarea", "id": "subtitle", "label": "Subtitle" },
    { "type": "text", "id": "button_text", "label": "Button Text" },
    { "type": "url", "id": "button_url", "label": "Button URL" },
    { "type": "color", "id": "bg_color", "label": "Background Color", "default": "#3b82f6" }
  ]
}
{% endschema %}
```

### Dataset Access on Any Page
```liquid
<!-- Access mounted datasets anywhere -->
<h2>Latest Posts</h2>
{% for post in datasets.posts limit: 3 %}
  {% hostnet_render 'post-card', post: post %}
{% endfor %}

<h2>Featured Products</h2>
{% for product in datasets.products limit: 4 %}
  {% hostnet_render 'product-card', product: product %}
{% endfor %}
```

### Conditional Display
```liquid
{% if settings.show_hero %}
  {% section 'hero' %}
{% endif %}

{% if collection.size > 0 %}
  <div class="grid">
    {% for item in collection %}
      {% hostnet_render 'card', item: item %}
    {% endfor %}
  </div>
{% else %}
  <p>No items found.</p>
{% endif %}
```

---

## Config Files

### settings_schema.json
```json
[
  {
    "name": "General",
    "settings": [
      { "type": "text", "id": "site_tagline", "label": "Tagline" },
      { "type": "image_picker", "id": "logo", "label": "Logo" }
    ]
  },
  {
    "name": "Colors",
    "settings": [
      { "type": "color", "id": "primary_color", "label": "Primary", "default": "#3b82f6" },
      { "type": "color", "id": "text_color", "label": "Text", "default": "#1f2937" }
    ]
  }
]
```

### settings_data.json
```json
{
  "site_tagline": "Build something amazing",
  "primary_color": "#3b82f6",
  "text_color": "#1f2937"
}
```

---

## Liquid Basics

### Variables
```liquid
{{ variable }}
{{ object.property }}
{{ array[0] }}
```

### Assignment
```liquid
{% assign title = "Hello" %}
{% capture greeting %}Hello, {{ name }}!{% endcapture %}
```

### Conditionals
```liquid
{% if condition %}
{% elsif other %}
{% else %}
{% endif %}

{% unless condition %}{% endunless %}

{% case variable %}
  {% when 'value1' %}
  {% when 'value2' %}
  {% else %}
{% endcase %}
```

### Loops
```liquid
{% for item in collection %}
  {{ forloop.index }}    # 1, 2, 3...
  {{ forloop.index0 }}   # 0, 1, 2...
  {{ forloop.first }}    # true/false
  {{ forloop.last }}     # true/false
  {{ forloop.length }}   # total count
{% else %}
  # Runs if collection is empty
{% endfor %}

{% for item in collection limit: 5 offset: 2 %}
{% for item in collection reversed %}
```

### Common Filters
```liquid
{{ string | upcase }}
{{ string | downcase }}
{{ string | capitalize }}
{{ string | strip }}
{{ string | truncate: 100 }}
{{ string | replace: 'old', 'new' }}
{{ string | split: ',' }}
{{ array | join: ', ' }}
{{ array | first }}
{{ array | last }}
{{ array | size }}
{{ number | plus: 1 }}
{{ number | minus: 1 }}
{{ number | times: 2 }}
{{ number | divided_by: 2 }}
{{ value | default: 'fallback' }}
```

---

## File Naming

| Directory | Naming | Example |
|-----------|--------|---------|
| `layout/` | `*.liquid` | `theme.liquid` |
| `templates/` | `*.liquid` | `article.liquid`, `collection.liquid` |
| `sections/` | `*.liquid` | `hero.liquid`, `header.liquid` |
| `snippets/` | `*.liquid` | `card.liquid`, `pagination.liquid` |
| `assets/` | Any | `theme.css`, `app.js`, `logo.png` |
| `config/` | JSON | `settings_schema.json` |
| `locales/` | JSON | `en.json`, `es.json` |
