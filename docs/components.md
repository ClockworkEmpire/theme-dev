# Components

Sections, snippets, blocks, drop-ins, and settings -- the building blocks of Site Swarm themes.

For theme directory structure, see [README](README.md). For Liquid syntax and filters, see [Liquid Reference](liquid-reference.md).

---

## Sections

Sections are reusable page components with configurable settings. Use sections for components that site owners should customize (headers, footers, hero banners, feature grids).

### Creating a Section

Sections use **sidecar schemas** -- a separate JSON file in `config/sections/` paired with a Liquid template in `sections/`.

**sections/hero.liquid** (pure Liquid template)
```liquid
<section class="hero bg-blue-600 text-white py-20">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-5xl font-bold">{{ section.settings.title }}</h1>
    <p class="text-xl mt-4">{{ section.settings.subtitle }}</p>
  </div>
</section>
```

**config/sections/hero.json** (schema definition)
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
      "type": "textarea",
      "id": "subtitle",
      "label": "Subtitle"
    }
  ]
}
```

The schema file name must match the section file name (without extension).

### Including Sections

Use the `{% section %}` tag in templates or layouts:

```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'footer' %}
```

The tag:
1. Loads `sections/header.liquid`
2. Loads schema from `config/sections/header.json`
3. Merges default settings with site customizations
4. Makes `section.settings` available
5. Renders the HTML

### Section Object

Inside a section, you have access to:

| Property | Description |
|----------|-------------|
| `section.id` | Unique identifier for the section instance |
| `section.settings` | Settings values (defaults + customizations) |
| `section.blocks` | Array of block objects (see [Section Blocks](#section-blocks)) |

```liquid
<section id="{{ section.id }}">
  <h2>{{ section.settings.heading }}</h2>
  {% if section.settings.show_description %}
    <p>{{ section.settings.description }}</p>
  {% endif %}
</section>
```

### Sidecar Schema Pattern

Section schemas are defined in separate JSON files in `config/sections/`. This is the primary pattern for all new themes.

```json
{
  "name": "Section Display Name",
  "settings": [
    {
      "type": "text",
      "id": "setting_id",
      "label": "Setting Label",
      "default": "Default value",
      "info": "Help text shown to user"
    }
  ]
}
```

**Why sidecar schemas?**
- Clean separation of concerns (Liquid vs JSON)
- Proper JSON syntax highlighting in editors
- Independent validation
- Easier to manage and compare

> **Deprecated:** Inline `{% schema %}` blocks are still supported for backwards compatibility but should not be used in new themes.

---

## Snippets

Snippets are reusable partial components. They receive data via variables passed from the parent template and can optionally have their own settings via sidecar schemas in `config/snippets/`.

### Creating a Snippet

```liquid
<!-- snippets/article-card.liquid -->

<article class="card">
  {% if article.image %}
    <img src="{{ article.image | img_url: 'medium' }}" alt="{{ article.title }}">
  {% endif %}

  <div class="card-body">
    <h3><a href="{{ article | item_url }}">{{ article.title }}</a></h3>
    <p>{{ article.excerpt | truncate_words: 20 }}</p>
  </div>
</article>
```

### Including Snippets

Use `{% render %}` to include snippets:

```liquid
{% render 'article-card', article: post %}
```

### What render Can Render

The `render` tag includes files from the `snippets/` directory. It is an enhanced version of Liquid's built-in `render` with these capabilities:

- **Full parent context** — Unlike standard Liquid's isolated `render`, Site Swarm's `render` passes the full parent context (all variables, `settings`, `site`, `datasets`, etc.) into the snippet. Passed variables override parent values but don't replace the rest.
- **Variable passing** — Explicitly pass variables for clarity (recommended even though parent context is available).
- **Collection iteration** — Render a snippet once per item in a collection.
- **Snippet settings** — Load configurable settings from sidecar schemas (`config/snippets/{name}.json`) or inline `{% schema %}` blocks. Access via `snippet.settings`.
- **Snippet object** — Inside a snippet, `snippet.name` and `snippet.settings` are available.

### Passing Variables

Pass any variables the snippet needs:

```liquid
<!-- Single variable -->
{% render 'article-card', article: post %}

