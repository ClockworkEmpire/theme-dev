# Sections and Snippets

Build modular, reusable components for your theme.

---

## Overview

HostNet themes use two types of reusable components:

| Type | Settings | Scope | Use Case |
|------|----------|-------|----------|
| **Sections** | Yes (via schema) | Site-wide config | Header, footer, hero banners |
| **Snippets** | No | Passed variables only | Cards, buttons, icons |

**Rule of thumb:**
- Use **sections** for components that site owners should customize
- Use **snippets** for repeated UI patterns that receive data dynamically

---

## Sections

Sections are reusable page components with configurable settings.

### Basic Section Structure

```liquid
<!-- sections/hero.liquid -->

<section class="hero bg-blue-600 text-white py-20">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-5xl font-bold">{{ section.settings.title }}</h1>
    <p class="text-xl mt-4">{{ section.settings.subtitle }}</p>
  </div>
</section>

{% schema %}
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
{% endschema %}
```

### Including Sections

Use the `{% section %}` tag in templates or layouts:

```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'footer' %}
```

The tag:
1. Loads `sections/header.liquid`
2. Parses the `{% schema %}` block
3. Merges default settings with site customizations
4. Makes `section.settings` available
5. Renders the HTML

### Section Object

Inside a section, you have access to:

| Property | Description |
|----------|-------------|
| `section.id` | Unique identifier for the section instance |
| `section.settings` | Settings values (defaults + customizations) |

```liquid
<section id="{{ section.id }}">
  <h2>{{ section.settings.heading }}</h2>
  {% if section.settings.show_description %}
    <p>{{ section.settings.description }}</p>
  {% endif %}
</section>
```

### Schema Block

The `{% schema %}` block defines the section's metadata and settings:

```liquid
{% schema %}
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
{% endschema %}
```

**Important:** The schema block renders nothing - it's metadata only. Place it at the end of your section file.

See [Settings Schema](settings-schema.md) for complete setting type documentation.

---

## Snippets

Snippets are simple partials without settings. They receive data via variables passed from the parent template.

### Basic Snippet Structure

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

Use `{% hostnet_render %}` to include snippets:

```liquid
{% hostnet_render 'article-card', article: post %}
```

**Why `hostnet_render`?**

HostNet uses database-backed templates, not files. The `hostnet_render` tag is a custom implementation that looks up snippets from the database. The name distinguishes it from Liquid's built-in file-based `render` tag.

### Passing Variables

Pass any variables the snippet needs:

```liquid
<!-- Single variable -->
{% hostnet_render 'article-card', article: post %}

<!-- Multiple variables -->
{% hostnet_render 'product-card', product: item, show_price: true, featured: false %}

<!-- Complex data -->
{% hostnet_render 'stats', count: collection.size, label: 'Articles' %}
```

### Variable Scope

Snippets have **isolated scope**. They only see:
- Variables explicitly passed
- Global objects (`site`, `settings`, `request`, `datasets`, `mount`, `pagination`)

Variables from the parent template are NOT automatically available:

```liquid
{% assign highlight = true %}
{% hostnet_render 'card' %}  <!-- 'highlight' is NOT available -->
{% hostnet_render 'card', highlight: highlight %}  <!-- Now it is -->
```

### Collection Iteration

Render a snippet for each item in a collection:

```liquid
{% hostnet_render 'article-card' for articles as article %}
```

This is equivalent to:

```liquid
{% for article in articles %}
  {% hostnet_render 'article-card', article: article %}
{% endfor %}
```

The iteration syntax is cleaner and makes the intent explicit.

---

## Component Patterns

### Card Components

Cards are the most common reusable pattern. Design them to be flexible:

```liquid
<!-- snippets/card.liquid -->
<!-- Usage: {% hostnet_render 'card', item: record, show_image: true %} -->

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

### Specialized Cards

Create specialized versions for different content types:

```liquid
<!-- snippets/article-card.liquid -->
<article class="card">
  {% if article.image %}
    <img src="{{ article.image | img_url: 'medium' }}" alt="">
  {% endif %}
  <div class="card-body">
    <span class="badge">{{ article.category }}</span>
    <h3><a href="{{ article | item_url }}">{{ article.title }}</a></h3>
    <p>{{ article.excerpt | truncate_words: 25 }}</p>
    <div class="card-meta">
      <span>{{ article.author }}</span>
      <time>{{ article.published_at | date: '%b %d' }}</time>
    </div>
  </div>
</article>

<!-- snippets/product-card.liquid -->
<article class="card">
  <img src="{{ product.image | img_url: 'medium' }}" alt="">
  <div class="card-body">
    <h3><a href="{{ product | item_url }}">{{ product.name }}</a></h3>
    <p class="price">${{ product.price }}</p>
    {% if product.on_sale %}
      <span class="badge sale">Sale</span>
    {% endif %}
  </div>
