# Assets and Styling

Manage CSS, JavaScript, images, and fonts in your theme.

---

## Overview

Theme assets are static files stored in the `assets/` directory:

```
assets/
├── theme.css           # Main stylesheet
├── theme.js            # Main JavaScript
├── images/
│   ├── logo.svg
│   └── hero-bg.jpg
└── fonts/
    ├── custom.woff2
    └── custom.woff
```

Assets are served via CDN for optimal performance.

---

## Supported File Types

| Category | Extensions |
|----------|------------|
| Stylesheets | `.css` |
| JavaScript | `.js` |
| Images | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.ico` |
| Fonts | `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf` |

---

## Referencing Assets

### The asset_url Filter

Use `asset_url` to generate URLs for theme assets:

```liquid
{{ 'theme.css' | asset_url }}
{{ 'theme.js' | asset_url }}
{{ 'logo.svg' | asset_url }}
```

### In Layout

```liquid
<head>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body>
  ...
  <script src="{{ 'theme.js' | asset_url }}"></script>
</body>
```

### Helper Filters

**stylesheet_tag** - Generate a complete link element:

```liquid
{{ 'theme.css' | asset_url | stylesheet_tag }}
<!-- Output: <link rel="stylesheet" href="/assets/theme.css"> -->
```

**script_tag** - Generate a complete script element:

```liquid
{{ 'theme.js' | asset_url | script_tag }}
<!-- Output: <script src="/assets/theme.js"></script> -->
```

### Subdirectories

Reference files in subdirectories with full path:

```liquid
{{ 'images/logo.svg' | asset_url }}
{{ 'fonts/custom.woff2' | asset_url }}
```

---

## CSS

### Basic Setup

Create `assets/theme.css` for your styles:

```css
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Components */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  text-decoration: none;
}

.btn:hover {
  background: #2563eb;
}
```

### Using Tailwind CSS

For rapid development, include Tailwind via CDN:

```liquid
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
```

Your `theme.css` can then focus on custom components:

```css
/* Custom prose styles for article content */
.prose {
  line-height: 1.75;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}
```

### CSS Custom Properties with Settings

Use theme settings for dynamic styling:

```liquid
<head>
  <style>
    :root {
      --color-primary: {{ settings.primary_color | default: '#3b82f6' }};
      --color-secondary: {{ settings.secondary_color | default: '#10b981' }};
      --color-text: {{ settings.text_color | default: '#1f2937' }};
      --color-background: {{ settings.background_color | default: '#ffffff' }};
    }
  </style>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
```

Then reference in CSS:

```css
body {
  color: var(--color-text);
  background: var(--color-background);
}

.btn-primary {
  background: var(--color-primary);
}

a {
  color: var(--color-primary);
}
```

### Custom CSS Setting

Allow site owners to add custom CSS:

**In settings_schema.json:**
```json
{
  "type": "textarea",
  "id": "custom_css",
  "label": "Custom CSS",
  "info": "Add custom CSS styles"
}
```

**In layout:**
```liquid
<head>
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
  {% if settings.custom_css %}
    <style>{{ settings.custom_css }}</style>
  {% endif %}
</head>
```

---

## JavaScript

### Basic Setup

Create `assets/theme.js` for interactivity:

```javascript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
```

### Script Loading

Load scripts at the end of body for better performance:

```liquid
<body>
  {% section 'header' %}
  <main>{{ content_for_layout }}</main>
  {% section 'footer' %}

  <script src="{{ 'theme.js' | asset_url }}"></script>
</body>
```

### Inline JavaScript with Settings

Pass settings to JavaScript:

```liquid
<script>
  window.themeSettings = {
    animationsEnabled: {{ settings.enable_animations | default: true }},
    primaryColor: '{{ settings.primary_color | default: "#3b82f6" }}'
  };
</script>
<script src="{{ 'theme.js' | asset_url }}"></script>
```

Then use in JavaScript:

```javascript
if (window.themeSettings.animationsEnabled) {
  // Add animations
}
```

---

## Images

### Theme Images

Static images for the theme itself (logos, icons, backgrounds):

```liquid
<img src="{{ 'logo.svg' | asset_url }}" alt="Logo">
<img src="{{ 'images/hero-bg.jpg' | asset_url }}" alt="">
```

### Dataset Images

Images from dataset records use the `img_url` filter with sizing:

```liquid
{{ article.image | img_url: 'medium' }}
{{ product.photo | img_url: 'large' }}
{{ member.avatar | img_url: 'small' }}
```

**Available sizes:**

| Size | Dimensions |
|------|------------|
| `small` | 100x100 |
| `medium` | 300x300 |
| `large` | 600x600 |
| `xlarge` | 1200x1200 |
| Custom | `WxH` (e.g., `800x400`) |

```liquid
<!-- Named sizes -->
<img src="{{ article.image | img_url: 'medium' }}" alt="">

