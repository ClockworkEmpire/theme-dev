# Page Templates Guide

Page templates are a distinct template type for static pages, separate from dataset templates.

## Overview

| Directory | Purpose | Sitemap Behavior |
|-----------|---------|------------------|
| `page_templates/` | Static pages (about, contact, services) | Included via linked Page records |
| `templates/` | Dataset rendering (article, location) | Excluded by default (dataset URLs included instead) |

## Why Page Templates?

The original `templates/` directory was designed for rendering dataset records (articles, locations, products). But many sites also need static pages that don't come from datasets:

- About Us
- Contact
- Services
- Landing pages

Page templates solve this by providing a dedicated location for static page layouts with their own settings system.

## Directory Structure

```
theme/
├── templates/           # Dataset templates (article.liquid, collection.liquid)
│   ├── article.liquid
│   ├── collection.liquid
│   └── 404.liquid
│
└── page_templates/      # Static page templates (NEW)
    ├── about.liquid
    ├── contact.liquid
    └── service.liquid
```

## Page ↔ PageTemplate Relationship

```
page_templates/service.liquid     # The structure/layout
    │
    ├── Page: "Plumbing" (slug: plumbing)    → /plumbing
    ├── Page: "Electrical" (slug: electrical) → /electrical
    └── Page: "HVAC" (slug: hvac)            → /hvac
```

- **Page records always reference a page_template**
- **One page_template can have many Pages** (different slugs, different content)
- **page_template with no Pages** → implicit route at `/template-name` (fallback)

## Creating a Page Template

### 1. Define the Template with Schema

Page templates use **sidecar schemas** - a separate JSON file in `config/page_templates/` that defines their editable settings. This keeps Liquid templates clean and allows proper JSON validation.

**page_templates/about.liquid** (pure Liquid, no schema block)
```liquid
<div class="about-page">
  <h1>{{ settings.headline }}</h1>

  <div class="hero" style="background-image: url('{{ settings.hero_image }}')">
    <p>{{ settings.tagline }}</p>
  </div>

  <div class="prose">
    {{ settings.body }}
  </div>

  {% if settings.show_team %}
    {% section 'team-members' %}
  {% endif %}
</div>
```

**config/page_templates/about.json** (schema definition)
```json
{
  "name": "About Page",
  "settings": [
    {
      "id": "headline",
      "type": "text",
      "label": "Headline",
      "default": "About Us"
    },
    {
      "id": "tagline",
      "type": "text",
      "label": "Tagline"
    },
    {
      "id": "hero_image",
      "type": "image_picker",
      "label": "Hero Image"
    },
    {
      "id": "body",
      "type": "richtext",
      "label": "Body Content"
    },
    {
      "id": "show_team",
      "type": "checkbox",
      "label": "Show Team Section",
      "default": true
    }
  ]
}
```

The schema file name matches the page template file name (without extension).

### 2. Create Pages Using the Template

In the dashboard:

1. Go to **Sites > [Your Site] > Pages**
2. Click **New Page**
3. Select your page_template from the dropdown
4. Fill in the settings defined in the schema
5. Set the slug (URL path)

Each Page stores its own settings values, so you can create multiple pages from the same template with different content.

## Schema Format

The sidecar JSON file in `config/page_templates/` defines editable settings for the page template. Inline `{% schema %}` blocks are also supported as a fallback but sidecar files are recommended.

### Supported Setting Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single line text | Headlines, labels |
| `textarea` | Multi-line text | Descriptions |
| `richtext` | Rich text editor | Body content |
| `image_picker` | Image from media library | Hero images |
| `url` | URL input | Links |
| `checkbox` | Boolean toggle | Feature flags |
| `range` | Numeric slider | Spacing, counts |
| `select` | Dropdown with options | Style choices |
| `color` | Color picker | Accent colors |

### Example Schema

```json
{
  "name": "Service Page",
  "settings": [
    {
      "id": "service_name",
      "type": "text",
      "label": "Service Name",
      "default": "Our Service"
    },
    {
      "id": "description",
      "type": "richtext",
      "label": "Description"
    },
    {
      "id": "price",
      "type": "text",
      "label": "Starting Price"
    },
    {
      "id": "cta_text",
      "type": "text",
      "label": "Call to Action",
      "default": "Get Started"
    },
    {
      "id": "cta_url",
      "type": "url",
      "label": "CTA Link"
    }
  ]
}
```

## Accessing Settings in Templates

Settings are available via the `settings` object:

```liquid
<h1>{{ settings.service_name }}</h1>
<div class="price">Starting at {{ settings.price }}</div>
<div class="description">{{ settings.description }}</div>

{% if settings.cta_url %}
  <a href="{{ settings.cta_url }}" class="btn">{{ settings.cta_text }}</a>
{% endif %}
```

## URL Routing

Page templates integrate with the existing routing system. See [URL Routing](../architecture/url-routing.md) for the full resolution algorithm.

### Resolution Priority

1. Exact template match (`templates/foo.liquid`)
2. **Page by slug** → renders with linked page_template
3. **page_template without Page** → implicit route at `/template-name`
4. Mounted dataset routes
5. Parameterized routes (`{% routes %}` blocks)
6. Fallthrough dataset slug resolution
7. Static pages (rich text)
8. 404 fallback

### Examples

| Request | Resolution |
|---------|------------|
| `GET /about` | Page with slug "about" → `page_templates/about.liquid` |
| `GET /plumbing` | Page with slug "plumbing" (template: service) → `page_templates/service.liquid` |
| `GET /contact` | No Page, but `page_templates/contact.liquid` exists → implicit render |