</article>

<!-- snippets/team-card.liquid -->
<article class="card text-center">
  <img src="{{ member.photo | img_url: 'medium' }}" alt="" class="rounded-full mx-auto">
  <h3>{{ member.name }}</h3>
  <p class="role">{{ member.role }}</p>
  <p>{{ member.bio | truncate_words: 20 }}</p>
</article>
```

### Grid Layouts

Combine cards with grid layouts:

```liquid
<!-- In a template -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {% for article in datasets.articles limit: 6 %}
    {% hostnet_render 'article-card', article: article %}
  {% else %}
    <p class="col-span-full text-center text-gray-500 py-12">
      No articles found.
    </p>
  {% endfor %}
</div>
```

### Conditional Display

Handle optional elements gracefully:

```liquid
<!-- snippets/author-bio.liquid -->
{% if author %}
  <div class="author-bio flex items-center gap-4">
    {% if author.avatar %}
      <img src="{{ author.avatar | img_url: 'small' }}" alt="" class="rounded-full">
    {% endif %}
    <div>
      <strong>{{ author.name }}</strong>
      {% if author.title %}
        <span class="text-gray-500">{{ author.title }}</span>
      {% endif %}
    </div>
  </div>
{% endif %}
```

### Pagination Component

A reusable pagination snippet:

```liquid
<!-- snippets/pagination.liquid -->
{% if pagination.total_pages > 1 %}
  <nav class="pagination flex items-center justify-center gap-4 mt-12" aria-label="Pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}" class="pagination-link">
        ← Previous
      </a>
    {% else %}
      <span class="pagination-link disabled">← Previous</span>
    {% endif %}

    <span class="pagination-info">
      Page {{ pagination.current_page }} of {{ pagination.total_pages }}
    </span>

    {% if pagination.next_url %}
      <a href="{{ pagination.next_url }}" class="pagination-link">
        Next →
      </a>
    {% else %}
      <span class="pagination-link disabled">Next →</span>
    {% endif %}
  </nav>
{% endif %}
```

### Social Links

```liquid
<!-- snippets/social-links.liquid -->
<div class="social-links flex gap-4">
  {% if settings.twitter_url %}
    <a href="{{ settings.twitter_url }}" aria-label="Twitter">
      {% hostnet_render 'icon', name: 'twitter' %}
    </a>
  {% endif %}
  {% if settings.facebook_url %}
    <a href="{{ settings.facebook_url }}" aria-label="Facebook">
      {% hostnet_render 'icon', name: 'facebook' %}
    </a>
  {% endif %}
  {% if settings.instagram_url %}
    <a href="{{ settings.instagram_url }}" aria-label="Instagram">
      {% hostnet_render 'icon', name: 'instagram' %}
    </a>
  {% endif %}
</div>
```

### Icon Components

```liquid
<!-- snippets/icon.liquid -->
{% case name %}
  {% when 'twitter' %}
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675..."/>
    </svg>
  {% when 'facebook' %}
    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0..."/>
    </svg>
  {% when 'arrow-right' %}
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
{% endcase %}
```

---

## Section Patterns

### Configurable Hero

```liquid
<!-- sections/hero.liquid -->
<section
  class="hero py-20"
  style="background-color: {{ section.settings.bg_color }}; color: {{ section.settings.text_color }};"
