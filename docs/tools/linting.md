# Theme Linting

The theme linter validates your theme structure, scans Liquid templates for issues, and can automatically fix common problems by scaffolding missing schema files.

---

## Quick Start

```bash
# Check for issues (dry run)
swarm lint /path/to/theme

# Check and auto-fix issues
swarm lint --fix /path/to/theme

# Lint current directory
swarm lint .
swarm lint --fix .
```

---

## What Gets Linted

The linter scans your entire theme and validates:

| Component | Validation |
|-----------|------------|
| **Datasets** | Schema exists in `config/datasets/`, required fields defined |
| **Sections** | Schema exists in `config/sections/`, settings declared |
| **Snippets** | Schema exists in `config/snippets/`, settings declared |
| **Templates** | Schema exists in `config/templates/`, settings declared |
| **Global Settings** | All `settings.*` references have schema entries |
| **Assets** | Referenced assets exist in `assets/` folder |
| **Sample Content** | Valid structure in `data/content/`, required fields, valid references |

---

## Auto-Fix Capabilities

When you run `swarm lint --fix`, the linter will:

### 1. Scaffold Missing Schemas

If a section/snippet/template uses settings but has no schema file, the linter creates one:

```liquid
<!-- sections/hero.liquid -->
{{ section.settings.title }}
{{ section.settings.subtitle }}
```

Creates `config/sections/hero.json`:
```json
{
  "name": "Hero",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": ""
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle",
      "default": ""
    }
  ],
  "blocks": [],
  "presets": [
    {
      "name": "Hero",
      "category": "Custom"
    }
  ]
}
```

### 2. Add Missing Settings

If you add a new setting reference to your Liquid, the linter adds it to the existing schema.

### 3. Extract Default Values from Markup

The linter extracts `| default:` filter values from your Liquid and uses them as schema defaults.

**Liquid markup:**
```liquid
{{ section.settings.headline | default: 'Welcome to Our Site' }}
{{ section.settings.show_cta | default: true }}
{{ section.settings.items_count | default: 6 }}
{{ section.settings.accent_color | default: '#FF5733' }}
```

**Generated schema:**
```json
{
  "settings": [
    {
      "type": "text",
      "id": "headline",
      "label": "Headline",
      "default": "Welcome to Our Site"
    },
    {
      "type": "checkbox",
      "id": "show_cta",
      "label": "Show Cta",
      "default": true
    },
    {
      "type": "range",
      "id": "items_count",
      "label": "Items Count",
      "default": 6,
      "min": 1,
      "max": 12,
      "step": 1
    },
    {
      "type": "color",
      "id": "accent_color",
      "label": "Accent Color",
      "default": "#FF5733"
    }
  ]
}
```

### 4. Update Changed Defaults

If you change a default value in your Liquid markup, the linter updates the schema to match. **Liquid is the source of truth for defaults.**

```liquid
<!-- Before: default was 'Hello' in schema -->
{{ section.settings.title | default: 'Welcome' }}
<!-- After lint --fix: schema default is now 'Welcome' -->
```

### 5. Fix Invalid Field Types

Dataset field types must use valid Rails types. The linter detects invalid types and can auto-correct them:

**Common mistakes and corrections:**

| Invalid Type | Corrected To |
|--------------|--------------|
| `number` | `decimal` |
| `float`, `double` | `decimal` |
| `int`, `bigint` | `integer` |
| `bool` | `boolean` |
| `image`, `file` | `attachment` |
| `images`, `files` | `attachments` |
| `object`, `hash`, `dict` | `json` |
| `timestamp` | `datetime` |
| `list` | `array` |

**Example:**

Your `siteswarm.json`:
```json
{
  "datasets": {
    "products": {
      "fields": [
        {"key": "price", "type": "number"},
        {"key": "config", "type": "object"}
      ]
    }
  }
}
```

Running `swarm lint`:
```
Issues found:
  - Field 'price' has invalid type 'number'. Suggested fix: 'decimal'
  - Field 'config' has invalid type 'object'. Suggested fix: 'json'
```

Running `swarm lint --fix`:
```
Fixes applied:
  - Fixed field 'price' in 'products': 'number' → 'decimal'
  - Fixed field 'config' in 'products': 'object' → 'json'
```

