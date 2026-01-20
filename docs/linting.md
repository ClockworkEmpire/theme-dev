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
| **Variable reference** | `\| default: site.name` | `"default": "[site.name]"` |

### Variable References

When a default references another variable (like `site.name` or `item.title`), the linter preserves it as a bracketed placeholder:

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

---

## See Also

- [Schema Reference](./schemas.md) - Full schema file format
- [Settings Types](./settings-types.md) - All available setting types
- [Theme Structure](./theme-structure.md) - Directory layout