>
  <div class="container mx-auto px-4 text-center">
    {% if section.settings.eyebrow %}
      <span class="text-sm uppercase tracking-wider opacity-75">
        {{ section.settings.eyebrow }}
      </span>
    {% endif %}

    <h1 class="text-5xl font-bold mt-2">{{ section.settings.title }}</h1>

    {% if section.settings.subtitle %}
      <p class="text-xl mt-4 max-w-2xl mx-auto opacity-90">
        {{ section.settings.subtitle }}
      </p>
    {% endif %}

    {% if section.settings.button_text %}
      <a
        href="{{ section.settings.button_url | default: '#' }}"
        class="inline-block mt-8 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg"
      >
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow Text"
    },
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
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text"
    },
    {
      "type": "url",
      "id": "button_url",
      "label": "Button URL"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#3b82f6"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text Color",
      "default": "#ffffff"
    }
  ]
}
{% endschema %}
```

### Featured Content Section

```liquid
<!-- sections/featured-articles.liquid -->
<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-3xl font-bold">{{ section.settings.title }}</h2>
      {% if section.settings.show_view_all %}
        <a href="{{ section.settings.view_all_url | default: '/articles' }}" class="text-blue-600">
          View all →
        </a>
      {% endif %}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-{{ section.settings.columns }} gap-6">
      {% for article in datasets.articles limit: section.settings.limit %}
        {% hostnet_render 'article-card', article: article %}
      {% else %}
        <p class="col-span-full text-center text-gray-500">No articles yet.</p>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Featured Articles",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Latest Articles"
    },
    {
      "type": "range",
      "id": "limit",
      "label": "Number of Articles",
      "min": 1,
      "max": 12,
      "step": 1,
      "default": 3
    },
    {
      "type": "range",
      "id": "columns",
      "label": "Columns",
      "min": 1,
      "max": 4,
      "step": 1,
      "default": 3
    },
    {
      "type": "checkbox",
      "id": "show_view_all",
      "label": "Show 'View All' Link",
      "default": true
    },
    {
      "type": "url",
      "id": "view_all_url",
      "label": "View All URL",
      "default": "/articles"
    }
  ]
}
{% endschema %}
```

### Navigation Header

```liquid
<!-- sections/header.liquid -->
<header class="bg-white shadow-sm sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        {% if section.settings.logo %}
          <img src="{{ section.settings.logo | img_url: '200x50' }}" alt="{{ site.name }}">
        {% else %}
          <span class="text-xl font-bold">
            {{ section.settings.logo_text | default: site.name }}
          </span>
        {% endif %}
      </a>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        {% assign links = section.settings.nav_links | split: '|' %}
        {% for link in links %}
          {% assign parts = link | split: ':' %}
          {% assign label = parts[0] | strip %}
          {% assign url = parts[1] | strip %}
          <a
            href="{{ url }}"
            class="{% if request.path == url %}text-blue-600 font-medium{% else %}text-gray-600 hover:text-gray-900{% endif %}"
          >
            {{ label }}
          </a>
        {% endfor %}
      </nav>

      <!-- CTA Button -->
      {% if section.settings.cta_text %}
        <a
          href="{{ section.settings.cta_url | default: '#' }}"
          class="hidden md:inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {{ section.settings.cta_text }}
        </a>
      {% endif %}
    </div>
  </div>
</header>

{% schema %}
{
  "name": "Header",
  "settings": [
    {
      "type": "image_picker",
      "id": "logo",
      "label": "Logo Image"
    },
    {
      "type": "text",
      "id": "logo_text",
      "label": "Logo Text",
      "info": "Used if no logo image is set"
    },
    {
      "type": "textarea",
      "id": "nav_links",
      "label": "Navigation Links",
      "info": "Format: Label:URL | Label:URL",
      "default": "Home:/ | About:/about | Contact:/contact"
    },
    {
      "type": "text",
      "id": "cta_text",
      "label": "CTA Button Text"
    },
    {
      "type": "url",
      "id": "cta_url",
      "label": "CTA Button URL"
    }
  ]
}
{% endschema %}
```

---

## Best Practices

### 1. Keep Snippets Focused

Each snippet should do one thing well:

```liquid
<!-- Good: focused, reusable -->
{% hostnet_render 'article-card', article: post %}
{% hostnet_render 'pagination' %}
{% hostnet_render 'breadcrumb', items: crumbs %}

<!-- Avoid: too many responsibilities -->
{% hostnet_render 'article-list-with-sidebar-and-pagination' %}
```

### 2. Use Meaningful Names

```liquid
<!-- Good: clear purpose -->
{% hostnet_render 'product-card', product: item %}
{% hostnet_render 'author-bio', author: post.author %}

<!-- Avoid: vague names -->
{% hostnet_render 'card', data: item %}
{% hostnet_render 'component', info: author %}
```

### 3. Document Expected Variables

Add comments showing expected variables:

```liquid
{% comment %}
  Product Card
  Usage: {% hostnet_render 'product-card', product: item %}

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

### 4. Handle Missing Data Gracefully

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

### 5. Prefer Composition Over Complexity

Build complex layouts from simple components:

```liquid
<!-- Good: compose simple snippets -->
<article class="article-full">
  {% hostnet_render 'breadcrumb', items: breadcrumb %}
  {% hostnet_render 'article-header', article: article %}
  {% hostnet_render 'article-content', content: article.content %}
  {% hostnet_render 'author-bio', author: article.author %}
  {% hostnet_render 'related-articles', articles: related %}
</article>

<!-- Avoid: one giant template -->
<article>
  <!-- 200 lines of mixed HTML and Liquid -->
</article>
```

---

## Drop-Ins

Drop-ins are a third type of reusable content, distinct from sections and snippets.

### What Are Drop-Ins?

Drop-ins are content blocks that can be customized by site owners without editing theme files. They support two sources:

