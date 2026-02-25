# SEO Metadata System

The SEO metadata system provides automatic, overridable SEO for every page on your site. Theme developers can use `{{ seo.meta_tags }}` for zero-effort SEO or use granular `seo.*` variables for full control.

## The `seo.*` Object

Every page has access to a `seo` object that computes SEO values through a 6-level cascade:

| Variable | Description | Fallback |
|----------|-------------|----------|
| `seo.title` | Page title | `site.name` |
| `seo.description` | Meta description | `settings.tagline` |
| `seo.canonical_url` | Canonical URL (no query strings) | `site.url` + `request.path` |
| `seo.og_image` | Open Graph image URL | `nil` (omit tag) |
| `seo.og_type` | OG type (`website` or `article`) | `website` |
| `seo.robots` | Robots directive | `nil` (= index) |
| `seo.meta_tags` | All meta/OG/Twitter tags in one block | — |
| `seo.allow_indexing` | Whether indexing is allowed | `false` (staging) |
| `seo.environment` | Current environment string | — |

## Override Cascade (Highest to Lowest Priority)

```
1.   Record field       → record.seo_title, record.seo_description, etc.
2.   Template setting   → template.settings.seo_title (via customizer)
3.   Title template     → Site SEO defaults title_template (Liquid)
3.5  Theme SEO config   → config/seo/ files (dataset → template → global)
4.   Site default       → Site SEO defaults (og_image, etc.)
5.   System fallback    → site.name, empty string, computed canonical
```

