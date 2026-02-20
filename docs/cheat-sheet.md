# Site Swarm Theme Cheat Sheet

Quick reference for theme development. For full documentation, see [README.md](README.md).

---

## Theme Structure

```
theme/
├── siteswarm.json            # Theme manifest (name, version, category)
├── layout/
│   └── theme.liquid          # Required - base HTML wrapper
├── templates/                # Dataset rendering
│   ├── index.liquid          # Homepage
│   ├── page.liquid           # Generic pages
│   ├── collection.liquid     # Dataset list pages
│   ├── article.liquid        # Dataset item pages
│   ├── search.liquid         # Search results (/search?q=...)
│   └── 404.liquid            # Not found page
├── page_templates/           # Static pages with per-page settings
│   ├── about.liquid
│   └── service.liquid
├── sections/
│   ├── header.liquid         # Reusable sections (schema in config/)
│   └── footer.liquid
├── snippets/
│   ├── card.liquid           # Reusable partials
│   └── pagination.liquid
├── dropins/
│   └── promo-banner.liquid   # Default content (Liquid processed)
├── assets/
│   ├── theme.css
│   └── theme.js
└── config/
    ├── settings_schema.json  # Theme settings definition
    ├── settings_data.json    # Default values
    ├── sections/             # Section schemas (sidecar pattern)
    │   ├── header.json
    │   └── footer.json
    └── page_templates/       # Page template schemas
        └── about.json
```

**Required file:** `layout/theme.liquid`

---

## Theme Manifest (siteswarm.json)

```json
{
  "name": "My Theme",
  "version": "1.0.0",
  "category": "business",
  "subcategory": "agency",
  "tags": ["responsive", "dark-mode", "tailwind"],
  "description": "Theme description",
  "author": "Your Name",
  "datasets": { }
}
```

### Categories

Structured taxonomy for organizing themes. Applied automatically on upload.

| Category | Subcategories |
|----------|---------------|
| `business` | corporate, consulting, agency, startup, saas, marketing |
| `portfolio` | creative, photography, design, art, architecture |
| `blog` | personal, magazine, news, editorial, lifestyle |
| `directory` | listings, classifieds, jobs, real_estate, directories |
| `ecommerce` | shop, fashion, food_drink, marketplace, product |
| `landing_page` | product_launch, app, lead_generation, coming_soon |
| `events` | conference, wedding, music, sports, community |
| `nonprofit` | charity, church, environmental, political |
| `education` | school, course, university, training |
| `personal` | resume, vcard, social, hobby |
| `other` | miscellaneous, multipurpose, starter, experimental |

### Tags

Free-form labels for theme discovery. Lowercase, hyphens, numbers only. Max 20 tags, 50 chars each.

```json
"tags": ["responsive", "dark-mode", "multi-page", "tailwind", "animated"]
```

Spaces/underscores auto-convert to hyphens. Tags are editable from the dashboard after upload.

---

## Global Objects

| Object | Description | Example |
|--------|-------------|---------|
| `site` | Site info | `{{ site.name }}` |
| `site.media` | Media library | `{{ site.media.logo.url }}` |
| `settings` | Theme settings | `{{ settings.logo_text }}` |
| `request` | Current request | `{{ request.path }}`, `{{ request.query }}` |
| `search` | Search context (search page) | `{{ search.query }}`, `{{ search.results }}` |
| `datasets` | Mounted datasets | `{% for p in datasets.posts %}` |
| `collection` | Records (list pages) | `{% for item in collection %}` |
| `pagination` | Page info (list pages & `{% paginate %}`) | `{{ pagination.current_page }}` |
| `paginate` | Paginate block object | `{% for item in paginate.collection %}` |
| `mount` | Dataset mount info | `{{ mount.alias }}` |
| `page` | Page record (page templates) | `{{ page.title }}` |
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
{{ request.query }}              # search query string (value of ?q=)

# search (available on /search?q=...)
{{ search.query }}               # "hello"
{{ search.results }}             # matching records (paginated)
{{ search.total }}               # total matches

