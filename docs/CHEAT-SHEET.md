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
| `site.media` | Media library | `{{ site.media.logo.url }}` |
| `settings` | Theme settings | `{{ settings.logo_text }}` |
| `request` | Current request | `{{ request.path }}` |
| `datasets` | Mounted datasets | `{% for p in datasets.posts %}` |
| `collection` | Records (list pages) | `{% for item in collection %}` |
| `pagination` | Page info (list pages) | `{{ pagination.current_page }}` |
| `mount` | Dataset mount info | `{{ mount.alias }}` |
| `route_params` | URL params (parameterized routes) | `{{ route_params.city }}` |
| `content_for_layout` | Page content (layouts) | `{{ content_for_layout }}` |
| `section` | Section context | `{{ section.settings.title }}` |
| `section.blocks` | Block array (sections) | `{% for block in section.blocks %}` |

### Object Properties

```liquid
# site
{{ site.name }}
{{ site.subdomain }}
{{ site.url }}
{{ site.staging_url }}
{{ site.production_url }}

# site.media (media library)
{{ site.media['logo.png'].url }}        # By filename
{{ site.media.logo.url }}               # Without extension
{{ site.media.hero_image.url }}         # Underscores → hyphens
{{ site.media.logo.width }}             # Image dimensions
{{ site.media.logo.height }}
{{ site.media.logo.content_type }}
{{ site.media.logo.size }}              # Bytes
{{ site.media.logo.alt }}               # Alt text

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

### Drop-In Tag
```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'announcement-banner' %}
{% dropin 'cookie-notice' %}
```
Renders user-managed HTML content from the dashboard. Returns empty string if not found.

**With fallback:**
```liquid
{% capture content %}{% dropin 'promo' %}{% endcapture %}
{{ content | default: '<p>Default text</p>' }}
```

Drop-ins are plain HTML only (no Liquid), managed by site owners, and support cascading scope (site-specific overrides account-wide).

### Assign Global Tag
```liquid
{% assign_global page_title = "Services - My Company" %}
{% assign_global page_description = "Professional services..." %}
```
Sets a variable accessible in the parent layout. Use for SEO (page titles, descriptions). Regular `assign` variables are template-scoped and invisible to the layout.

### Routes Tag (templates only)
```liquid
{% routes %}
/companies/:city/:state/:slug
/companies/:slug
{% endroutes %}
```
Defines parameterized URL patterns. Dynamic segments start with `:` and capture values.

**Accessing params:**
```liquid
{{ city }}                    <!-- top-level variable -->
{{ route_params.city }}       <!-- via route_params object -->
```

**Complete example:**
```liquid
{% routes %}
/products/:category
{% endroutes %}

<h1>{{ category | capitalize }} Products</h1>
{% for product in datasets.products %}
  {% if product.category == category %}
    {% hostnet_render 'product-card', product: product %}
  {% endif %}
{% endfor %}
```

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

### Theme Asset Variants

Image assets support variants (same as media library):
```liquid
<img src="{{ 'logo.png' | asset_url }}?size=large">
<img src="/assets/logo-large.png">
<img src="/assets/hero-800x600.jpg">
```

### Image Sizes

| Size | Dimensions |
|------|------------|
| `small` | 100x100 |
| `medium` | 300x300 |
| `large` | 600x600 |
| `xlarge` | 1200x1200 |
| `original` | Unoptimized upload |
| `WxH` | Custom, e.g., `400x300` |

Images are auto-optimized on upload (85% quality, max 2400px). Use `original` to access uncompressed file.

```liquid
{{ article.image | img_url: 'medium' }}
{{ article.image | img_url: '800x400' }}
{{ article.image | img_url: 'original' }}
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
2. **Parameterized routes:** `/companies/seattle/wa/acme` → template with matching `{% routes %}`
3. **Dataset list:** `/blog` → `templates/collection.liquid`
4. **Dataset item:** `/blog/my-post` → `templates/article.liquid`
5. **404:** `templates/404.liquid`

---

## Common Patterns

### Layout Template
```liquid
<!DOCTYPE html>
<html>
<head>
  <title>{{ page_title | default: site.name }}</title>
  <meta name="description" content="{{ page_description | default: settings.tagline }}">
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

### Setting Page Titles (SEO)

Every template should set `page_title` using `assign_global`:

```liquid
<!-- templates/tree-removal.liquid -->
{% assign_global page_title = "Tree Removal - My Company" %}
{% assign_global page_description = "Professional tree removal services..." %}

{% section 'hero' %}
{% section 'services' %}
```

The layout's `<title>` tag references this with a fallback:
```liquid
<title>{{ page_title | default: site.name }}</title>
```

**Note:** Use `assign_global`, not `assign`. Regular `assign` variables are template-scoped and won't reach the layout.

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

### Section with Blocks
```liquid
<!-- sections/team.liquid -->
<div class="team-grid">
  {% for block in section.blocks %}
    <div class="card">
      <h3>{{ block.settings.name }}</h3>
      <p>{{ block.settings.role }}</p>
    </div>
  {% endfor %}
</div>

{% schema %}
{
  "name": "Team",
  "blocks": [
    {
      "type": "member",
      "name": "Team Member",
      "settings": [
        { "type": "text", "id": "name", "label": "Name" },
        { "type": "text", "id": "role", "label": "Role" }
      ]
    }
  ]
}
{% endschema %}
```

See [Sections, Snippets & Blocks](sections-and-snippets.md#section-blocks) for full documentation.

### Media Library Usage
```liquid
<!-- Logo from media library (with fallback) -->
{% assign logo = site.media['logo.png'] %}
{% if logo %}
  <img src="{{ logo.url }}" alt="{{ site.name }}" width="{{ logo.width }}" height="{{ logo.height }}">
{% else %}
  <span class="site-name">{{ site.name }}</span>
{% endif %}

<!-- Image with variant -->
<img src="{{ site.media.hero.url }}?size=large" alt="Hero image">

<!-- Using img_url filter -->
<img src="{{ "banner.jpg" | img_url: '800x400' }}" alt="Banner">

<!-- Iterate all images -->
{% for file in site.media %}
  {% if file.image? %}
    <img src="{{ file.url }}" alt="{{ file.alt | default: file.filename }}">
  {% endif %}
{% endfor %}
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
