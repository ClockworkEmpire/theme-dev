# Liquid Reference

Complete reference for Liquid templating in HostNet themes.

## Overview

HostNet uses [Liquid](https://shopify.github.io/liquid/), a template language created by Shopify. Templates are text files with `.liquid` extension containing a mix of static content and dynamic Liquid code.

Liquid has three main components:
- **Objects** - Output data with `{{ }}`
- **Tags** - Logic and control flow with `{% %}`
- **Filters** - Transform output with `|`

---

## Objects and Output

Objects contain data that gets output when rendered. Use double curly braces:

```liquid
{{ site.name }}
{{ article.title }}
{{ settings.primary_color }}
```

Access nested properties with dot notation:

```liquid
{{ article.author.name }}
{{ settings.hero.title }}
```

Access array elements by index:

```liquid
{{ collection[0].title }}
{{ datasets.posts.first.title }}
```

---

## Global Objects

These objects are available in every template.

### site

Current site information.

| Property | Type | Description |
|----------|------|-------------|
| `site.name` | String | Site display name |
| `site.subdomain` | String | Site subdomain |
| `site.url` | String | Current environment URL |
| `site.staging_url` | String | Staging environment URL |
| `site.production_url` | String | Production environment URL |

```liquid
<title>{{ page_title | default: site.name }}</title>
<link rel="canonical" href="{{ site.url }}{{ request.path }}">
```

### settings

Theme settings defined in `config/settings_schema.json` and section schemas. Values come from theme defaults merged with site-specific overrides.

```liquid
{{ settings.logo_text }}
{{ settings.primary_color }}
{{ settings.show_newsletter }}

{% if settings.custom_css %}
  <style>{{ settings.custom_css }}</style>
{% endif %}
```

### request

Current HTTP request information.

| Property | Type | Description |
|----------|------|-------------|
| `request.path` | String | URL path (e.g., `/blog/my-post`) |
| `request.host` | String | Hostname |
| `request.method` | String | HTTP method (GET, POST, etc.) |

```liquid
{% if request.path == '/' %}
  {% section 'hero' %}
{% endif %}

<a href="/about" {% if request.path == '/about' %}class="active"{% endif %}>About</a>
```

### datasets

Access to all mounted datasets by their alias. Each dataset is a collection of records.

```liquid
{% for article in datasets.articles limit: 5 %}
  <h3>{{ article.title }}</h3>
{% endfor %}

{% for product in datasets.products %}
  {% hostnet_render 'product-card', product: product %}
{% endfor %}
```

Dataset records are Liquid drops with dynamic properties based on your dataset schema:

```liquid
{{ article.title }}
{{ article.slug }}
{{ article.excerpt }}
{{ article.published_at | date: '%B %d, %Y' }}
{{ article.author }}
{{ article.image | img_url: 'large' }}
```

### collection

Available on dataset list pages (e.g., `/blog`). Contains the paginated array of records for the current page.

```liquid
{% for article in collection %}
  {% hostnet_render 'article-card', article: article %}
{% else %}
  <p>No articles found.</p>
{% endfor %}
```

### pagination

Available on dataset list pages. Contains pagination metadata.

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current_page` | Integer | Current page number (1-indexed) |
| `pagination.total_pages` | Integer | Total number of pages |
| `pagination.next_url` | String/nil | URL to next page, or nil |
| `pagination.prev_url` | String/nil | URL to previous page, or nil |

```liquid
{% if pagination.total_pages > 1 %}
  <nav class="pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}">← Previous</a>
    {% endif %}

    <span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span>

    {% if pagination.next_url %}
      <a href="{{ pagination.next_url }}">Next →</a>
    {% endif %}
  </nav>
{% endif %}
```

### mount

Available on dataset list and item pages. Contains information about the dataset mount configuration.

| Property | Type | Description |
|----------|------|-------------|
| `mount.alias` | String | Dataset alias (e.g., `articles`) |
| `mount.mount_path` | String | URL mount path (e.g., `/blog`) |
| `mount.slug_field` | String | Field used for URL slugs |
| `mount.items_per_page` | Integer | Records per page |

```liquid
<nav aria-label="breadcrumb">
  <a href="/">Home</a> /
  <a href="{{ mount.mount_path }}">{{ mount.alias | capitalize }}</a>
  {% if article %}
    / {{ article.title }}
  {% endif %}
</nav>
```

### content_for_layout

Available in layout templates only. Contains the rendered page content.

```liquid
<!-- layout/theme.liquid -->
<body>
  {% section 'header' %}
  <main>
    {{ content_for_layout }}
  </main>
  {% section 'footer' %}
</body>
```

### section

Available inside section templates. Contains section metadata and settings.

| Property | Type | Description |
|----------|------|-------------|
| `section.id` | String | Unique section identifier |
| `section.settings` | Object | Section settings values |

```liquid
<!-- sections/hero.liquid -->
<section id="{{ section.id }}" class="hero">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
</section>
```

---

## Custom Tags

HostNet provides custom Liquid tags for theme functionality.

### section

Renders a section from the `sections/` directory with its settings applied.

```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'featured-products' %}
{% section 'footer' %}
```

The section tag:
1. Loads the section file (e.g., `sections/header.liquid`)
2. Parses the `{% schema %}` block for default settings
3. Merges site-specific settings with defaults
4. Makes `section.settings` available in the template
5. Renders the section content

### hostnet_render

Renders a snippet from the `snippets/` directory with isolated variable scope.

**Basic usage:**
```liquid
{% hostnet_render 'icon' %}
{% hostnet_render 'social-links' %}
```

**With variables:**
```liquid
{% hostnet_render 'article-card', article: post %}
{% hostnet_render 'product-card', product: item, show_price: true %}
{% hostnet_render 'button', text: 'Buy Now', url: product.url, style: 'primary' %}
```

**Collection iteration:**
```liquid
{% hostnet_render 'article-card' for articles as article %}
{% hostnet_render 'product-card' for featured_products as product %}
```

This is equivalent to:
```liquid
{% for article in articles %}
  {% hostnet_render 'article-card', article: article %}
{% endfor %}
```

**Why `hostnet_render` instead of `render`?**

HostNet uses a custom database-backed render implementation. The `hostnet_render` name distinguishes it from Liquid's built-in file-based `render` tag and makes the behavior explicit.

**Variable isolation:**

Snippets have isolated scope. They only receive:
- Variables explicitly passed
- Global objects (`site`, `settings`, `request`, `datasets`, `mount`)

Variables from the parent template are NOT automatically available:
```liquid
{% assign featured = true %}
{% hostnet_render 'card' %}  <!-- 'featured' is NOT available in card.liquid -->
{% hostnet_render 'card', featured: featured %}  <!-- Now it's available -->
```

### schema

Defines configurable settings for a section. Only valid in section files. Renders nothing - it's metadata only.

```liquid
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
    },
    {
      "type": "image_picker",
      "id": "background_image",
      "label": "Background Image"
    }
  ]
}
{% endschema %}
```

Place the schema block at the end of your section file. See [Settings Schema](settings-schema.md) for full schema documentation.

---

## Custom Filters

HostNet provides custom filters for common theme operations.

### asset_url

Generates a URL for a theme asset in the `assets/` directory.

```liquid
{{ 'theme.css' | asset_url }}
{{ 'app.js' | asset_url }}
{{ 'logo.png' | asset_url }}
```

Output depends on storage configuration (local path or CDN URL).

### img_url

Generates a sized image URL. Works with image fields from datasets or media library.

**Named sizes:**
```liquid
{{ article.image | img_url: 'small' }}    <!-- 100x100 -->
{{ article.image | img_url: 'medium' }}   <!-- 300x300 -->
{{ article.image | img_url: 'large' }}    <!-- 600x600 -->
{{ article.image | img_url: 'xlarge' }}   <!-- 1200x1200 -->
```

**Custom dimensions:**
```liquid
{{ article.image | img_url: '800x400' }}
{{ product.image | img_url: '400x400' }}
```

### item_url

Generates the URL for a dataset record using its mount path and slug.

```liquid
{{ article | item_url }}         <!-- /blog/my-article-slug -->
{{ product | item_url }}         <!-- /products/widget-pro -->
```

Use in links:
```liquid
<a href="{{ article | item_url }}">{{ article.title }}</a>
```

### link_to

Generates an HTML anchor tag.

```liquid
{{ 'Home' | link_to: '/' }}
{{ 'About Us' | link_to: '/about' }}
{{ article.title | link_to: article | item_url }}
```

Output:
```html
<a href="/">Home</a>
<a href="/about">About Us</a>
```

### date

Formats a date/time value using strftime format.

```liquid
{{ article.published_at | date: '%B %d, %Y' }}     <!-- January 15, 2025 -->
{{ article.published_at | date: '%Y-%m-%d' }}      <!-- 2025-01-15 -->
{{ article.published_at | date: '%b %d' }}         <!-- Jan 15 -->
{{ 'now' | date: '%Y' }}                           <!-- Current year -->
```

Common format codes:
| Code | Output | Example |
|------|--------|---------|
| `%Y` | 4-digit year | 2025 |
| `%m` | Month (01-12) | 01 |
| `%d` | Day (01-31) | 15 |
| `%B` | Full month name | January |
| `%b` | Abbreviated month | Jan |
| `%A` | Full weekday | Wednesday |
| `%a` | Abbreviated weekday | Wed |
| `%H` | Hour (00-23) | 14 |
| `%I` | Hour (01-12) | 02 |
| `%M` | Minute | 30 |
| `%p` | AM/PM | PM |

### truncate_words

Truncates text to a specified number of words, adding ellipsis.

```liquid
{{ article.content | truncate_words: 30 }}
{{ product.description | truncate_words: 15 }}
```

### slugify

Converts a string to a URL-friendly slug.

```liquid
{{ 'Hello World!' | slugify }}        <!-- hello-world -->
{{ article.title | slugify }}         <!-- my-article-title -->
```

### stylesheet_tag

Generates an HTML `<link>` tag for a stylesheet.

```liquid
{{ 'theme.css' | asset_url | stylesheet_tag }}
```

Output:
```html
<link rel="stylesheet" href="/assets/theme.css">
```

### script_tag

Generates an HTML `<script>` tag.

```liquid
{{ 'app.js' | asset_url | script_tag }}
```

Output:
```html
<script src="/assets/app.js"></script>
```

---

## Standard Liquid Tags

### Control Flow

**if / elsif / else**
```liquid
{% if article.featured %}
  <span class="badge">Featured</span>
{% elsif article.new %}
  <span class="badge">New</span>
{% else %}
  <!-- Regular article -->
{% endif %}
```

**unless** (inverse of if)
```liquid
{% unless article.draft %}
  <!-- Show published content -->
{% endunless %}
```

**case / when**
```liquid
{% case article.category %}
  {% when 'news' %}
    <span class="tag tag-news">News</span>
  {% when 'tutorial' %}
    <span class="tag tag-tutorial">Tutorial</span>
  {% else %}
    <span class="tag">{{ article.category }}</span>
{% endcase %}
```

### Iteration

**for loop**
```liquid
{% for article in collection %}
  <article>
    <h2>{{ article.title }}</h2>
  </article>
{% endfor %}
```

**for with else** (empty collection)
```liquid
{% for article in collection %}
  {% hostnet_render 'article-card', article: article %}
{% else %}
  <p>No articles found.</p>
{% endfor %}
```

**for with limit and offset**
```liquid
{% for article in datasets.articles limit: 3 %}
  <!-- First 3 articles -->
{% endfor %}

