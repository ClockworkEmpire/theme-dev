# Settings Schema

Define customizable options for your theme and sections.

---

## Overview

HostNet themes support two levels of settings:

1. **Theme Settings** - Global options defined in `config/settings_schema.json`
2. **Section Settings** - Component-specific options defined in `{% schema %}` blocks

Both use the same setting type definitions and are accessed via the `settings` object in templates.

---

## Theme Settings

### File Structure

Theme settings are defined in two files:

**config/settings_schema.json** - Defines available settings

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

**config/settings_data.json** - Default values

```json
{
  "site_tagline": "Your tagline here",
  "primary_color": "#3b82f6"
}
```

### Schema Format

The schema is an array of setting groups:

```json
[
  {
    "name": "Group Name",
    "settings": [
      { /* setting definition */ },
      { /* setting definition */ }
    ]
  }
]
```

Groups organize settings in the admin interface but don't affect how you access them in templates.

### Accessing Theme Settings

All theme settings are available via `settings`:

```liquid
{{ settings.site_tagline }}
{{ settings.primary_color }}

{% if settings.show_newsletter %}
  {% section 'newsletter' %}
{% endif %}
```

---

## Section Settings

### External Schema Files (Recommended)

Section schemas are defined in separate JSON files in the `config/sections/` directory. This keeps Liquid templates clean and allows proper JSON validation.

**config/sections/hero.json**
```json
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Welcome"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#3b82f6"
    }
  ]
}
```

**sections/hero.liquid** (pure Liquid, no schema block)
```liquid
<section style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>
</section>
```

The schema file name matches the section file name (without extension).

### Schema Lookup Order

For a section at `sections/hero.liquid`:
1. Check `config/sections/hero.json` (new pattern - preferred)
2. Fall back to inline `{% schema %}` block (deprecated)

### Inline Schema (Deprecated)

The older pattern of embedding schemas directly in Liquid files is still supported for backwards compatibility:

```liquid
<!-- sections/hero.liquid (deprecated pattern) -->
<section style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>
</section>

{% schema %}
{
  "name": "Hero Banner",
  "settings": [...]
}
{% endschema %}
```

**Why external schemas are better:**
- Clean separation of concerns (Liquid vs JSON)
- Proper syntax highlighting in editors
- Independent JSON validation
- Easier to manage and compare

### Accessing Section Settings

Section settings are available via `section.settings`:

```liquid
{{ section.settings.title }}
{{ section.settings.bg_color }}

{% if section.settings.show_button %}
  <a href="{{ section.settings.button_url }}">
    {{ section.settings.button_text }}
  </a>
{% endif %}
```

**Note:** Section settings are only available inside the section file, not in the parent template or layout.

---

## Setting Types

### text

Single-line text input.

```json
{
  "type": "text",
  "id": "heading",
  "label": "Heading",
  "default": "Welcome",
  "info": "Main heading text",
  "placeholder": "Enter heading..."
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `type` | Yes | `"text"` |
| `id` | Yes | Unique identifier |
| `label` | Yes | Display label |
| `default` | No | Default value |
| `info` | No | Help text |
| `placeholder` | No | Input placeholder |

### textarea

Multi-line text input.

```json
{
  "type": "textarea",
  "id": "description",
  "label": "Description",
  "default": "Enter description here",
  "info": "Supports multiple lines"
}
```

### richtext

Rich text editor with formatting options.

```json
{
  "type": "richtext",
  "id": "content",
  "label": "Content",
  "default": "<p>Enter content here</p>"
}
```

Output includes HTML tags:

```liquid
{{ section.settings.content }}
<!-- Outputs: <p>Enter content here</p> -->
```

### image_picker

Select an image from the media library.

```json
{
  "type": "image_picker",
  "id": "hero_image",
  "label": "Hero Image"
}
```

Use with `img_url` filter:

```liquid
{% if section.settings.hero_image %}
  <img src="{{ section.settings.hero_image | img_url: 'large' }}" alt="">
{% endif %}
```

### url

URL input field.

```json
{
  "type": "url",
  "id": "button_link",
  "label": "Button Link",
  "default": "#"
}
```

```liquid
<a href="{{ section.settings.button_link }}">Click here</a>
```

### checkbox

Boolean toggle (true/false).

```json
{
  "type": "checkbox",
  "id": "show_newsletter",
  "label": "Show Newsletter Signup",
  "default": true
}
```

```liquid
{% if settings.show_newsletter %}
  {% section 'newsletter' %}
{% endif %}
```

### range

Numeric slider with min/max bounds.

```json
{
  "type": "range",
  "id": "items_per_row",
  "label": "Items Per Row",
  "min": 1,
  "max": 6,
  "step": 1,
  "default": 3,
  "unit": "items"
}
```

| Property | Required | Description |
|----------|----------|-------------|
| `min` | Yes | Minimum value |
| `max` | Yes | Maximum value |
| `step` | No | Increment (default: 1) |
| `default` | No | Default value |
| `unit` | No | Display unit label |

```liquid
<div class="grid grid-cols-{{ section.settings.items_per_row }}">
  ...