<!-- Custom dimensions -->
<img src="{{ article.image | img_url: '800x400' }}" alt="">
```

### Responsive Images

```liquid
<img
  src="{{ article.image | img_url: 'medium' }}"
  srcset="
    {{ article.image | img_url: 'small' }} 100w,
    {{ article.image | img_url: 'medium' }} 300w,
    {{ article.image | img_url: 'large' }} 600w,
    {{ article.image | img_url: 'xlarge' }} 1200w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="{{ article.title }}"
>
```

### Background Images

```liquid
<section style="background-image: url('{{ 'hero-bg.jpg' | asset_url }}')">
  ...
</section>

<!-- From settings -->
{% if section.settings.background_image %}
  <section style="background-image: url('{{ section.settings.background_image | img_url: 'xlarge' }}')">
{% endif %}
```

---

## Fonts

### Web Fonts via CDN

The simplest approach - link to Google Fonts or similar:

```liquid
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
```

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

### Self-Hosted Fonts

Include font files in `assets/fonts/`:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('fonts/custom.woff2') format('woff2'),
       url('fonts/custom.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'CustomFont';
  src: url('fonts/custom-bold.woff2') format('woff2'),
       url('fonts/custom-bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'CustomFont', system-ui, sans-serif;
}
```

**Note:** Self-hosted fonts require relative paths in CSS since the CSS file is served from the assets directory.

### Font Settings

Let site owners choose fonts:

```json
{
  "type": "select",
  "id": "heading_font",
  "label": "Heading Font",
  "default": "system",
  "options": [
    { "value": "system", "label": "System Default" },
    { "value": "inter", "label": "Inter" },
    { "value": "playfair", "label": "Playfair Display" }
  ]
}
```

```liquid
<head>
  {% case settings.heading_font %}
    {% when 'inter' %}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap" rel="stylesheet">
    {% when 'playfair' %}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  {% endcase %}

  <style>
    h1, h2, h3, h4, h5, h6 {
      font-family: {% case settings.heading_font %}
        {% when 'inter' %}'Inter',
        {% when 'playfair' %}'Playfair Display',
      {% endcase %} system-ui, sans-serif;
    }
  </style>
</head>
```

---

## SVG Icons

### Inline SVGs in Snippets

```liquid
<!-- snippets/icon.liquid -->
{% case name %}
  {% when 'menu' %}
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  {% when 'close' %}
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  {% when 'arrow-right' %}
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
{% endcase %}
```

Usage:
```liquid
{% hostnet_render 'icon', name: 'menu' %}
{% hostnet_render 'icon', name: 'arrow-right' %}
```

### SVG Files

Store SVGs in assets and reference with `asset_url`:

```liquid
<img src="{{ 'icons/logo.svg' | asset_url }}" alt="Logo">
```

---

## Best Practices

### 1. Minimize HTTP Requests

Combine CSS into one file when possible:

```
assets/
├── theme.css        # All styles in one file
└── theme.js         # All scripts in one file
```

### 2. Use Appropriate Image Sizes

Don't serve larger images than needed:

```liquid
<!-- Thumbnail list -->
<img src="{{ article.image | img_url: 'small' }}" alt="">

<!-- Card image -->
<img src="{{ article.image | img_url: 'medium' }}" alt="">

<!-- Full-width hero -->
<img src="{{ article.image | img_url: 'xlarge' }}" alt="">
```

### 3. Lazy Load Images

Add lazy loading for below-fold images:

```liquid
<img
  src="{{ article.image | img_url: 'medium' }}"
  alt="{{ article.title }}"
  loading="lazy"
>
```

### 4. Preload Critical Assets

Preload fonts and critical CSS:

```liquid
<head>
  <link rel="preload" href="{{ 'theme.css' | asset_url }}" as="style">
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" as="style">
  ...
</head>
```

### 5. Use Modern Image Formats

Prefer WebP for photos when possible:

```liquid
<picture>
  <source srcset="{{ article.image | img_url: 'large' }}" type="image/webp">
  <img src="{{ article.image | img_url: 'large' }}" alt="">
</picture>
```

### 6. Keep JavaScript Minimal

Most themes don't need much JavaScript:

```javascript
// Mobile menu - that's often all you need
document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => {
  document.querySelector('[data-mobile-menu]').classList.toggle('hidden');
});
```

### 7. CSS Organization

Structure your CSS logically:

```css
/* ==========================================================================
   Base
   ========================================================================== */
/* Reset, typography, base elements */

/* ==========================================================================
   Layout
   ========================================================================== */
/* Container, grid, sections */

/* ==========================================================================
   Components
   ========================================================================== */
/* Cards, buttons, forms, navigation */

/* ==========================================================================
   Utilities
   ========================================================================== */
/* Spacing, visibility, text alignment */
```
