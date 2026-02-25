# SEO Cheat Sheet (Theme Developers)

## Variables

```
{{ seo.title }}          → page title (cascaded)
{{ seo.description }}    → meta description (cascaded)
{{ seo.canonical_url }}  → canonical URL (pre-computed, no query strings)
{{ seo.og_image }}       → OG image URL
{{ seo.og_type }}        → "website" or "article"
{{ seo.robots }}         → robots directive or nil
{{ seo.meta_tags }}      → ALL meta/OG/Twitter tags in one block
{{ seo.allow_indexing }} → true/false (always false in staging)
{{ seo.environment }}    → "staging" or "production"
```

## Zero-Effort Layout

```liquid
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {{ seo.meta_tags }}
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
```

## Full Control Layout

```liquid
<title>{{ seo.title }}</title>
<meta name="description" content="{{ seo.description }}">
<link rel="canonical" href="{{ seo.canonical_url }}">
{% if seo.robots %}<meta name="robots" content="{{ seo.robots }}">{% endif %}
<meta property="og:title" content="{{ seo.title }}">
<meta property="og:type" content="{{ seo.og_type }}">
{% if seo.og_image %}<meta property="og:image" content="{{ seo.og_image }}">{% endif %}
<meta property="og:site_name" content="{{ site.name }}">
```

## Override Cascade (highest → lowest)

```
1.   Record field       → record.seo_title
2.   Template setting   → template.settings.seo_title
3.   Title template     → site SEO defaults title_template
3.5  Theme SEO config   → config/seo/ files (dataset → template → global)
4.   Site default       → site SEO defaults
5.   System fallback    → site.name
```

## Dataset Record SEO Fields (convention)

```
seo_title, seo_description, seo_canonical, seo_image, seo_noindex
```

## JSON-LD

Auto-injected by default. Opt out in `siteswarm.json`:

```json
{ "seo": { "json_ld_auto_inject": false } }
```

When auto-inject is on, `{% json_ld %}` becomes a no-op.

## Lint Warnings

- Missing `seo.title` / `seo.meta_tags` / `page_title` in layout
- Missing meta description reference
- Missing canonical URL reference

Fix: add `{{ seo.meta_tags }}` to `<head>`.

## Full Reference

See [seo-metadata.md](seo-metadata.md) for complete documentation.