</div>
```

### select

Dropdown with predefined options.

```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout",
  "default": "grid",
  "options": [
    { "value": "grid", "label": "Grid" },
    { "value": "list", "label": "List" },
    { "value": "carousel", "label": "Carousel" }
  ]
}
```

```liquid
{% case section.settings.layout %}
  {% when 'grid' %}
    <div class="grid">...</div>
  {% when 'list' %}
    <ul class="list">...</ul>
  {% when 'carousel' %}
    <div class="carousel">...</div>
{% endcase %}
```

### color

Color picker.

```json
{
  "type": "color",
  "id": "background_color",
  "label": "Background Color",
  "default": "#ffffff"
}
```

```liquid
<section style="background-color: {{ section.settings.background_color }}">
  ...
</section>
```

### dataset

Select a dataset from the site's datasets.

```json
{
  "type": "dataset",
  "id": "featured_dataset",
  "label": "Featured Content"
}
```

---

## Setting Properties Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Setting type |
| `id` | String | Yes | Unique identifier (snake_case recommended) |
| `label` | String | Yes | Display label |
| `default` | Various | No | Default value |
| `info` | String | No | Help text shown below field |
| `placeholder` | String | No | Input placeholder (text/textarea) |

---

## Common Patterns

### Conditional Display

```json
{
  "type": "checkbox",
  "id": "show_section",
  "label": "Show This Section",
  "default": true
}
```

```liquid
{% if section.settings.show_section %}
  <section>...</section>
{% endif %}
```

### Image with Fallback

```json
{
  "type": "image_picker",
  "id": "background",
  "label": "Background Image"
},
{
  "type": "color",
  "id": "background_color",
  "label": "Background Color",
  "default": "#f3f4f6",
  "info": "Used when no image is selected"
}
```

```liquid
<section style="
  {% if section.settings.background %}
    background-image: url('{{ section.settings.background | img_url: 'xlarge' }}');
    background-size: cover;
  {% else %}
    background-color: {{ section.settings.background_color }};
  {% endif %}
">
```

### Button with Conditional Display

```json
{
  "type": "text",
  "id": "button_text",
  "label": "Button Text",
  "info": "Leave empty to hide button"
},
{
  "type": "url",
  "id": "button_url",
  "label": "Button URL",
  "default": "#"
}
```

```liquid
{% if section.settings.button_text != blank %}
  <a href="{{ section.settings.button_url }}" class="btn">
    {{ section.settings.button_text }}
  </a>
{% endif %}
```

### Navigation Links

```json
{
  "type": "textarea",
  "id": "nav_links",
  "label": "Navigation Links",
  "info": "Format: Label:URL | Label:URL",
  "default": "Home:/ | About:/about | Contact:/contact"
}
```

```liquid
{% assign links = section.settings.nav_links | split: '|' %}
{% for link in links %}
  {% assign parts = link | split: ':' %}
  {% assign label = parts[0] | strip %}
  {% assign url = parts[1] | strip %}
  <a href="{{ url }}">{{ label }}</a>
{% endfor %}
```

### Color Theming

```json
[
  {
    "name": "Colors",
    "settings": [
      {
        "type": "color",
        "id": "color_primary",
        "label": "Primary",
        "default": "#3b82f6"
      },
      {
        "type": "color",
        "id": "color_secondary",
        "label": "Secondary",
        "default": "#10b981"
      },
      {
        "type": "color",
        "id": "color_text",
        "label": "Text",
        "default": "#1f2937"
      },
      {
        "type": "color",
        "id": "color_background",
        "label": "Background",
        "default": "#ffffff"
      }
    ]
  }
]
```

```liquid
<!-- In layout -->
<style>
  :root {
    --color-primary: {{ settings.color_primary }};
    --color-secondary: {{ settings.color_secondary }};
    --color-text: {{ settings.color_text }};
    --color-background: {{ settings.color_background }};
  }