See [Cheat Sheet: Dataset Field Types](../cheat-sheet.md#dataset-field-types) for the complete list of valid types.

---

## Supported Default Value Types

| Type | Liquid Example | Schema Result |
|------|----------------|---------------|
| **String** | `\| default: 'Hello World'` | `"default": "Hello World"` |
| **String (double quotes)** | `\| default: "Hello"` | `"default": "Hello"` |
| **Boolean true** | `\| default: true` | `"default": true`, type: `checkbox` |
| **Boolean false** | `\| default: false` | `"default": false`, type: `checkbox` |
| **Integer** | `\| default: 5` | `"default": 5`, type: `range` |
| **Float** | `\| default: 1.5` | `"default": 1.5` |
| **Settings reference** | `\| default: settings.site_name` | `"default": "", "default_from": "settings.site_name"` |
| **Other variable** | `\| default: site.name` | `"default": "[site.name]"` |

### Variable References

When a default references another variable, the linter handles it based on the reference type:

**Global Settings References (`settings.*`)** use the `default_from` schema syntax:

```liquid
{{ section.settings.title | default: settings.site_name }}
```

Schema result:
```json
{
  "type": "text",
  "id": "title",
  "label": "Title",
  "default": "",
  "default_from": "settings.site_name"
}
```

The `default_from` syntax enables inheritance tracking in editor mode. When rendered, the editor shows which settings are inherited vs custom, allowing users to see the source of default values.

**Other Variable References** (like `site.name` or `item.title`) use a bracketed placeholder:

```liquid
{{ section.settings.page_title | default: site.name }}
```

Schema result:
```json
{
  "type": "text",
  "id": "page_title",
  "label": "Page Title",
  "default": "[site.name]"
}
```

This placeholder reminds theme editors that the value is dynamically derived.

### Chained Filters

Defaults are extracted even when followed by other filters:

```liquid
{{ section.settings.label | default: 'Learn More' | upcase }}
```

Extracts `'Learn More'` as the default (ignoring `| upcase`).

---

## Type Inference

The linter infers setting types from:

1. **Extracted default value type:**
   - Boolean → `checkbox`
   - Integer → `range`
   - String → `text` (or inferred from name)

2. **Setting name patterns:**
   - `*_color`, `*_bg` → `color`
   - `*_image`, `*_logo` → `image_picker`
   - `*_url`, `*_link` → `url`
   - `show_*`, `hide_*`, `enable_*`, `is_*` → `checkbox`
   - `*_text`, `*_body`, `*_content` → `textarea`
   - `*_html` → `richtext`

---

## Lint Output

### Dry Run (no --fix)

```
Linting theme at /path/to/theme...

Issues found:
  - Missing schema: config/sections/hero.json
  - Missing schema: config/sections/features.json
  - Missing setting 'subtitle' in config/sections/header.json
  - Dataset 'articles' missing field 'author'

Run with --fix to auto-repair these issues.
```

### With --fix

```
Linting theme at /path/to/theme...

Fixes applied:
  - Created config/sections/hero.json with 3 settings
  - Created config/sections/features.json with 5 settings
  - Added setting 'subtitle' to config/sections/header.json
  - Updated 3 default(s) in config/sections/hero.json
  - Updated 2 default(s) in config/sections/about.json

Theme schema is now complete.
```

---

## Best Practices

### 1. Always Define Defaults in Markup

Put defaults in your Liquid templates, not just in schema files:

```liquid
<!-- Good: default in markup (source of truth) -->
{{ section.settings.title | default: 'Welcome' }}

<!-- Less ideal: default only in schema -->
{{ section.settings.title }}
```

### 2. Run Lint After Converting Themes

When converting HTML templates to Liquid, run `swarm lint --fix` to:
- Generate all schema files automatically
- Extract defaults from your markup
- Ensure consistency between markup and schema

### 3. Use Descriptive Setting Names

The linter generates labels from setting IDs:
- `headline_text` → "Headline Text"
- `show_cta_button` → "Show Cta Button"
- `bg_color` → "Bg Color" (and infers `color` type)

### 4. Commit Schema Files

Schema files should be committed to version control. They define the editing interface for your theme.

---

## Troubleshooting

### "Schema is complete" but defaults are wrong

The linter only updates defaults when they **differ** from the schema. If your Liquid has:
```liquid
{{ section.settings.title | default: 'Hello' }}
```

And your schema already has `"default": "Hello"`, no update is needed.

### Settings not being detected

Ensure your Liquid uses the correct prefix:
- `section.settings.*` for sections
- `snippet.settings.*` for snippets
- `template.settings.*` for templates
- `settings.*` for global settings

### Type inference seems wrong

The linter infers types from setting names. Override by editing the schema directly:

```json
{
  "type": "select",
  "id": "alignment",
  "label": "Alignment",
  "default": "center",
  "options": [
    {"value": "left", "label": "Left"},
    {"value": "center", "label": "Center"},
    {"value": "right", "label": "Right"}
  ]
}
```

The linter won't overwrite manually configured types.

### 6. Scaffold SEO Config

When your theme uses `seo.*` variables or has datasets, `--fix` will scaffold `config/seo/` with field-aware templates generated from your manifest datasets:

```
Fixes applied:
  - Scaffolded config/seo/defaults.json
  - Scaffolded config/seo/datasets/articles.json
  - Scaffolded config/seo/datasets/services.json
  - Scaffolded config/seo/templates/article.json
  - Scaffolded config/seo/templates/index.json
```

The scaffolder reads your dataset field definitions and picks the best fields for title, description, and OG image templates. For example, if your `articles` dataset has `title`, `excerpt`, and `featured_image` fields, the generated config will use those:

```json
{
  "title_template": "{{ record.title }} | {{ settings.brand_name | default: site.name }}",
  "description_template": "{{ record.excerpt | truncate: 155 }}",
  "og_type": "article",
  "og_image": "{{ record.featured_image }}"
}
```

See [SEO Metadata: Theme SEO Templates](../seo-metadata.md#theme-seo-templates-configseo) for the full `config/seo/` reference.

---

## Rebuilding Schema Files

Use `--rebuild` to force-regenerate a specific schema file, even if it already exists:

```bash
# Rebuild all SEO config files
swarm lint --fix --rebuild seo

# Rebuild only defaults.json
swarm lint --fix --rebuild seo:defaults

# Rebuild a specific dataset's SEO config
swarm lint --fix --rebuild seo:datasets/articles

# Rebuild a specific template's SEO config
swarm lint --fix --rebuild seo:templates/article
```

### Granular Targets

| Target | What Gets Rebuilt |
|--------|-------------------|
| `seo` | All `config/seo/` files |
| `seo:defaults` | Only `config/seo/defaults.json` |
| `seo:datasets` | All files in `config/seo/datasets/` |
| `seo:datasets/NAME` | Only `config/seo/datasets/NAME.json` |
| `seo:templates` | All files in `config/seo/templates/` |
| `seo:templates/NAME` | Only `config/seo/templates/NAME.json` |

**Note:** `--rebuild` requires `--fix`. Without `--fix`, no files are written.

This is useful when you've added new fields to a dataset and want the SEO config regenerated with the updated field references, without touching other SEO files you've customized.

---

## Sample Content Validation

The linter validates sample content files in `data/content/`:

### Required Fields

| Content Type | Required Fields |
|--------------|-----------------|
| Authors | `name` |
| Tags | `name` |
| Posts | `title`, `slug` |
| Pages | `title`, `slug` |
| Drop-ins | `name`, `content` |

### Reference Validation

The linter warns about invalid cross-references:

**Posts referencing unknown authors:**
```
Warning: Post 'my-post' references unknown author 'unknown-author'
```

**Invalid schema types:**
```
Warning: Post 'my-post' has invalid schema_type 'CustomPost'. Valid: Article, BlogPosting, NewsArticle, TechArticle
Warning: Page 'about' has invalid schema_type 'CustomPage'. Valid: WebPage, AboutPage, ContactPage, FAQPage
```

**Invalid drop-in name format:**
```
Issue: Drop-in 'Footer Disclaimer' has invalid name format. Use lowercase alphanumeric with hyphens.
```

### Example Output

```
Linting theme at /path/to/theme...

Sample content stats:
  - Authors: 2
  - Tags: 5
  - Posts: 8
  - Pages: 3
  - Drop-ins: 2

Issues found:
  - Page at index 0 is missing required field 'slug'

Warnings:
  - Post 'advanced-tips' references unknown author 'guest-author'
```

See [Sample Content](./sample-content.md) for file format documentation (in the same tools/ directory).

---

## See Also

- [Components](../components.md) - Schema reference and setting types
- [README](../README.md) - Theme structure and key concepts
- [Sample Content](./sample-content.md) - First-class content for themes