{% for article in datasets.articles limit: 5 offset: 3 %}
  <!-- Articles 4-8 -->
{% endfor %}
```

**for reversed**
```liquid
{% for article in collection reversed %}
  <!-- Oldest first -->
{% endfor %}
```

**forloop object**
```liquid
{% for article in collection %}
  {{ forloop.index }}      <!-- 1, 2, 3... -->
  {{ forloop.index0 }}     <!-- 0, 1, 2... -->
  {{ forloop.first }}      <!-- true on first iteration -->
  {{ forloop.last }}       <!-- true on last iteration -->
  {{ forloop.length }}     <!-- total items -->
  {{ forloop.rindex }}     <!-- reverse index (3, 2, 1) -->
{% endfor %}
```

**break and continue**
```liquid
{% for article in collection %}
  {% if article.draft %}
    {% continue %}
  {% endif %}
  {% if forloop.index > 10 %}
    {% break %}
  {% endif %}
  {{ article.title }}
{% endfor %}
```

### Variables

**assign**
```liquid
{% assign featured_articles = datasets.articles | where: 'featured', true %}
{% assign page_title = article.title | append: ' | ' | append: site.name %}
```

**capture**
```liquid
{% capture full_name %}{{ author.first_name }} {{ author.last_name }}{% endcapture %}
<p>By {{ full_name }}</p>
```

### Output Control

**comment**
```liquid
{% comment %}
  This content won't be rendered.
  Use for documentation or temporarily disabling code.
{% endcomment %}
```

**raw** (escape Liquid)
```liquid
{% raw %}
  This {{ will not }} be processed as Liquid.
{% endraw %}
```

---

## Standard Liquid Filters

### String Filters

| Filter | Input | Output |
|--------|-------|--------|
| `upcase` | `{{ 'hello' \| upcase }}` | `HELLO` |
| `downcase` | `{{ 'HELLO' \| downcase }}` | `hello` |
| `capitalize` | `{{ 'hello world' \| capitalize }}` | `Hello world` |
| `strip` | `{{ '  hello  ' \| strip }}` | `hello` |
| `lstrip` | `{{ '  hello' \| lstrip }}` | `hello` |
| `rstrip` | `{{ 'hello  ' \| rstrip }}` | `hello` |
| `truncate` | `{{ 'hello world' \| truncate: 8 }}` | `hello...` |
| `append` | `{{ 'hello' \| append: ' world' }}` | `hello world` |
| `prepend` | `{{ 'world' \| prepend: 'hello ' }}` | `hello world` |
| `replace` | `{{ 'hello' \| replace: 'l', 'L' }}` | `heLLo` |
| `replace_first` | `{{ 'hello' \| replace_first: 'l', 'L' }}` | `heLlo` |
| `remove` | `{{ 'hello' \| remove: 'l' }}` | `heo` |
| `remove_first` | `{{ 'hello' \| remove_first: 'l' }}` | `helo` |
| `split` | `{{ 'a,b,c' \| split: ',' }}` | Array: `['a','b','c']` |
| `strip_html` | `{{ '<p>hi</p>' \| strip_html }}` | `hi` |
| `strip_newlines` | Removes newlines | |
| `newline_to_br` | Converts `\n` to `<br>` | |
| `escape` | HTML-escapes | |
| `url_encode` | URL-encodes | |

### Array Filters

| Filter | Description |
|--------|-------------|
| `first` | First element |
| `last` | Last element |
| `size` | Number of elements |
| `join` | Join with separator |
| `reverse` | Reverse order |
| `sort` | Sort alphabetically |
| `sort_natural` | Case-insensitive sort |
| `uniq` | Remove duplicates |
| `compact` | Remove nil values |
| `concat` | Combine arrays |
| `map` | Extract property from objects |
| `where` | Filter by property |

```liquid
{{ collection | size }}                          <!-- 10 -->
{{ collection | first }}                         <!-- First item -->
{{ collection | map: 'title' | join: ', ' }}    <!-- Title 1, Title 2, Title 3 -->
{{ collection | where: 'featured', true }}      <!-- Filtered array -->
{{ collection | sort: 'date' | reverse }}       <!-- Sorted, newest first -->
```

### Math Filters

| Filter | Example | Output |
|--------|---------|--------|
| `plus` | `{{ 4 \| plus: 2 }}` | `6` |
| `minus` | `{{ 4 \| minus: 2 }}` | `2` |
| `times` | `{{ 4 \| times: 2 }}` | `8` |
| `divided_by` | `{{ 10 \| divided_by: 3 }}` | `3` |
| `modulo` | `{{ 10 \| modulo: 3 }}` | `1` |
| `floor` | `{{ 4.7 \| floor }}` | `4` |
| `ceil` | `{{ 4.2 \| ceil }}` | `5` |
| `round` | `{{ 4.5 \| round }}` | `5` |
| `abs` | `{{ -5 \| abs }}` | `5` |

### Other Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `default` | Fallback value | `{{ title \| default: 'Untitled' }}` |
| `json` | Convert to JSON | `{{ object \| json }}` |

---

## Operators

### Comparison

| Operator | Description |
|----------|-------------|
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater or equal |
| `<=` | Less or equal |

```liquid
{% if article.views > 1000 %}
  <span>Popular</span>
{% endif %}
```

### Logical

| Operator | Description |
|----------|-------------|
| `and` | Both true |
| `or` | Either true |

```liquid
{% if article.featured and article.published %}
  <!-- Show -->
{% endif %}

{% if article.category == 'news' or article.category == 'updates' %}
  <!-- Show -->
{% endif %}
```

### contains

Check if string contains substring or array contains element:

```liquid
{% if article.title contains 'Guide' %}
  <span class="badge">Guide</span>
{% endif %}

{% if article.tags contains 'featured' %}
  <!-- Featured article -->
{% endif %}
```

---

## Truthy and Falsy

In Liquid, these values are **falsy** (evaluate to false):
- `false`
- `nil` / `null`
- Empty string `""`

Everything else is **truthy**, including:
- `0` (zero)
- Empty array `[]`
- Empty object `{}`

```liquid
{% if article.image %}
  <!-- Runs if image exists and is not empty string -->
{% endif %}

{% if collection.size > 0 %}
  <!-- More explicit check for non-empty collection -->
{% endif %}
```

---

## Whitespace Control

Use `{%-` and `-%}` to strip whitespace:

```liquid
{%- if article.featured -%}
  <span class="badge">Featured</span>
{%- endif -%}
```

Similarly for output: `{{-` and `-}}`

```liquid
<p>{{- article.title -}}</p>
```