<!-- Multiple variables -->
{% render 'product-card', product: item, show_price: true, featured: false %}

<!-- Complex data -->
{% render 'stats', count: collection.size, label: 'Articles' %}
```

### Variable Scope

Snippets receive the **full parent context**. All parent template variables, global objects (`site`, `settings`, `request`, `datasets`, `mount`, `pagination`), and any explicitly passed variables are available inside the snippet.

Passed variables **override** parent values with the same name, but the rest of the parent context remains accessible:

```liquid
{% assign highlight = true %}
{% render 'card' %}  <!-- 'highlight' IS available from parent context -->
{% render 'card', highlight: false %}  <!-- overrides parent's 'highlight' value -->
```

**Best practice:** Even though parent variables are available, explicitly passing variables documents what the snippet depends on and makes templates easier to understand.

### Collection Iteration

Render a snippet for each item in a collection:

```liquid
{% render 'article-card' for articles as article %}
```

This is equivalent to:

```liquid
{% for article in articles %}
  {% render 'article-card', article: article %}
{% endfor %}
```

The iteration syntax is cleaner and makes the intent explicit.

### Snippet Settings

Snippets can also have configurable settings using sidecar schemas in `config/snippets/`.

**config/snippets/article-card.json**
```json
{
  "name": "Article Card",
  "description": "Displays an article preview with image and excerpt",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_image",
      "label": "Show Image",
      "default": true
    },
    {
      "type": "range",
      "id": "excerpt_words",
      "label": "Excerpt Word Limit",
      "default": 20,
      "min": 10,
      "max": 50,
      "step": 5
    }
  ]
}
```

Snippet settings are available via `snippet.settings`:

```liquid
{% comment %} snippets/article-card.liquid {% endcomment %}
{% if snippet.settings.show_image and article.image %}
  <img src="{{ article.image | img_url: 'medium' }}" alt="{{ article.title }}">
{% endif %}

<p>{{ article.excerpt | truncate_words: snippet.settings.excerpt_words }}</p>
```

---

## Section Blocks

Sections can contain **blocks** -- repeatable data items that site owners can add, remove, and reorder. Blocks are defined in the section's sidecar schema file.

### When to Use Blocks vs Datasets

| Approach | Best For |
|----------|----------|
| **Blocks** | Small, section-scoped repeatable items (2-20 items) |
| **Datasets** | Large content collections with pagination (blogs, products) |

Use blocks when content belongs to a specific section, site owners need to customize which items appear, and you don't need pagination or URL routing.

### Defining Block Types

Add a `blocks` array to your section's sidecar schema file:

**sections/team.liquid**
```liquid
<section class="team py-16">
  <div class="container">
    <h2>{{ section.settings.title }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {% for block in section.blocks %}
        <div class="team-card text-center">
          {% if block.settings.photo %}
            <img src="{{ block.settings.photo | img_url: 'medium' }}"
                 alt="{{ block.settings.name }}"
                 class="w-32 h-32 rounded-full mx-auto">
          {% endif %}
          <h3 class="mt-4 font-bold">{{ block.settings.name }}</h3>
          <p class="text-gray-600">{{ block.settings.role }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
</section>
```

**config/sections/team.json**
```json
{
  "name": "Team",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Our Team"
    }
  ],
  "blocks": [
    {
      "type": "member",
      "name": "Team Member",
      "settings": [
        { "type": "image_picker", "id": "photo", "label": "Photo" },
        { "type": "text", "id": "name", "label": "Name", "default": "John Doe" },
        { "type": "text", "id": "role", "label": "Role", "default": "Developer" }
      ]
    }
  ]
}
```

### The Block Object

Inside `{% for block in section.blocks %}`, each block provides:

| Property | Description | Example |
|----------|-------------|---------|
| `block.id` | Unique block identifier | `"member-a1b2c3"` |
| `block.type` | Block type from schema | `"member"` |
| `block.settings` | Block settings values | `block.settings.name` |

### Multiple Block Types

A section can define multiple block types. Site owners choose which type when adding blocks:

**sections/testimonials.liquid**
```liquid
<section class="testimonials">
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'quote' %}
        <blockquote>
          <p>"{{ block.settings.text }}"</p>
          <cite>-- {{ block.settings.author }}</cite>
        </blockquote>

      {% when 'video' %}
        <div class="video-testimonial">
          <iframe src="{{ block.settings.video_url }}"></iframe>
          <p>{{ block.settings.caption }}</p>
        </div>
    {% endcase %}
  {% endfor %}