1. **User content** (database) - Plain HTML managed via the dashboard
2. **Theme defaults** (`dropins/` folder) - Liquid templates provided by the theme

### Resolution Order

When you use `{% dropin 'promo-banner' %}`, the system checks in order:

1. **User content** - Site-specific drop-in in database
2. **User content** - Account-wide drop-in in database
3. **Theme default** - `dropins/promo-banner.liquid` in theme
4. **Empty string** - If none exist

This means themes can provide sensible defaults that site owners can override.

### When to Use Drop-Ins

| Component | Managed By | Contains Liquid | Use For |
|-----------|------------|-----------------|---------|
| **Sections** | Theme developer | Yes | Configurable page components (hero, header) |
| **Snippets** | Theme developer | Yes | Reusable UI patterns (cards, icons) |
| **Drop-Ins** | Theme + Site owner | Theme defaults: Yes | Overridable content (disclaimers, promos) |

**Use drop-ins for content that:**
- Site owners may want to customize without editing theme files
- May vary between sites in an account
- Benefits from a theme-provided default

### Including Drop-Ins

Use the `{% dropin %}` tag:

```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'announcement-banner' %}
{% dropin 'contact-info' %}
```

### Theme Defaults

Provide default content by creating `.liquid` files in the `dropins/` folder:

```
theme/
├── dropins/
│   ├── promo-banner.liquid
│   ├── footer-disclaimer.liquid
│   └── announcement.liquid
├── sections/
├── snippets/
└── ...
```

Theme defaults support full Liquid processing:

```liquid
<!-- dropins/promo-banner.liquid -->
<div class="promo-banner" style="background: {{ settings.primary_color }}">
  <p>{{ settings.promo_text | default: 'Check out our latest offers!' }}</p>
  <a href="{{ settings.promo_link | default: '/about' }}">Learn More</a>
</div>
```

**Available in theme defaults:**
- `settings` - Theme settings
- `site` - Site information (`site.name`, `site.url`, etc.)
- All standard Liquid filters

### User Content Overrides

When a site owner creates a drop-in via the dashboard, it overrides the theme default. User content is plain HTML (no Liquid processing) since it's managed by non-technical users.

### Fallback with Capture (Legacy)

For inline fallbacks without a `dropins/` file, use `capture` with the `default` filter:

```liquid
{% capture content %}{% dropin 'promo-banner' %}{% endcapture %}
{{ content | default: '<p>Default promotional text</p>' }}
```

**Note:** The `dropins/` folder approach is preferred - it keeps defaults organized and supports Liquid.

### Cascading Scope

User-provided drop-ins support two levels:

1. **Account-wide** - Available to all sites in the account
2. **Site-specific** - Overrides account-wide drop-in with same name

This lets site owners:
- Create shared content once at the account level
- Override specific drop-ins for individual sites when needed

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

See the [Liquid Reference](liquid-reference.md#dropin) for full tag documentation.

---

## Section Blocks

Sections can contain **blocks** - repeatable data items that site owners can add, remove, and reorder. Blocks are perfect for team members, FAQ items, pricing tiers, testimonials, and similar repeating content.

### Why Use Blocks?

| Approach | Best For |
|----------|----------|
| **Blocks** | Small, section-scoped repeatable items (2-20 items) |
| **Datasets** | Large content collections with pagination (blogs, products) |

**Use blocks when:**
- Content belongs to a specific section
- Site owners need to customize which items appear
- You don't need pagination or URL routing

### Defining Block Types

Add a `blocks` array to your section's `{% schema %}`:

```liquid
<!-- sections/team.liquid -->
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

{% schema %}
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
{% endschema %}
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

```liquid
<!-- sections/testimonials.liquid -->
<section class="testimonials">
  {% for block in section.blocks %}
    {% case block.type %}
      {% when 'quote' %}
        <blockquote>
          <p>"{{ block.settings.text }}"</p>
          <cite>— {{ block.settings.author }}</cite>
        </blockquote>

      {% when 'video' %}
        <div class="video-testimonial">
          <iframe src="{{ block.settings.video_url }}"></iframe>
          <p>{{ block.settings.caption }}</p>
        </div>
    {% endcase %}
  {% endfor %}
</section>

{% schema %}
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
{% endschema %}
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

### Local Development

For local development, add mock block data to `data/settings.json`:

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

### Common Block Patterns

#### FAQ Section

```liquid
{% for block in section.blocks %}
  <details class="faq-item">
    <summary>{{ block.settings.question }}</summary>
    <p>{{ block.settings.answer }}</p>
  </details>
{% endfor %}

{% schema %}
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
{% endschema %}
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

### Block Settings Types

Block settings support the same types as section settings:

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

See [Settings Schema](settings-schema.md) for full documentation.