# pagination (available on list pages and inside {% paginate %} blocks)
{{ pagination.current_page }}
{{ pagination.total_pages }}
{{ pagination.total_count }}
{{ pagination.per_page }}
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
{% render 'card' %}
{% render 'card', item: article %}
{% render 'card', item: article, show_image: true %}
{% render 'card' for articles as article %}
```
Renders a snippet from `snippets/` with full parent context propagation.

### Schema Tag (deprecated - use sidecar JSON)
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
Defines configurable settings inline. **Deprecated** - use sidecar JSON files in `config/sections/` instead. Still supported for backward compatibility.

### Drop-In Tag
```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'announcement-banner' %}
{% dropin 'promo-banner' %}
```
Renders drop-in content. Resolution order:
1. User content (database) - plain HTML
2. Theme default (`dropins/{name}.liquid`) - Liquid processed
3. Empty string

**Theme default example:**
```liquid
<!-- dropins/promo-banner.liquid -->
<div class="promo">{{ settings.promo_text | default: 'Special offer!' }}</div>
```

User-provided drop-ins (from dashboard) are plain HTML. Theme defaults support Liquid.

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
    {% render 'product-card', product: product %}
  {% endif %}
{% endfor %}
```

---

## Custom Filters

| Filter | Input | Output |
|--------|-------|--------|
| `asset_url` | `{{ 'theme.css' \| asset_url }}` | Theme asset URL (CSS, JS, fonts, static images) |
| `img_url` | `{{ article.image \| img_url: 'medium' }}` | User content image URL (datasets, media, settings) |
| `item_url` | `{{ article \| item_url }}` | `/blog/my-article` |
| `link_to` | `{{ 'About' \| link_to: '/about' }}` | `<a href="/about">About</a>` |
| `date` | `{{ date \| date: '%B %d, %Y' }}` | `January 15, 2025` |
| `truncate_words` | `{{ text \| truncate_words: 20 }}` | First 20 words... |
| `slugify` | `{{ 'Hello World!' \| slugify }}` | `hello-world` |
| `stylesheet_tag` | `{{ url \| stylesheet_tag }}` | `<link rel="stylesheet">` |
| `script_tag` | `{{ url \| script_tag }}` | `<script src="...">` |

### Quick Rule: `asset_url` vs `img_url`

- **`asset_url`** = files in your theme's `assets/` folder (CSS, JS, fonts, static images)
- **`img_url`** = user content (dataset fields, media library, settings)
- Never use `asset_url` on dataset image fields like `article.image` or `service.image`

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

## Dataset Field Types

Valid types for dataset schema fields (in `siteswarm.json`):

| Type | Description |
|------|-------------|
| `string` | Short text (names, titles, slugs) |
| `text` | Long-form text/HTML (content, bios) |
| `integer` | Whole numbers (counts, IDs) |
| `decimal` | Numbers with decimals (prices, ratings) |
| `boolean` | True/false (featured, active) |
| `datetime` | Date and time |
| `date` | Date only |
| `array` | List of values (tags, categories) |
| `json` | Structured object (config, metadata) |
| `attachment` | Single file upload |
| `attachments` | Multiple file uploads |

**Common mistakes:** `number`→`decimal`, `object`→`json`, `image`→`attachment`, `images`→`attachments`

Run `swarm lint --fix` to auto-correct invalid types.

---

## URL Routing

Priority order:

1. **Search:** `/search?q=hello` → `templates/search.liquid` (with search context)
2. **Template match:** `/about` → `templates/about.liquid`
3. **Page by slug:** `/plumbing` → Page record → `page_templates/service.liquid`
4. **Implicit page template:** `/contact` → `page_templates/contact.liquid` (no Page record)
5. **Parameterized routes:** `/companies/seattle/wa/acme` → template with matching `{% routes %}`
6. **Dataset list:** `/blog` → `templates/collection.liquid`
7. **Dataset item:** `/blog/my-post` → `templates/article.liquid`
8. **404:** `templates/404.liquid`

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
    {% render 'article-card', article: article %}
  {% else %}
    <p>No articles found.</p>
  {% endfor %}