## Sitemap Behavior

Page templates handle sitemaps differently from dataset templates:

| Source | Included in Sitemap? |
|--------|---------------------|
| `page_templates/` with linked Pages | Yes, via `page_urls()` |
| `page_templates/` without Pages | Yes, implicit URL |
| `templates/` with `{% routes %}` | No (URLs come from parameterized routes) |
| `templates/` without routes, `sitemap: false` | No |
| `templates/` without routes, `sitemap: true` | Yes (legacy behavior) |

### Excluding a Template from Sitemap

For dataset templates (`templates/`) that shouldn't appear in sitemaps, add `sitemap: false` to the sidecar schema:

**config/templates/article.json**
```json
{
  "name": "Article Template",
  "sitemap": false
}
```

This is useful for templates that are only used as `item_template` for datasets (the dataset records themselves are included in the sitemap).

## Theme Dev Server Support

The local theme dev server (`bin/theme-dev`) fully supports page templates:

```bash
bin/theme-dev dev /path/to/theme
```

- Routes pages from `data/content/pages.json` to their assigned page templates
- Routes implicit page_template files when no page record exists
- Loads schemas from sidecar JSON files in `config/page_templates/` (or inline `{% schema %}` as fallback)
- Merges schema defaults with page record settings (record overrides defaults)
- Hot reloads on file changes

### Page Routing from pages.json

When you define pages in `data/content/pages.json`, the dev server routes them to their assigned page templates — just like production:

```json
{
  "records": [
    {"title": "About Us", "slug": "about", "page_template": "page"},
    {"title": "Contact", "slug": "contact", "page_template": "page"},
    {"title": "FAQs", "slug": "faqs", "page_template": "page"}
  ]
}
```

All three pages share `page_templates/page.liquid`. Visiting `/about`, `/contact`, or `/faqs` renders the same template with each page's own data.

If a page has no `page_template` field, the dev server falls back to `templates/page.liquid` (then `templates/article.liquid`).

### Implicit File Routing (No pages.json)

If no matching page record exists in pages.json, the dev server still routes to page_template files directly:

- `/services` → `page_templates/services.liquid` (if the file exists)

In this case, mock page data is generated from the template name and schema defaults.

### Settings Merge

When routing a page record to a page_template with a schema (sidecar JSON or inline), settings are merged:

1. Schema defaults provide the base values
2. Page record `settings` override matching keys
3. Unset fields keep their schema defaults

### Mock Page Data

The `{{ page }}` object is available in page templates:

```liquid
{{ page.id }}           → "page_about" (from record) or "page_dev_about" (mock)
{{ page.title }}        → "About Us" (from record) or "About" (from template name)
{{ page.slug }}         → "about"
{{ page.url }}          → "/about"
{{ page.page_template }} → "page" (from record) or "about" (from template name)
{{ page.content }}      → "" (from record or default)
{{ page.schema_type }}  → "WebPage" (from record or default)
{{ page.settings }}     → { ... } (merged: schema defaults + record settings)
```

## Migration from templates/

If you have static pages in `templates/`:

### Before (in templates/)

```liquid
{# templates/about.liquid #}
<h1>About Us</h1>
<p>Welcome to our company...</p>
```

### After (in page_templates/ with sidecar schema)

**page_templates/about.liquid** (pure Liquid)
```liquid
<h1>{{ settings.headline }}</h1>
<div class="prose">{{ settings.body }}</div>
```

**config/page_templates/about.json** (schema definition)
```json
{
  "name": "About Page",
  "settings": [
    { "id": "headline", "type": "text", "label": "Headline", "default": "About Us" },
    { "id": "body", "type": "richtext", "label": "Body Content" }
  ]
}
```

**Benefits of migrating:**
- Content is editable without touching template code
- Create multiple pages from one template
- Settings are saved per-page, not globally
- Better sitemap handling

## Best Practices

### 1. Use Descriptive Setting IDs

```liquid
{% comment %} Good {% endcomment %}
{ "id": "hero_headline", ... }
{ "id": "cta_button_text", ... }

{% comment %} Bad {% endcomment %}
{ "id": "text1", ... }
{ "id": "heading", ... }  {% comment %} Too generic {% endcomment %}
```

### 2. Provide Sensible Defaults

```json
{
  "id": "cta_text",
  "type": "text",
  "label": "Call to Action",
  "default": "Learn More"
}
```

### 3. Use Hints for Clarity

```json
{
  "id": "hero_image",
  "type": "image_picker",
  "label": "Hero Image",
  "info": "Recommended size: 1920x600px"
}
```

### 4. Group Related Settings

Use `header` type settings to organize:

```json
{
  "settings": [
    { "type": "header", "content": "Hero Section" },
    { "id": "hero_headline", ... },
    { "id": "hero_image", ... },
    { "type": "header", "content": "Call to Action" },
    { "id": "cta_text", ... },
    { "id": "cta_url", ... }
  ]
}
```

## Comparison: page_templates vs templates

| Aspect | page_templates/ | templates/ |
|--------|-----------------|------------|
| Purpose | Static pages | Dataset rendering |
| Settings | Per-page (stored in Page.settings) | Global (site settings) |
| URL binding | Via Page records | Via dataset mounts or routes |
| Sitemap | Pages included automatically | Excluded unless `sitemap: true` |
| Multiple instances | One template → many Pages | One template → one URL |
| Dashboard editing | Page settings form | Theme settings only |