</style>
```

### Social Media Links

```json
{
  "name": "Social Media",
  "settings": [
    {
      "type": "url",
      "id": "social_twitter",
      "label": "Twitter URL"
    },
    {
      "type": "url",
      "id": "social_facebook",
      "label": "Facebook URL"
    },
    {
      "type": "url",
      "id": "social_instagram",
      "label": "Instagram URL"
    },
    {
      "type": "url",
      "id": "social_linkedin",
      "label": "LinkedIn URL"
    }
  ]
}
```

```liquid
<div class="social-links">
  {% if settings.social_twitter %}
    <a href="{{ settings.social_twitter }}">Twitter</a>
  {% endif %}
  {% if settings.social_facebook %}
    <a href="{{ settings.social_facebook }}">Facebook</a>
  {% endif %}
  ...
</div>
```

### Layout Options

```json
{
  "type": "select",
  "id": "text_alignment",
  "label": "Text Alignment",
  "default": "center",
  "options": [
    { "value": "left", "label": "Left" },
    { "value": "center", "label": "Center" },
    { "value": "right", "label": "Right" }
  ]
},
{
  "type": "select",
  "id": "container_width",
  "label": "Container Width",
  "default": "medium",
  "options": [
    { "value": "small", "label": "Small (768px)" },
    { "value": "medium", "label": "Medium (1024px)" },
    { "value": "large", "label": "Large (1280px)" },
    { "value": "full", "label": "Full Width" }
  ]
}
```

```liquid
{% assign width_class = 'max-w-4xl' %}
{% case section.settings.container_width %}
  {% when 'small' %}{% assign width_class = 'max-w-3xl' %}
  {% when 'medium' %}{% assign width_class = 'max-w-4xl' %}
  {% when 'large' %}{% assign width_class = 'max-w-6xl' %}
  {% when 'full' %}{% assign width_class = 'max-w-full' %}
{% endcase %}

<div class="{{ width_class }} mx-auto text-{{ section.settings.text_alignment }}">
  ...
</div>
```

---

## Settings Inheritance

Settings are merged in this order:

1. **Theme defaults** (`config/settings_data.json`)
2. **Site overrides** (customizations saved by site owner)

Site owners can customize settings per-site. Their values override theme defaults.

---

## Best Practices

### Use Clear Labels

```json
// Good
{ "label": "Hero Background Image" }
{ "label": "Number of Products to Display" }

// Avoid
{ "label": "bg_img" }
{ "label": "Count" }
```

### Provide Helpful Info

```json
{
  "type": "textarea",
  "id": "nav_links",
  "label": "Navigation Links",
  "info": "Format: Label:URL | Label:URL (e.g., Home:/ | About:/about)"
}
```

### Set Sensible Defaults

```json
{
  "type": "range",
  "id": "items_per_page",
  "label": "Items Per Page",
  "min": 4,
  "max": 24,
  "step": 4,
  "default": 12  // A reasonable starting point
}
```

### Group Related Settings

```json
[
  {
    "name": "Hero Section",
    "settings": [
      { "id": "hero_title", ... },
      { "id": "hero_subtitle", ... },
      { "id": "hero_image", ... }
    ]
  },
  {
    "name": "Footer",
    "settings": [
      { "id": "footer_text", ... },
      { "id": "footer_links", ... }
    ]
  }
]
```

### Use IDs Consistently

```json
// Good: consistent naming pattern
{ "id": "hero_title" }
{ "id": "hero_subtitle" }
{ "id": "hero_button_text" }
{ "id": "hero_button_url" }

// Avoid: inconsistent naming
{ "id": "heroTitle" }
{ "id": "subtitle" }
{ "id": "btn_text" }
{ "id": "button-url" }
```