Levels 1-3 are site-owner controlled. Level 3.5 is theme-developer provided (see [Theme SEO Templates](#theme-seo-templates-configseo) below). Each level is editable through the existing customizer or configuration dashboard.

## Layout Patterns

### Zero-Effort (Recommended)

Use `{{ seo.meta_tags }}` in your layout's `<head>` to get all SEO tags automatically:

```liquid
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {{ seo.meta_tags }}
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body>
  {{ content_for_layout }}
</body>
</html>
```

`{{ seo.meta_tags }}` renders:
- `<title>` tag
- `<meta name="description">` (if description is set)
- `<link rel="canonical">` (pre-computed, no query strings)
- `<meta name="robots">` (if noindex applies)
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:site_name`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

### Full Control

Use individual `seo.*` variables when you need custom markup:

```liquid
<head>
  <title>{{ seo.title }}</title>
  <meta name="description" content="{{ seo.description }}">
  <link rel="canonical" href="{{ seo.canonical_url }}">
  {% if seo.robots %}
    <meta name="robots" content="{{ seo.robots }}">
  {% endif %}
  <meta property="og:title" content="{{ seo.title }}">
  <meta property="og:description" content="{{ seo.description }}">
  <meta property="og:url" content="{{ seo.canonical_url }}">
  <meta property="og:type" content="{{ seo.og_type }}">
  {% if seo.og_image %}
    <meta property="og:image" content="{{ seo.og_image }}">
  {% endif %}
  <meta property="og:site_name" content="{{ site.name }}">
</head>
```

### Legacy Pattern

The `assign_global page_title` pattern still works as a last-resort override:

```liquid
{% assign_global page_title = article.title | append: " | " | append: site.name %}
```

However, **the recommended approach is to configure title templates in the site's SEO settings** rather than hardcoding title formats in themes.

## Title & Description Templates

Site owners configure Liquid templates that generate default titles and descriptions. These are rendered with the current page's context.

**Title template example:**
```
{{ record.title }} | {{ settings.brand_name }}
```

**Description template example:**
```
{{ record.excerpt | truncate: 155 }}
```

Available variables in templates:
- `{{ record.title }}` — current record's title
- `{{ record.excerpt }}` — current record's excerpt/summary
- `{{ post.title }}`, `{{ page.title }}` — specific content types
- `{{ settings.brand_name }}` — site brand name
- `{{ settings.tagline }}` — site tagline
- `{{ site.name }}` — site name
- `{{ site.url }}` — site base URL

## Dataset Record SEO Fields

Dataset records can include SEO override fields using the `seo_` prefix convention:

| Field Key | Purpose |
|-----------|---------|
| `seo_title` | Override page title |
| `seo_description` | Override meta description |
| `seo_canonical` | Override canonical URL |
| `seo_image` | Override OG/social image |
| `seo_noindex` | Boolean: prevent indexing |

These fields are read automatically by the `seo.*` cascade. You can add them to your dataset schema:

```json
{
  "key": "seo_title",
  "label": "SEO Title",
  "type": "string",
  "group": "SEO"
}
```

The platform also injects SEO fields into the customizer drawer for every template, so users can always set per-page SEO overrides even if the theme doesn't define them.

## Canonical URL Behavior

Canonical URLs are pre-computed as `site.url + request.path`:
- **No query strings** — always stripped for canonical safety
- **Environment-aware** — `site.url` returns staging URL in staging, production URL in production
- **Overridable** — set `seo_canonical` on a record or template setting to override

## JSON-LD Structured Data

### Auto-Injection

The platform automatically injects JSON-LD structured data before `</head>`. This is controlled by site settings:

| Setting | Default | Effect |
|---------|---------|--------|
| `json_ld_enabled` | `true` | Master toggle for all JSON-LD |
| `json_ld_auto_articles` | `false` | Auto-generate BlogPosting for posts |
| `json_ld_auto_pages` | `false` | Auto-generate WebPage for pages |
| `json_ld_site_schema` | empty | Site-wide schema template (Liquid-enabled) |

### JSON-LD Layers (all with on/off toggles)

| Layer | Stored In | Rendered On |
|-------|-----------|-------------|
| Site-wide | Site SEO defaults | Every page |
| Auto Article/BlogPosting | Auto-generated from Post data | Post pages |
| Auto WebPage | Auto-generated from Page data | Page pages |
| Dataset-specific | SiteDataset `json_ld_template` | Record pages |
| Per-page override | Page/Post `seo_metadata.json_ld_override` | That page |

Per-page overrides replace auto-generated schemas for that page, but site-wide schema always renders.

### Theme Opt-Out

If your theme handles JSON-LD manually, opt out of auto-injection in `siteswarm.json`:

```json
{
  "seo": {
    "json_ld_auto_inject": false
  }
}
```

When auto-inject is disabled, the `{% json_ld %}` tag works normally. When auto-inject is enabled, `{% json_ld %}` becomes a no-op to prevent duplicate structured data.

### Site-Wide Schema Example

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{{ settings.brand_name }}",
  "telephone": "{{ settings.phone }}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{ settings.address_street }}",
    "addressLocality": "{{ settings.address_city }}",
    "addressRegion": "{{ settings.address_state }}"
  }
}
```

### Dataset-Specific Schema Example

For a services dataset:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{{ record.title }}",
  "description": "{{ record.description }}",
  "provider": {
    "@type": "LocalBusiness",
    "name": "{{ settings.brand_name }}"
  }
}
```

## Theme SEO Templates (`config/seo/`)

Themes can ship smart SEO defaults that apply automatically when the theme is installed. These defaults sit between system fallbacks and site-owner overrides in the cascade, so your theme works with good SEO out of the box without forcing site owners into any specific configuration.

### File Structure

```
theme/
└── config/
    └── seo/
        ├── defaults.json              # Global defaults for all pages
        ├── templates/                  # Per-template overrides
        │   ├── index.json
        │   ├── article.json
        │   └── service.json
        └── datasets/                  # Per-dataset overrides
            ├── articles.json
            └── services.json
```

All files are optional. Only create the ones you need.

### JSON Format

Each file is a JSON object with optional fields:

```json
{
  "title_template": "{{ record.title }} | {{ settings.brand_name }}",
  "description_template": "{{ record.excerpt | truncate: 155 }}",
  "og_type": "website",
  "og_image": null,
  "canonical_url": null,
  "noindex": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title_template` | string | Liquid template for `<title>`. Available vars: `record`, `post`, `page`, `settings`, `site` |
| `description_template` | string | Liquid template for meta description |
| `og_type` | string | Open Graph type (`website`, `article`, etc.) |
| `og_image` | string | Liquid template or static URL for OG image |
| `canonical_url` | string | Override canonical URL (rare; usually left as `null`) |
| `noindex` | boolean | Prevent indexing for pages matching this config |

### Liquid Variables in Templates

Template fields (`title_template`, `description_template`, `og_image`) are rendered as Liquid with the current page context. Available variables:

- `{{ record.title }}` -- current dataset record title
- `{{ record.excerpt }}` -- record excerpt or summary
- `{{ record.featured_image }}` -- record image URL
- `{{ post.title }}`, `{{ page.title }}` -- specific content types
- `{{ settings.brand_name }}` -- site brand name from theme settings
- `{{ settings.tagline }}` -- site tagline
- `{{ site.name }}` -- site name
- `{{ site.url }}` -- site base URL

### How Overrides Work

Within theme SEO config, the system resolves overrides in this order:

1. **Dataset-specific** (`config/seo/datasets/{alias}.json`) -- matched by the dataset alias on the current `SiteDataset`
2. **Template-specific** (`config/seo/templates/{name}.json`) -- matched by the template being rendered
3. **Global defaults** (`config/seo/defaults.json`) -- applies when no specific match is found

For each field, the first non-null value wins. A dataset-specific `og_type` overrides a global default `og_type`, but a missing dataset-specific `title_template` falls through to the template-specific or global value.

### Where Theme SEO Sits in the Cascade

Theme SEO config is level 3.5 in the full 6-level cascade:

```
1.   Record field       → record.seo_title (site owner / content editor)
2.   Template setting   → customizer per-page SEO (site owner)
3.   Title template     → site SEO defaults title_template (site owner)
3.5  Theme SEO config   → config/seo/ files (theme developer)  ← YOU ARE HERE
4.   Site default       → site-level SEO defaults (site owner)
5.   System fallback    → site.name, computed canonical
```

Site owners always win. Your theme SEO config provides sensible defaults that work without any configuration, but every value can be overridden by the site owner through the customizer or SEO settings.

### Example: Local Business Theme

**`config/seo/defaults.json`** -- Global defaults:

```json
{
  "title_template": "{{ record.title | default: page.title }} | {{ settings.brand_name }}",
  "description_template": "{{ record.excerpt | default: settings.tagline | truncate: 155 }}",
  "og_type": "website"
}
```

**`config/seo/datasets/articles.json`** -- Blog articles get `article` OG type:

```json
{
  "title_template": "{{ record.title }} - {{ settings.brand_name }} Blog",
  "description_template": "{{ record.excerpt | truncate: 155 }}",
  "og_type": "article",
  "og_image": "{{ record.featured_image }}"
}
```

**`config/seo/datasets/services.json`** -- Service pages:

```json
{
  "title_template": "{{ record.title }} | {{ settings.brand_name }} Services",
  "description_template": "{{ record.description | truncate: 155 }}",
  "og_type": "website"
}
```

**`config/seo/templates/index.json`** -- Homepage:

```json
{
  "title_template": "{{ settings.brand_name }} - {{ settings.tagline }}",
  "description_template": "{{ settings.tagline }}",
  "og_type": "website"
}
```

### Dev Server Support

The theme dev server (`bin/theme-dev` / `swarm dev`) reads `config/seo/` files from disk and applies them through `MockSeoProxy`, so you can preview your theme SEO defaults locally without deploying.

### Auto-Scaffolding

Run `swarm lint --fix` to auto-generate `config/seo/` from your manifest. The scaffolder reads your dataset fields and generates field-aware templates:

```bash
# Generate all SEO config files
swarm lint --fix .

# Regenerate a specific file after changing dataset fields
swarm lint --fix --rebuild seo:datasets/articles .
```

See [Linting: Scaffold SEO Config](tools/linting.md#6-scaffold-seo-config) and [Linting: Rebuilding Schema Files](tools/linting.md#rebuilding-schema-files) for details.

### Validation

The `SchemaScaffolder` validates your SEO template JSON during `swarm lint`. Invalid JSON or unknown fields will produce lint warnings.

## Lint Warnings

The theme linter (`bin/theme-dev lint`) checks for SEO best practices:

| Warning | Trigger | Fix |
|---------|---------|-----|
| `seo_missing_title` | Layout has no `seo.title`, `seo.meta_tags`, or `page_title` | Add `{{ seo.meta_tags }}` to `<head>` |
| `seo_missing_description` | Layout has no meta description reference | Add `{{ seo.meta_tags }}` to `<head>` |
| `seo_missing_canonical` | Layout has no canonical URL reference | Add `{{ seo.meta_tags }}` to `<head>` |

These are warnings only — themes work without them, but adding `{{ seo.meta_tags }}` resolves all three.

## Examples

### Local Business Site

**Layout:** Uses `{{ seo.meta_tags }}`

**Site SEO settings:**
- Title template: `{{ record.title }} | {{ settings.brand_name }}`
- Description template: `{{ record.excerpt | truncate: 155 }}`
- OG image: uploaded brand image
- JSON-LD site schema: LocalBusiness with address/phone

### Blog

**Layout:** Uses `{{ seo.meta_tags }}`

**Site SEO settings:**
- Title template: `{{ post.title }} - {{ settings.brand_name }}`
- Description template: `{{ post.excerpt }}`
- Auto Article schema: enabled

### E-Commerce Catalog

**Layout:** Uses `{{ seo.meta_tags }}`

**Site SEO settings:**
- Title template: `{{ record.title }} - Buy at {{ settings.brand_name }}`
- Description template: `{{ record.description | truncate: 155 }}`
- Dataset JSON-LD: Product schema per item