</div>

{% if pagination.total_pages > 1 %}
  {% render 'pagination' %}
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

### Search Results Page
```liquid
<!-- templates/search.liquid -->
<form action="/search" method="get">
  <input type="text" name="q" value="{{ search.query }}" placeholder="Search...">
  <button type="submit">Search</button>
</form>

{% if search.query %}
  <p>{{ search.total }} results for "{{ search.query }}"</p>
  {% for result in search.results %}
    <article>
      <h3><a href="{{ result._item_url }}">{{ result.title | default: result.name }}</a></h3>
      <p>{{ result.excerpt | default: result.body | truncate_words: 30 }}</p>
      <small>{{ result._dataset_alias | capitalize }}</small>
    </article>
  {% else %}
    <p>No results found.</p>
  {% endfor %}
  {% if pagination.total_pages > 1 %}
    {% render 'pagination' %}
  {% endif %}
{% endif %}
```

See [Search](search.md) for the full guide.

### Paginate Tag (Universal Pagination)

Use `{% paginate %}` to paginate **any** collection in **any** template — not just mounted collection pages.

```liquid
{% paginate datasets.articles by 10 %}
  {% for article in paginate.collection %}
    {% render 'article-card', article: article %}
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}

<!-- With alias for cleaner variable names -->
{% paginate datasets.businesses by 12 as businesses %}
  {% for business in businesses %}
    <h2>{{ business.name }}</h2>
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

Works with: `datasets.*` proxies, arrays from `| where:` filters, any iterable. The same `snippets/pagination.liquid` works inside `{% paginate %}` blocks — the `pagination` object has the same shape.

### Section with Settings

Sections use **sidecar schemas** - a separate JSON file in `config/sections/` instead of inline `{% schema %}` blocks.

**sections/hero.liquid** (pure Liquid, no schema block)
```liquid
<section class="hero" style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
  {% if section.settings.button_text %}
    <a href="{{ section.settings.button_url }}">{{ section.settings.button_text }}</a>
  {% endif %}
</section>
```

**config/sections/hero.json** (schema definition)
```json
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
```

> **Note:** Inline `{% schema %}` blocks are deprecated. Always use sidecar JSON files.

### Section with Blocks

**sections/team.liquid**
```liquid
<div class="team-grid">
  {% for block in section.blocks %}
    <div class="card">
      <h3>{{ block.settings.name }}</h3>
      <p>{{ block.settings.role }}</p>
    </div>
  {% endfor %}
</div>
```

**config/sections/team.json**
```json
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
```

See [Components](components.md) for full documentation on sections, snippets, and blocks.

### Block Data in settings_data.json

Sections with blocks need corresponding data in `config/settings_data.json`:

```json
{
  "sections": {
    "team": {
      "settings": {
        "title": "Our Team"
      },
      "blocks": [
        {
          "type": "member",
          "settings": {
            "name": "Alice Chen",
            "role": "CEO"
          }
        },
        {
          "type": "member",
          "settings": {
            "name": "Bob Martinez",
            "role": "CTO"
          }
        }
      ]
    }
  }
}
```

**Important:** Settings field names (like `name`, `role`) must exactly match the `id` values in your schema.

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
  {% render 'post-card', post: post %}
{% endfor %}

<h2>Featured Products</h2>
{% for product in datasets.products limit: 4 %}
  {% render 'product-card', product: product %}
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
      {% render 'card', item: item %}
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
| `page_templates/` | `*.liquid` | `about.liquid`, `service.liquid` |
| `sections/` | `*.liquid` | `hero.liquid`, `header.liquid` |
| `snippets/` | `*.liquid` | `card.liquid`, `pagination.liquid` |
| `assets/` | Any | `theme.css`, `app.js`, `logo.png` |
| `config/` | JSON | `settings_schema.json` |
| `locales/` | JSON | `en.json`, `es.json` |