</section>
```

**config/sections/testimonials.json**
```json
{
  "name": "Testimonials",
  "blocks": [
    {
      "type": "quote",
      "name": "Text Quote",
      "settings": [
        { "type": "textarea", "id": "text", "label": "Quote" },
        { "type": "text", "id": "author", "label": "Author" }
      ]
    },
    {
      "type": "video",
      "name": "Video Testimonial",
      "settings": [
        { "type": "url", "id": "video_url", "label": "Video URL" },
        { "type": "text", "id": "caption", "label": "Caption" }
      ]
    }
  ]
}
```

### Empty State Handling

Always handle the case when no blocks exist:

```liquid
{% if section.blocks.size > 0 %}
  <div class="team-grid">
    {% for block in section.blocks %}
      <!-- render block -->
    {% endfor %}
  </div>
{% else %}
  <p class="text-muted text-center">No team members configured yet.</p>
{% endif %}
```

### Block Data in settings_data.json

For local development, add mock block data to `config/settings_data.json`:

```json
{
  "sections": {
    "team": {
      "settings": {
        "title": "Meet Our Team"
      },
      "blocks": [
        {
          "type": "member",
          "settings": {
            "name": "Alice Chen",
            "role": "CEO & Founder"
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

**Common mistakes:**
- Missing `"sections"` wrapper key
- Section name doesn't match the section file name
- Blocks at root level instead of nested under the section
- Field names in data don't match schema `id` values

### Common Block Patterns

#### FAQ Section

**sections/faq.liquid**
```liquid
{% for block in section.blocks %}
  <details class="faq-item">
    <summary>{{ block.settings.question }}</summary>
    <p>{{ block.settings.answer }}</p>
  </details>
{% endfor %}
```

**config/sections/faq.json**
```json
{
  "blocks": [{
    "type": "faq_item",
    "name": "FAQ Item",
    "settings": [
      { "type": "text", "id": "question", "label": "Question" },
      { "type": "textarea", "id": "answer", "label": "Answer" }
    ]
  }]
}
```

#### Pricing Tiers

```liquid
{% for block in section.blocks %}
  <div class="pricing-card {% if block.settings.featured %}featured{% endif %}">
    <h3>{{ block.settings.name }}</h3>
    <p class="price">${{ block.settings.price }}/mo</p>
    <ul>{{ block.settings.features | newline_to_br }}</ul>
  </div>
{% endfor %}
```

#### Feature List

```liquid
{% for block in section.blocks %}
  <div class="feature">
    {% if block.settings.icon %}
      <img src="{{ block.settings.icon | img_url: 'small' }}">
    {% endif %}
    <h4>{{ block.settings.title }}</h4>
    <p>{{ block.settings.description }}</p>
  </div>
{% endfor %}
```

---

## Drop-Ins

Drop-ins are content blocks that can be customized by site owners without editing theme files.

### What Are Drop-Ins?

Drop-ins support two sources:

1. **User content** (database) -- Plain HTML managed via the dashboard
2. **Theme defaults** (`dropins/` folder) -- Liquid templates provided by the theme

### Resolution Order

When you use `{% dropin 'promo-banner' %}`, the system checks in order:

1. **User content** -- Site-specific drop-in in database
2. **User content** -- Account-wide drop-in in database
3. **Theme default** -- `dropins/promo-banner.liquid` in theme
4. **Empty string** -- If none exist

This means themes can provide sensible defaults that site owners can override.

### When to Use Drop-Ins

| Component | Managed By | Contains Liquid | Use For |
|-----------|------------|-----------------|---------|
| **Sections** | Theme developer | Yes | Configurable page components (hero, header) |
| **Snippets** | Theme developer | Yes | Reusable UI patterns (cards, icons) |
| **Drop-Ins** | Theme + Site owner | Theme defaults: Yes | Overridable content (disclaimers, promos) |

Use drop-ins for content that site owners may want to customize without editing theme files, that may vary between sites in an account, and that benefits from a theme-provided default.

### Including Drop-Ins

Use the `{% dropin %}` tag:

```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'announcement-banner' %}
{% dropin 'contact-info' %}
```

### Theme Defaults

Provide default content by creating `.liquid` files in the `dropins/` folder.

Theme defaults support full Liquid processing:

```liquid
<!-- dropins/promo-banner.liquid -->
<div class="promo-banner" style="background: {{ settings.primary_color }}">
  <p>{{ settings.promo_text | default: 'Check out our latest offers!' }}</p>
  <a href="{{ settings.promo_link | default: '/about' }}">Learn More</a>
</div>
```

**Available in theme defaults:**
- `settings` -- Theme settings
- `site` -- Site information (`site.name`, `site.url`, etc.)
- All standard Liquid filters

### User Content Overrides

When a site owner creates a drop-in via the dashboard, it overrides the theme default. User content is plain HTML (no Liquid processing) since it's managed by non-technical users.

### Cascading Scope

User-provided drop-ins support two levels:

1. **Account-wide** -- Available to all sites in the account
2. **Site-specific** -- Overrides account-wide drop-in with same name

This lets site owners create shared content once at the account level, then override specific drop-ins for individual sites when needed.

### Common Drop-In Use Cases

| Drop-In Name | Purpose | Location |
|--------------|---------|----------|
| `announcement-banner` | Top-of-page announcements | Layout (before header) |
| `cookie-notice` | GDPR/privacy notice | Layout (before `</body>`) |
| `footer-disclaimer` | Legal disclaimers | Footer section |
| `social-links` | Social media icons | Footer section |
| `header-cta` | Navigation CTA button | Header section |
| `article-cta` | Call-to-action after content | Article template |
| `contact-info` | Contact details | Contact page |

### Example: Using Drop-Ins in Layout

```liquid
<!-- layout/theme.liquid -->
<!DOCTYPE html>
<html>
<head>
  <title>{{ page_title | default: site.name }}</title>
</head>
<body>
  {% dropin 'announcement-banner' %}

  {% section 'header' %}

  <main>{{ content_for_layout }}</main>

  {% section 'footer' %}

  {% dropin 'cookie-notice' %}
</body>
</html>
```

### Key Differences from Snippets

| Aspect | Snippets | Drop-Ins |
|--------|----------|----------|
| Storage | Theme files only | Theme defaults + database |
| Editing | Theme developer | Theme developer (defaults) + Site owner (overrides) |
| Liquid support | Yes | Theme defaults: Yes, User content: No |
| Variables | Passed explicitly | Theme defaults: settings, site |
| Scope | Theme-wide | Theme default + Account/site cascading |

---

## Settings Schema

Settings let site owners customize themes, sections, snippets, templates, and page templates without editing code.

### Theme Settings

Theme settings are global options available on every page of the site.

#### settings_schema.json

Defines available settings as an array of groups:

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

Groups organize settings in the admin interface but don't affect how you access them in templates.

#### settings_data.json

Stores default values for theme settings:

```json
{
  "site_tagline": "Your tagline here",
  "primary_color": "#3b82f6"
}
```

#### Accessing Theme Settings

All theme settings are available via `{{ settings.* }}`:

```liquid
{{ settings.site_tagline }}
{{ settings.primary_color }}

{% if settings.show_newsletter %}
  {% section 'newsletter' %}
{% endif %}
```

### Section Settings

Sidecar schema in `config/sections/*.json`. Accessed via `{{ section.settings.* }}`.

Section settings are only available inside the section file, not in the parent template or layout.

```liquid
{{ section.settings.title }}
{{ section.settings.bg_color }}

{% if section.settings.show_button %}
  <a href="{{ section.settings.button_url }}">
    {{ section.settings.button_text }}
  </a>
{% endif %}
```

See [Sections](#sections) above for full details.

### Snippet Settings

Sidecar schema in `config/snippets/*.json`. Accessed via `{{ snippet.settings.* }}`.

See [Snippet Settings](#snippet-settings) above for full details.

### Template Settings

Sidecar schema in `config/templates/*.json`. Accessed via `{{ template.settings.* }}`.

```json
{
  "name": "Collection",
  "description": "Displays a list of dataset records",
  "settings": [
    {
      "type": "range",
      "id": "items_per_page",
      "label": "Items Per Page",
      "default": 12,
      "min": 6,
      "max": 24,
      "step": 6
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Grid Layout",
      "default": "grid-3",
      "options": [
        { "value": "grid-2", "label": "2 Columns" },
        { "value": "grid-3", "label": "3 Columns" },
        { "value": "list", "label": "List View" }
      ]
    }
  ]
}
```

```liquid
{% comment %} templates/collection.liquid {% endcomment %}
<div class="{{ template.settings.layout }}">
  {% for item in collection limit: template.settings.items_per_page %}
    {% render 'card', item: item %}
  {% endfor %}
</div>
```

### Page Template Settings

Sidecar schema in `config/page_templates/*.json`. Per-page values are stored in the Page record and override schema defaults.

Accessed via `{{ settings.* }}` (merged into the top-level settings object).

See [Content and Routing](content-and-routing.md) for full details on creating page templates and linking them to Page records.

### Schema Lookup Summary

| File Type | Schema Location | Access Variable |
|-----------|-----------------|-----------------|
| Theme-level | `config/settings_schema.json` | `settings.*` |
| `sections/hero.liquid` | `config/sections/hero.json` | `section.settings.*` |
| `snippets/card.liquid` | `config/snippets/card.json` | `snippet.settings.*` |
| `templates/article.liquid` | `config/templates/article.json` | `template.settings.*` |
| `page_templates/about.liquid` | `config/page_templates/about.json` | `settings.*` |

All component types support inline `{% schema %}` blocks as a deprecated fallback. Use sidecar JSON files for all new themes.

### Settings Inheritance

Settings are merged in this order:

1. **Theme defaults** (`config/settings_data.json`)
2. **Site overrides** (customizations saved by site owner)

Site owners can customize settings per-site. Their values override theme defaults.

---

## Setting Types Reference

All component types (sections, snippets, templates, page templates, blocks) support the same setting types.

### Summary Table

| Type | Description | Output |
|------|-------------|--------|
| `text` | Single-line text input | String |
| `textarea` | Multi-line text input | String |
| `richtext` | Rich text editor with formatting | HTML string |
| `image_picker` | Image selector from media library | Image URL |
| `url` | URL input field | URL string |
| `checkbox` | Boolean toggle | `true` / `false` |
| `range` | Numeric slider with min/max | Number |
| `select` | Dropdown with predefined options | Option value string |
| `color` | Color picker | Hex color string |
| `dataset` | Select a dataset from the site | Dataset reference |

### Common Properties

Every setting supports these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Setting type (from table above) |
| `id` | String | Yes | Unique identifier (snake_case recommended) |
| `label` | String | Yes | Display label |
| `default` | Various | No | Default value |
| `info` | String | No | Help text shown below field |
| `placeholder` | String | No | Input placeholder (text/textarea only) |

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

Rich text editor with formatting options. Output includes HTML tags.

```json
{
  "type": "richtext",
  "id": "content",
  "label": "Content",
  "default": "<p>Enter content here</p>"
}
```

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
| `unit` | No | Display unit label |

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

Color picker returning a hex string.

```json
{
  "type": "color",
  "id": "background_color",
  "label": "Background Color",
  "default": "#ffffff"
}
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

## Common Patterns

### Conditional Display Based on Settings

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

### Button / CTA Pattern

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

### Color Theming with CSS Custom Properties

```json
[
  {
    "name": "Colors",
    "settings": [
      { "type": "color", "id": "color_primary", "label": "Primary", "default": "#3b82f6" },
      { "type": "color", "id": "color_secondary", "label": "Secondary", "default": "#10b981" },
      { "type": "color", "id": "color_text", "label": "Text", "default": "#1f2937" },
      { "type": "color", "id": "color_background", "label": "Background", "default": "#ffffff" }
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
    { "type": "url", "id": "social_twitter", "label": "Twitter URL" },
    { "type": "url", "id": "social_facebook", "label": "Facebook URL" },
    { "type": "url", "id": "social_instagram", "label": "Instagram URL" },
    { "type": "url", "id": "social_linkedin", "label": "LinkedIn URL" }
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
  {% if settings.social_instagram %}
    <a href="{{ settings.social_instagram }}">Instagram</a>
  {% endif %}
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

### Card Component

A flexible card snippet that handles multiple content types:

```liquid
<!-- snippets/card.liquid -->
<!-- Usage: {% render 'card', item: record, show_image: true %} -->

<article class="card bg-white rounded-lg shadow-sm overflow-hidden">
  {% if show_image and item.image %}
    <a href="{{ item | item_url }}">
      <img
        src="{{ item.image | img_url: 'medium' }}"
        alt="{{ item.title | default: item.name }}"
        class="w-full h-48 object-cover"
      >
    </a>
  {% endif %}

  <div class="p-6">
    <h3 class="font-bold text-lg">
      <a href="{{ item | item_url }}" class="hover:text-blue-600">
        {{ item.title | default: item.name }}
      </a>
    </h3>

    {% if item.excerpt or item.description %}
      <p class="text-gray-600 mt-2">
        {{ item.excerpt | default: item.description | truncate_words: 20 }}
      </p>
    {% endif %}

    {% if item.date or item.published_at %}
      <time class="text-sm text-gray-500 mt-4 block">
        {{ item.date | default: item.published_at | date: '%B %d, %Y' }}
      </time>
    {% endif %}
  </div>
</article>
```

### Pagination Component

Works on mounted collection pages (where `pagination` is auto-supplied) **and** inside `{% paginate %}` blocks — the `pagination` object has the same shape in both contexts.

```liquid
<!-- snippets/pagination.liquid -->
{% if pagination.total_pages > 1 %}
  <nav class="pagination flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}" class="pagination-link">Previous</a>
    {% else %}
      <span class="pagination-link disabled">Previous</span>
    {% endif %}

    <span class="pagination-info">
      Page {{ pagination.current_page }} of {{ pagination.total_pages }}
      ({{ pagination.total_count }} total)
    </span>

    {% if pagination.next_url %}
      <a href="{{ pagination.next_url }}" class="pagination-link">Next</a>
    {% else %}
      <span class="pagination-link disabled">Next</span>
    {% endif %}
  </nav>
{% endif %}
```

**Using with `{% paginate %}` tag:**

```liquid
{% paginate datasets.articles by 10 as articles %}
  {% for article in articles %}
    {% render 'article-card', article: article %}
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

---

## Best Practices

### Keep Snippets Focused

Each snippet should do one thing well:

```liquid
<!-- Good: focused, reusable -->
{% render 'article-card', article: post %}
{% render 'pagination' %}
{% render 'breadcrumb', items: crumbs %}

<!-- Avoid: too many responsibilities -->
{% render 'article-list-with-sidebar-and-pagination' %}
```

### Document Expected Variables

Add comments showing expected variables in snippets:

```liquid
{% comment %}
  Product Card
  Usage: {% render 'product-card', product: item %}

  Expected variables:
    - product.name (required)
    - product.price (required)
    - product.image (optional)
    - product.on_sale (optional, boolean)
{% endcomment %}

<article class="product-card">
  ...
</article>
```

### Handle Missing Data Gracefully

```liquid
<!-- Good: defensive coding -->
{% if article.image %}
  <img src="{{ article.image | img_url: 'medium' }}" alt="">
{% endif %}

<h3>{{ article.title | default: 'Untitled' }}</h3>
<p>{{ article.excerpt | default: '' | truncate_words: 20 }}</p>

<!-- Avoid: assuming data exists -->
<img src="{{ article.image | img_url: 'medium' }}">  <!-- Breaks if no image -->
```

### Prefer Composition Over Complexity

Build complex layouts from simple components:

```liquid
<!-- Good: compose simple snippets -->
<article class="article-full">
  {% render 'breadcrumb', items: breadcrumb %}
  {% render 'article-header', article: article %}
  {% render 'article-content', content: article.content %}
  {% render 'author-bio', author: article.author %}
  {% render 'related-articles', articles: related %}
</article>
```

### Use Clear Labels and Sensible Defaults

```json
{
  "type": "range",
  "id": "items_per_page",
  "label": "Number of Products to Display",
  "info": "How many products to show before pagination",
  "min": 4,
  "max": 24,
  "step": 4,
  "default": 12
}
```

### Group Related Settings

```json
[
  {
    "name": "Hero Section",
    "settings": [
      { "id": "hero_title", "type": "text", "label": "Title" },
      { "id": "hero_subtitle", "type": "textarea", "label": "Subtitle" },
      { "id": "hero_image", "type": "image_picker", "label": "Image" }
    ]
  },
  {
    "name": "Footer",
    "settings": [
      { "id": "footer_text", "type": "text", "label": "Footer Text" },
      { "id": "footer_links", "type": "textarea", "label": "Footer Links" }
    ]
  }
]
```

### Use IDs Consistently

```json
// Good: consistent snake_case naming
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

---

## Troubleshooting

### Blocks Not Rendering (Empty section.blocks)

Check your `settings_data.json` structure:

```json
{
  "sections": {           // Must be under "sections" key
    "testimonials": {     // Must match section name
      "blocks": [...]     // Array of block objects
    }
  }
}
```

### "Section Error: Error rendering section"

Causes:
1. **Invalid JSON in schema** -- Check `config/sections/{name}.json` for syntax errors
2. **Section file not found** -- Verify `sections/{name}.liquid` exists
3. **Missing required settings** -- Some settings may be required

Debug by running:
```bash
swarm lint    # Validate theme structure
```

### Settings Not Applying

Field names in `settings_data.json` must exactly match schema `id` values:

```json
// Schema defines: { "id": "name", "type": "text" }

// CORRECT
{ "settings": { "name": "Alice" } }

// WRONG - field name doesn't match
{ "settings": { "author_name": "Alice" } }
```

### Snippet Variables Not Available

Although snippets receive the full parent context, explicitly passing variables is recommended for clarity:

```liquid
{% assign highlight = true %}
{% render 'card' %}                          <!-- 'highlight' IS available from parent -->
{% render 'card', highlight: highlight %}     <!-- Explicit passing (recommended) -->
```
