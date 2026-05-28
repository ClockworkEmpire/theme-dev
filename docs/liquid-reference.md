# Liquid Reference

Complete reference for Liquid templating in Site Swarm themes.

## Overview

Site Swarm uses [Liquid](https://shopify.github.io/liquid/), a template language created by Shopify. Templates are text files with `.liquid` extension containing a mix of static content and dynamic Liquid code.

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

| Object | Description |
|--------|-------------|
| `site` | Current site information |
| `site_settings` | **Core site settings** (brand, contact, social) - persists across themes |
| `media` | Site's media library (images, files) |
| `settings` | Merged settings (core + theme defaults + overrides) |
| `request` | Current HTTP request info |
| `datasets` | Mounted datasets |
| `authors` | Site authors |
| `posts` | Published blog posts |
| `pages` | Static pages |
| `tags` | Content tags |
| `seo` | SEO metadata with cascading overrides (title, description, canonical, OG, robots) |

### site

Current site information.

| Property | Type | Description |
|----------|------|-------------|
| `site.name` | String | Site display name |
| `site.subdomain` | String | Site subdomain |
| `site.url` | String | Current environment URL |
| `site.staging_url` | String | Staging environment URL |
| `site.production_url` | String | Production environment URL |
| `site.media` | MediaProxy | Access to site's media library |

```liquid
<title>{{ page_title | default: site.name }}</title>
<link rel="canonical" href="{{ site.url }}{{ request.path }}">
```

### site_settings

**Platform-defined core settings** that persist across theme switches. Use this for brand identity, contact info, and social links that should remain constant regardless of which theme is active.

| Property | Type | Description |
|----------|------|-------------|
| `site_settings.brand_name` | String | Business/brand name |
| `site_settings.tagline` | String | Brand tagline or slogan |
| `site_settings.logo_url` | String | Logo image URL |
| `site_settings.email` | String | Contact email |
| `site_settings.phone` | String | Contact phone |
| `site_settings.address_street` | String | Street address |
| `site_settings.address_city` | String | City |
| `site_settings.address_state` | String | State/Province |
| `site_settings.address_zip` | String | ZIP/Postal code |
| `site_settings.address_country` | String | Country |
| `site_settings.facebook_url` | String | Facebook page URL |
| `site_settings.twitter_url` | String | Twitter/X profile URL |
| `site_settings.instagram_url` | String | Instagram profile URL |
| `site_settings.linkedin_url` | String | LinkedIn profile URL |
| `site_settings.youtube_url` | String | YouTube channel URL |

**Example usage:**
```liquid
<header>
  {% if site_settings.logo_url %}
    <img src="{{ site_settings.logo_url }}" alt="{{ site_settings.brand_name }}">
  {% else %}
    <span class="brand-name">{{ site_settings.brand_name }}</span>
  {% endif %}
  <p class="tagline">{{ site_settings.tagline }}</p>
</header>

<footer>
  <address>
    {{ site_settings.address_street }}<br>
    {{ site_settings.address_city }}, {{ site_settings.address_state }} {{ site_settings.address_zip }}
  </address>
  <p>Email: <a href="mailto:{{ site_settings.email }}">{{ site_settings.email }}</a></p>

  {% if site_settings.facebook_url %}
    <a href="{{ site_settings.facebook_url }}">Facebook</a>
  {% endif %}
  {% if site_settings.twitter_url %}
    <a href="{{ site_settings.twitter_url }}">Twitter</a>
  {% endif %}
</footer>
```

**Recommendation:** Use `site_settings.*` for core site data. These values are guaranteed to exist and won't conflict with theme-specific settings. See `settings` below for the merged view.

### media

Top-level access to the site's media library (uploaded images and files). See also [Media Library](../features/media-library.md).

**Access by alias (recommended):**

Media files can have aliases - short, memorable names for cleaner templates:

```liquid
{{ media.hero_banner.url }}
{{ media.logo.url }}
{{ media.background.url }}
```

Aliases are set when uploading or editing media files in the dashboard.

**Access by filename:**
```liquid
{{ media['logo.png'].url }}
{{ media['hero-image.jpg'].url }}
{{ media['Screenshot 2025-12-08 121448.png'].url }}
```

**Access without extension** (tries common image extensions):
```liquid
{{ media.logo.url }}
{{ media.favicon.url }}
```

**Underscore-to-hyphen conversion:**
```liquid
{{ media.hero_image.url }}  {% comment %} Looks for "hero-image.png", etc. {% endcomment %}
```

**Lookup priority:**

When accessing `media.something`, Site Swarm looks for files in this order:
1. Alias match: file with `alias = "something"`
2. Exact filename: file named `something`
3. Filename with extension: `something.png`, `something.jpg`, etc.
4. Hyphenated variant: `something-name` (if using underscores like `something_name`)

**Media file properties:**

| Property | Type | Description |
|----------|------|-------------|
| `url` | String | URL path (e.g., `/media/logo.png`) |
| `filename` | String | File name |
| `alias` | String | Short alias (if set) |
| `content_type` | String | MIME type (e.g., `image/png`) |
| `size` | Integer | File size in bytes |
| `width` | Integer | Image width (images only) |
| `height` | Integer | Image height (images only) |
| `alt` | String | Alt text (if set) |

**Iterate all media files:**
```liquid
{% for file in media %}
  {% if file.image? %}
    <img src="{{ file.url }}" alt="{{ file.alt | default: file.filename }}">
  {% else %}
    <a href="{{ file.url }}">{{ file.filename }}</a>
  {% endif %}
{% endfor %}
```

**Check if file exists:**
```liquid
{% assign logo = media.logo %}
{% if logo %}
  <img src="{{ logo.url }}" alt="{{ logo.alt }}" width="{{ logo.width }}" height="{{ logo.height }}">
{% else %}
  <span class="site-name">{{ site.name }}</span>
{% endif %}
```

**Image variants:**
```liquid
<img src="{{ media.hero.url }}?size=thumbnail" alt="Thumbnail">
<img src="{{ media.hero.url }}?size=large" alt="Large">
<img src="{{ media.hero.url }}?size=800x600" alt="Custom size">
<img src="{{ media.hero.url }}?size=original" alt="Original unoptimized">
```

Available sizes: `thumbnail`, `small`, `medium`, `large`, `xlarge`, `original`, or custom `WxH`.

**Note:** Images are automatically optimized on upload (85% quality, max 2400px). Use the `original` variant to access the uncompressed original file.

### site.media

Legacy access to the site's media library. Identical to the top-level `media` object.

```liquid
{{ site.media.logo.url }}
{{ site.media['hero.png'].url }}
```

**Note:** Prefer using the top-level `media` object for cleaner templates.

### settings

**Merged view** of all settings. Values are merged in this priority (highest wins):
1. **Theme overrides** - Site-specific customizations from the editor
2. **Theme defaults** - Defaults from `config/settings_schema.json`
3. **Core settings** - Values from `site_settings`

Use `settings` for theme-specific values like colors, layout options, and CTAs.

```liquid
{{ settings.primary_color }}        <!-- Theme-specific -->
{{ settings.signup_url }}           <!-- Theme-specific -->
{{ settings.show_newsletter }}      <!-- Theme-specific -->
{{ settings.brand_name }}           <!-- Also works (from core) -->

{% if settings.custom_css %}
  <style>{{ settings.custom_css }}</style>
{% endif %}
```

**When to use `settings` vs `site_settings`:**

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Brand name, logo | `site_settings.brand_name` | Persists across theme switches |
| Contact info | `site_settings.email` | Always available, predictable |
| Social links | `site_settings.facebook_url` | Theme-independent |
| Theme colors | `settings.primary_color` | Theme-specific |
| CTA buttons | `settings.signup_url` | Theme-specific |
| Layout options | `settings.show_sidebar` | Theme-specific |

### request

Current HTTP request information.

| Property | Type | Description |
|----------|------|-------------|
| `request.path` | String | URL path (e.g., `/blog/my-post`) |
| `request.host` | String | Hostname |
| `request.method` | String | HTTP method (GET, POST, etc.) |
| `request.query` | String/nil | Search query string (value of `?q=` parameter) |

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
  {% render 'product-card', product: product %}
{% endfor %}
```

**Methods:**

| Method | Records loaded | Description |
|--------|---------------|-------------|
| `datasets.articles` | Up to 200 | Iterate records (capped at 200) |
| `datasets.articles.size` | 0 (SQL COUNT) | Total record count |
| `datasets.articles.first` | 1 | First record |
| `datasets.articles.last` | 1 | Last record |
| `datasets.articles.empty` | 0 (SQL EXISTS) | True if no records |
| `datasets.articles.all_records` | All | Every record, no cap |

> **Note:** Direct iteration is capped at 200 records for safety. Use `{% paginate datasets.articles by 20 %}` for proper pagination of large datasets, or `datasets.articles.all_records` when you need every record.

Dataset records are Liquid drops with dynamic properties based on your dataset schema:

```liquid
{{ article.title }}
{{ article.slug }}
{{ article.excerpt }}
{{ article.published_at | date: '%B %d, %Y' }}
{{ article.image | img_url: 'large' }}
```

Records may also have an `author` property if one is assigned:

```liquid
{% if article.author %}
  <p class="byline">By {{ article.author.name }}</p>
{% endif %}
```

### authors

Access to all authors attached to the current site. Authors support E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) fields for SEO.

**Access by slug:**
```liquid
{{ authors.jane-smith.name }}
{{ authors.jane-smith.bio }}
{{ authors.jane-smith.job_title }}
{{ authors.jane-smith.organization }}
{{ authors.jane-smith.credentials }}
{{ authors.jane-smith.avatar_url }}
```

**Iterate all site authors:**
```liquid
{% for author in authors %}
  <div class="author-card">
    <img src="{{ author.avatar_url }}" alt="{{ author.name }}">
    <h3>{{ author.name }}</h3>
    <p>{{ author.job_title }}, {{ author.organization }}</p>
    <p>{{ author.bio }}</p>
  </div>
{% endfor %}
```

| Property | Type | Description |
|----------|------|-------------|
| `author.id` | String | Prefix ID (e.g., `author_abc123`) |
| `author.name` | String | Full name |
| `author.slug` | String | URL-friendly identifier |
| `author.bio` | String | Biography text |
| `author.email` | String | Contact email |
| `author.website_url` | String | Personal website |
| `author.job_title` | String | Professional title (E-E-A-T) |
| `author.organization` | String | Company/organization (E-E-A-T) |
| `author.credentials` | String | Degrees, certifications (E-E-A-T) |
| `author.avatar_url` | String | Avatar image URL |
| `author.social_links` | Object | Social media handles |

**Schema.org Person markup:**
```liquid
{% if article.author %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "{{ article.author.name }}",
    "jobTitle": "{{ article.author.job_title }}",
    "worksFor": {
      "@type": "Organization",
      "name": "{{ article.author.organization }}"
    }
  }
}
</script>
{% endif %}
```

### posts

Access to all published blog posts for the current site.

**Access by slug:**
```liquid
{{ posts.getting-started.title }}
{{ posts.getting-started.excerpt }}
{{ posts.getting-started.published_at | date: '%B %d, %Y' }}
```

**Iterate all posts (newest first):**
```liquid
{% for post in posts %}
  <article>
    <h2><a href="/blog/{{ post.slug }}">{{ post.title }}</a></h2>
    <p class="meta">{{ post.published_at | date: '%B %d, %Y' }}</p>
    <p>{{ post.excerpt }}</p>
  </article>
{% endfor %}
```

**Get recent posts:**
```liquid
{% for post in posts.recent limit: 5 %}
  <li><a href="/blog/{{ post.slug }}">{{ post.title }}</a></li>
{% endfor %}
```

| Property | Type | Description |
|----------|------|-------------|
| `post.id` | String | Prefix ID (e.g., `post_abc123`) |
| `post.title` | String | Post title |
| `post.slug` | String | URL-friendly identifier |
| `post.url` | String | Full URL path (e.g., `/blog/my-post`) |
| `post.excerpt` | String | Short summary |
| `post.content` | String | Full rich text content |
| `post.published_at` | DateTime | Publication date |
| `post.author` | Object | Author object (if assigned) |
| `post.tags` | Array | Array of tag objects |
| `post.schema_type` | String | Schema.org type (BlogPosting, Article, etc.) |

**Post with tags:**
```liquid
{% for tag in post.tags %}
  <a href="/tags/{{ tag.slug }}" class="tag">{{ tag.name }}</a>
{% endfor %}
```

### pages

Access to all static pages for the current site, ordered by position.

**Access by slug:**
```liquid
{{ pages.about.title }}
{{ pages.about.content }}
{{ pages.contact.title }}
```

**Iterate all pages (for navigation):**
```liquid
<nav>
  {% for page in pages %}
    <a href="{{ page.url }}"
       {% if request.path == page.url %}class="active"{% endif %}>
      {{ page.title }}
    </a>
  {% endfor %}
</nav>
```

| Property | Type | Description |
|----------|------|-------------|
| `page.id` | String | Prefix ID (e.g., `page_abc123`) |
| `page.title` | String | Page title |
| `page.slug` | String | URL-friendly identifier |
| `page.url` | String | Full URL path (e.g., `/about`) |
| `page.content` | String | Full rich text content |
| `page.position` | Integer | Sort order for navigation |
| `page.author` | Object | Author object (if assigned) |
| `page.schema_type` | String | Schema.org type (WebPage, AboutPage, etc.) |

### tags

Access to all tags for the current site.

**Access by slug:**
```liquid
{{ tags.ruby.name }}
{{ tags.javascript.slug }}
```

**Iterate all tags:**
```liquid
<div class="tag-cloud">
  {% for tag in tags %}
    <a href="/tags/{{ tag.slug }}">{{ tag.name }}</a>
  {% endfor %}
</div>
```

| Property | Type | Description |
|----------|------|-------------|
| `tag.name` | String | Tag display name |
| `tag.slug` | String | URL-friendly identifier |
| `tag.url` | String | Full URL path (e.g., `/tags/ruby`) |

### seo

SEO metadata object with a 5-level override cascade. See [SEO Metadata](seo-metadata.md) for the full guide.

**Zero-effort approach** — renders all meta, OG, and Twitter tags:
```liquid
<head>
  {{ seo.meta_tags }}
</head>
```

**Granular control:**
```liquid
<title>{{ seo.title }}</title>
<meta name="description" content="{{ seo.description }}">
<link rel="canonical" href="{{ seo.canonical_url }}">
<meta property="og:image" content="{{ seo.og_image }}">
```

| Property | Type | Description |
|----------|------|-------------|
| `seo.title` | String | Page title (cascaded from record → template settings → title template → site name) |
| `seo.description` | String | Meta description (cascaded from record → template settings → description template → tagline) |
| `seo.canonical_url` | String | Canonical URL (pre-computed: `site.url + request.path`, no query strings) |
| `seo.og_image` | String | Open Graph image URL (from record → template settings → site default) |
| `seo.og_type` | String | Open Graph type (`"article"` for posts, `"website"` otherwise) |
| `seo.robots` | String | Robots directive (e.g., `"noindex"`) or nil (= index) |
| `seo.allow_indexing` | Boolean | Whether the site allows search engine indexing |
| `seo.meta_tags` | String | Renders ALL meta/OG/Twitter tags as one HTML block |

**Override cascade (highest → lowest):**
1. Record-level field (e.g., `record.seo_title`)
2. Template settings (customizer per-page override)
3. Title/description template (site SEO defaults with Liquid variables)
4. Site defaults (site name, tagline)
5. System fallback

### post (contextual)

Available in `templates/post.liquid` when rendering an individual blog post. Contains the current post data.

```liquid
{% comment %} templates/post.liquid {% endcomment %}
<article>
  <h1>{{ post.title }}</h1>
  <p class="meta">
    Published {{ post.published_at | date: '%B %d, %Y' }}
    {% if post.author %}by {{ post.author.name }}{% endif %}
  </p>
  <div class="content">{{ post.content }}</div>
</article>
```

### page (contextual)

Available in `templates/page.liquid` when rendering an individual static page. Contains the current page data.

```liquid
{% comment %} templates/page.liquid {% endcomment %}
<article class="page">
  <h1>{{ page.title }}</h1>
  <div class="content">{{ page.content }}</div>
</article>
```

### current_tag (contextual)

Available when viewing `/tags/:tag` URLs. Contains the current tag being filtered.

```liquid
<h1>Posts tagged "{{ current_tag }}"</h1>
{% for post in posts %}
  {% render 'post-card', post: post %}
{% endfor %}
```

### search (contextual)

Available in `templates/search.liquid` when a search query is active (`/search?q=...`). Contains search results and metadata.

| Property | Type | Description |
|----------|------|-------------|
| `search.query` | String | The search query string |
| `search.results` | Array | Matching records for the current page |
| `search.total` | Integer | Total number of matches across all datasets |

Each result in `search.results` is a dataset record with additional metadata:

| Property | Type | Description |
|----------|------|-------------|
| `result._item_url` | String | URL path to the record (e.g., `/articles/hello-world`) |
| `result._dataset_alias` | String | Dataset alias (e.g., `articles`) |
| `result._mount_path` | String | Dataset mount path (e.g., `/articles`) |

Standard `pagination` is also available on search pages (same shape as collection pages).

```liquid
{% for result in search.results %}
  <article>
    <h3><a href="{{ result._item_url }}">{{ result.title | default: result.name }}</a></h3>
    <p>{{ result.excerpt | default: result.body | truncate_words: 30 }}</p>
    <small>{{ result._dataset_alias | capitalize }}</small>
  </article>
{% else %}
  <p>No results found for "{{ search.query }}".</p>
{% endfor %}
```

See [Search](search.md) for the full guide including forms, styling, and best practices.

### collection

Available on dataset list pages (e.g., `/blog`). Contains the paginated array of records for the current page.

```liquid
{% for article in collection %}
  {% render 'article-card', article: article %}
{% else %}
  <p>No articles found.</p>
{% endfor %}
```

### pagination

Available on dataset list pages (auto-supplied by the controller) and inside `{% paginate %}` blocks. Contains pagination metadata.

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current_page` | Integer | Current page number (1-indexed) |
| `pagination.total_pages` | Integer | Total number of pages |
| `pagination.total_count` | Integer | Total number of records |
| `pagination.per_page` | Integer | Records per page |
| `pagination.next_url` | String/nil | URL to next page, or nil |
| `pagination.prev_url` | String/nil | URL to previous page, or nil |
| `pagination.parts` | Array | Pre-computed page links with URLs, ellipsis, and current-page flags |

**`pagination.parts`** is an array of objects, each with:

| Property | Type | Description |
|----------|------|-------------|
| `part.title` | String | Page number (e.g., "3") or ellipsis ("…") |
| `part.url` | String/nil | Page URL, nil for current page and ellipsis |
| `part.is_link` | Boolean | `true` if this part should be a clickable link |
| `part.is_current` | Boolean | `true` if this is the current page |

**Recommended pagination snippet using `parts`:**

```liquid
{% if pagination.total_pages > 1 %}
<nav class="pagination">
  {% if pagination.prev_url %}
    <a href="{{ pagination.prev_url }}">&lsaquo;</a>
  {% endif %}
  {% for part in pagination.parts %}
    {% if part.is_current %}
      <span class="active">{{ part.title }}</span>
    {% elsif part.is_link %}
      <a href="{{ part.url }}">{{ part.title }}</a>
    {% else %}
      <span class="ellipsis">&hellip;</span>
    {% endif %}
  {% endfor %}
  {% if pagination.next_url %}
    <a href="{{ pagination.next_url }}">&rsaquo;</a>
  {% endif %}
</nav>
{% endif %}
```

### {% paginate %} tag

Universal pagination block tag that works with any collection in any template. Use this when you need pagination outside of mounted dataset collection pages (e.g., parameterized routes, templates using `datasets.*` globals).

**Syntax:** `{% paginate <collection> by <number> [as <variable>] %}`

The tag reads the current page from `?page=N` query parameter. For dataset proxies, it uses efficient DB offset/limit queries. For arrays (e.g., results of `| where:` filters), it slices in memory.

```liquid
{% paginate datasets.businesses by 12 %}
  {% for business in paginate.collection %}
    <h2>{{ business.name }}</h2>
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

**With `as` alias** for cleaner variable names:

```liquid
{% paginate datasets.articles by 10 as articles %}
  {% for article in articles %}
    <h2>{{ article.title }}</h2>
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

Inside the block, two objects are available:

| Object | Description |
|--------|-------------|
| `paginate.collection` | The current page's items |
| `paginate.current_page` | Current page number |
| `paginate.total_pages` | Total pages |
| `paginate.total_count` | Total items across all pages |
| `paginate.per_page` | Items per page |
| `paginate.prev_url` | Previous page URL (nil on page 1) |
| `paginate.next_url` | Next page URL (nil on last page) |
| `paginate.parts` | Pre-computed page links array |
| `pagination.*` | Same fields as `paginate` (backward compat) |

### dataset

Available on dataset item pages. Contains information about the matched dataset.

| Property | Type | Description |
|----------|------|-------------|
| `dataset.alias` | String | Dataset alias (e.g., `services`) |
| `dataset.slug_field` | String | Field used for URL slugs (e.g., `slug`) |
| `dataset.item_template` | String | Template name (e.g., `service`) |

```liquid
<nav aria-label="breadcrumb">
  <a href="/">Home</a> /
  <a href="/services">Services</a>
  {% if service %}
    / {{ service.title }}
  {% endif %}
</nav>
```

**Note:** URL routing uses fallthrough slug resolution. URLs like `/tree-removal` are resolved by checking each dataset alphabetically by alias for a matching slug.

### route_params

Available when a template is rendered via a parameterized route pattern (defined with `{% routes %}`). Contains all captured URL parameters.

```liquid
{% routes %}
/companies/:city/:state/:slug
{% endroutes %}

<!-- Access via route_params object -->
{{ route_params.city }}
{{ route_params.state }}
{{ route_params.slug }}

<!-- Or directly as top-level variables -->
{{ city }}
{{ state }}
{{ slug }}
```

Use route params to filter datasets or customize content:

```liquid
{% assign company = datasets.companies | where: 'slug', route_params.slug | first %}
{% if company %}
  <h1>{{ company.name }}</h1>
  <p>Located in {{ route_params.city }}, {{ route_params.state }}</p>
{% else %}
  <p>Company not found.</p>
{% endif %}
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
| `section.blocks` | Array | Array of block objects |

```liquid
<!-- sections/hero.liquid -->
<section id="{{ section.id }}" class="hero">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
</section>
```

### snippet

Available inside snippet templates. Contains snippet metadata and settings.

| Property | Type | Description |
|----------|------|-------------|
| `snippet.id` | String | Unique snippet identifier |
| `snippet.name` | String | Snippet file name |
| `snippet.settings` | Object | Snippet settings values |
| `snippet.blocks` | Array | Array of block objects |

```liquid
<!-- snippets/card.liquid -->
<div id="{{ snippet.id }}" class="card">
  <h3>{{ snippet.settings.title }}</h3>
</div>
```

### template (context object)

Available inside template files rendered via `{% template %}` tag. Contains template metadata and settings.

| Property | Type | Description |
|----------|------|-------------|
| `template.id` | String | Unique template identifier |
| `template.settings` | Object | Template settings values |

```liquid
<!-- templates/about.liquid -->
<main>
  <h1>{{ template.settings.heading }}</h1>
</main>
```

---

## Custom Tags

Site Swarm provides custom Liquid tags for theme functionality.

### section

Renders a section from the `sections/` directory with its settings applied.

```liquid
{% section 'header' %}
{% section 'hero' %}
{% section 'featured-products' %}
{% section 'footer' %}
```

The section tag loads the section file, merges its schema defaults with site-specific settings, and renders the content with `section.settings` available.

### render

Renders a snippet from the `snippets/` directory. This is an enhanced version of Liquid's built-in `render` that passes the full parent context into the snippet.

**Basic usage:**
```liquid
{% render 'icon' %}
{% render 'social-links' %}
```

**With variables:**
```liquid
{% render 'article-card', article: post %}
{% render 'product-card', product: item, show_price: true %}
{% render 'button', text: 'Buy Now', url: product.url, style: 'primary' %}
```

**Collection iteration:**
```liquid
{% render 'article-card' for articles as article %}
{% render 'product-card' for featured_products as product %}
```

This is equivalent to:
```liquid
{% for article in articles %}
  {% render 'article-card', article: article %}
{% endfor %}
```

**Context propagation:**

Unlike standard Liquid's `render` (which uses isolated scope), Site Swarm's `render` passes the full parent context into the snippet. All parent variables and global objects (`site`, `settings`, `request`, `datasets`, `mount`, etc.) are available. Explicitly passed variables override parent values with the same name:

```liquid
{% assign featured = true %}
{% render 'card' %}  <!-- 'featured' IS available from parent context -->
{% render 'card', featured: false %}  <!-- overrides parent's value -->
```

**Best practice:** Explicitly pass variables even though parent context is available — it documents dependencies and makes templates easier to understand.

### snippet

Renders a snippet from the `snippets/` directory. Functionally equivalent to `render` but scoped specifically to `snippets/`.

```liquid
{% snippet 'card' %}
{% snippet 'card', article: post %}
{% snippet 'card' for articles as article %}
```

The snippet tag supports the full settings chain, variable passing, collection iteration, and blocks. Inside the snippet, the `snippet` context object is available with `snippet.settings`, `snippet.blocks`, and `snippet.name`.

### template

Renders a page template from the `templates/` directory. Supports the settings chain and variable passing but does **not** support blocks.

```liquid
{% template 'about' %}
{% template 'landing', campaign: 'summer' %}
```

Inside the rendered template, the `template` context object provides `template.settings`.

### schema

**Deprecated** - use sidecar JSON files in `config/sections/` instead. Inline `{% schema %}` blocks are still supported for backward compatibility.

Defines configurable settings for a section. Renders nothing - it's metadata only.

**Recommended: Sidecar JSON** (`config/sections/hero.json`)
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
    },
    {
      "type": "image_picker",
      "id": "background_image",
      "label": "Background Image"
    }
  ]
}
```

See [Components](components.md) for full schema documentation.

### routes

Defines parameterized URL patterns for a template. Only valid in template files. Renders nothing - it's metadata only.

```liquid
{% routes %}
/companies/:city/:state/:slug
/companies/:slug
{% endroutes %}
```

**Pattern syntax:**
- Static segments match exactly: `/companies` matches "companies"
- Dynamic segments start with `:` and capture values: `:slug` captures "acme-corp"
- Multiple patterns per template are supported
- More specific patterns (more segments, more static parts) are matched first

**Accessing route parameters:**

Parameters are available both as top-level variables and via the `route_params` object:

```liquid
{% routes %}
/companies/:city/:state/:slug
{% endroutes %}

<!-- Both access styles work -->
<h1>Companies in {{ city }}, {{ state }}</h1>
<h1>Companies in {{ route_params.city }}, {{ route_params.state }}</h1>

<!-- Use params to fetch data -->
{% assign company = datasets.companies | where: 'slug', slug | first %}
<h2>{{ company.name }}</h2>
```

**Example — location-based filtering:**
```liquid
{% routes %}
/properties/:city/:neighborhood
/properties/:city
{% endroutes %}

<h1>Properties in {{ city }}{% if neighborhood %}, {{ neighborhood }}{% endif %}</h1>
{% assign results = datasets.properties | where: 'city', city %}
```

**Specificity:** Routes with more segments and more static parts are matched first. See [Content and Routing](content-and-routing.md) for the full URL resolution algorithm.

### dropin

Renders a drop-in content block. Drop-ins support theme-provided defaults that site owners can override.

**Basic usage:**
```liquid
{% dropin 'footer-disclaimer' %}
{% dropin 'contact-info' %}
{% dropin 'promo-banner' %}
```

**Resolution order:**

1. **User content** - Site-specific drop-in (database)
2. **User content** - Account-wide drop-in (database)
3. **Theme default** - `dropins/{name}.liquid` file in theme
4. **Empty string** - If none exist

**Theme defaults:**

Provide defaults in the `dropins/` folder. These support full Liquid:

```liquid
<!-- dropins/promo-banner.liquid -->
<div class="promo" style="background: {{ settings.primary_color }}">
  <p>{{ settings.promo_text | default: 'Check out our offers!' }}</p>
  <a href="{{ settings.promo_link | default: '/about' }}">Learn More</a>
</div>
```

Available in theme defaults: `settings`, `site`, all Liquid filters.

**User content overrides:**

When site owners create drop-ins via the dashboard, they override theme defaults. User content is plain HTML (no Liquid processing).

**Inline fallback (legacy):**

For fallbacks without a `dropins/` file, use `capture`:
```liquid
{% capture content %}{% dropin 'contact-info' %}{% endcapture %}
{{ content | default: 'Contact us at info@example.com' }}
```

**Cascading scope (user content):**

User drop-ins support two levels:
- **Account-wide** - Shared across all sites in the account
- **Site-specific** - Overrides account-wide for that site

### json_ld

Generates Schema.org JSON-LD structured data for SEO. Automatically detects the current content type (post, page, or dataset record) and outputs appropriate markup.

**Basic usage:**
```liquid
{% json_ld %}
```

**In a post template:**
```liquid
{% comment %} templates/post.liquid {% endcomment %}
<!DOCTYPE html>
<html>
<head>
  <title>{{ post.title }} | {{ site.name }}</title>
  {% json_ld %}
</head>
```

Output (for BlogPosting):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Getting Started with Rails",
  "datePublished": "2025-01-15T10:30:00Z",
  "dateModified": "2025-01-16T14:20:00Z",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "jobTitle": "Senior Developer"
  }
}
</script>
```

**In a page template:**
```liquid
{% comment %} templates/page.liquid {% endcomment %}
<head>
  {% json_ld %}
</head>
```

Output (for WebPage, AboutPage, ContactPage, or FAQPage):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Us",
  "url": "/about",
  "dateModified": "2025-01-10T08:00:00Z"
}
</script>
```

**Supported types:**

| Context | Schema Type | Source |
|---------|-------------|--------|
| Post | BlogPosting, Article, NewsArticle | `post.schema_type` |
| Page | WebPage, AboutPage, ContactPage, FAQPage | `page.schema_type` |
| Dataset Record | Article (default) | Article schema |

The tag automatically includes author information when available, using E-E-A-T fields (name, job title, organization) from the Author model.

---

## Custom Filters

Site Swarm provides custom filters for common theme operations.

### asset_url

Generates a URL for a theme asset in the `assets/` directory.

```liquid
{{ 'theme.css' | asset_url }}
{{ 'app.js' | asset_url }}
{{ 'logo.png' | asset_url }}
```

Output depends on storage configuration (local path or CDN URL).

**Theme asset images support variants** (same as media library):

```liquid
<!-- Direct URL with query param -->
<img src="{{ 'logo.png' | asset_url }}?size=large">

<!-- Or use filename variant pattern -->
<img src="/assets/logo-large.png">
<img src="/assets/hero-800x600.jpg">
```

Available sizes: `thumbnail`, `small`, `medium`, `large`, `xlarge`, or custom `WxH`.

Non-image assets (CSS, JS, fonts) ignore variant parameters.

### img_url

Generates a sized image URL. Works with:
1. **Media library files** - Looks up by filename in site's media library
2. **Dataset attachment filenames** - Resolves via current dataset context
3. **Theme assets** - Falls back to theme asset lookup
4. **External URLs** - Passes through unchanged
5. **ActiveStorage blobs** - Generates Rails variant URLs

**Media library files:**
```liquid
{{ "logo.png" | img_url }}                 <!-- /media/logo.png -->
{{ "hero.jpg" | img_url: 'large' }}        <!-- /media/hero.jpg?size=large -->
{{ "banner.png" | img_url: '800x400' }}    <!-- /media/banner.png?size=800x400 -->
```

**Dataset image fields:**
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

**External URLs** (passed through unchanged):
```liquid
{{ "https://example.com/image.jpg" | img_url: 'large' }}
<!-- Output: https://example.com/image.jpg -->
```

**Theme assets:**
```liquid
{{ "logo.png" | img_url: 'large' }}        <!-- /assets/logo.png?size=large -->
{{ "hero.jpg" | img_url: '800x400' }}      <!-- /assets/hero.jpg?size=800x400 -->
```

Theme assets are used as a fallback when no media library file or dataset attachment matches.

**Resolution order:**
1. External URLs (http://, https://) - passed through
2. Absolute paths (/) - passed through
3. ActiveStorage blobs - variant URLs generated
4. Media library files - looked up by filename
5. Dataset attachments - resolved via context
6. Theme assets - fallback lookup in `assets/` directory

### Choosing Between `asset_url` and `img_url`

These two filters serve different purposes. Using the wrong one is a common source of broken images.

| Use Case | Correct Filter | Example |
|----------|---------------|---------|
| Theme CSS/JS files | `asset_url` | `{{ 'theme.css' \| asset_url }}` |
| Theme fonts | `asset_url` | `{{ 'Inter.woff2' \| asset_url }}` |
| Static images baked into the theme | `asset_url` | `{{ 'logo.svg' \| asset_url }}` |
| Dataset record images (articles, products, services) | `img_url` | `{{ article.image \| img_url: 'medium' }}` |
| Media library uploads | `img_url` | `{{ "hero.jpg" \| img_url: 'large' }}` |
| Settings image picker values | `img_url` | `{{ settings.logo \| img_url }}` |
| External image URLs | `img_url` | `{{ "https://cdn.com/photo.jpg" \| img_url }}` |

**Rule of thumb:** `asset_url` is for files that ship with your theme (`assets/` directory). `img_url` is for any image that comes from user content — dataset fields, media uploads, or settings.

> **Common mistake:** Using `asset_url` on a dataset image field like `{{ service.image | asset_url }}`. This will fail because `asset_url` looks for a file in the theme's `assets/` directory, not in the site's uploaded content. Use `{{ service.image | img_url }}` instead.

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

### count_where

Counts records matching a field/value pair. When applied to a dataset proxy, uses SQL `COUNT` for efficiency (loads zero records). When applied to a plain array, filters and counts in memory.

```liquid
{{ datasets.businesses | count_where: 'category_slug', 'restaurants' }}
<!-- => 142 (SQL COUNT, no records loaded) -->

{% assign active = datasets.users | where: 'status', 'active' %}
{{ active | count_where: 'role', 'admin' }}
<!-- => 3 (in-memory count on pre-filtered array) -->
```

This is much more efficient than the verbose alternative for counting:
```liquid
<!-- SLOW: loads all records, filters in Ruby, then counts -->
{% assign count = datasets.businesses | where: 'category_slug', 'restaurants' | size %}

<!-- FAST: single SQL COUNT query -->
{{ datasets.businesses | count_where: 'category_slug', 'restaurants' }}
```

### slugify

Converts a string to a URL-friendly slug.

```liquid
{{ 'Hello World!' | slugify }}        <!-- hello-world -->
{{ article.title | slugify }}         <!-- my-article-title -->
```

### parse_liquid

Parses and renders a string containing Liquid syntax within the current template context. Useful for rendering dynamic content stored in dataset fields or settings that itself contains Liquid variables.

```liquid
{{ record.body | parse_liquid }}
```

If `record.body` contains `"Call us at {{ settings.phone }}"`, the output is:
```
Call us at 555-1234
```

Works with any Liquid syntax including filters:

```liquid
{{ record.intro | parse_liquid }}
{%- comment -%} If intro = "Welcome, {{ customer.name | upcase }}!" → "Welcome, ALICE!" {%- endcomment -%}
```

Common use: richtext fields where the admin pastes Liquid expressions into the WYSIWYG body for site-wide values like phone, brand name, location.

```liquid
<div class="my-prose">{{ service.additional_content | parse_liquid }}</div>
```

Returns an empty string for nil/blank input. Syntax errors are shown as inline error messages in development mode.

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

Site Swarm uses standard [Liquid](https://shopify.github.io/liquid/) syntax. Quick reference below; see the [Cheat Sheet](cheat-sheet.md) for more examples.

### Control Flow

```liquid
{% if article.featured %}
  <span>Featured</span>
{% elsif article.new %}
  <span>New</span>
{% else %}
  <!-- Regular -->
{% endif %}

{% unless article.draft %}...{% endunless %}

{% case article.category %}
  {% when 'news' %}News
  {% when 'tutorial' %}Tutorial
  {% else %}{{ article.category }}
{% endcase %}
```

### Iteration

```liquid
{% for article in collection %}
  {{ article.title }}
{% else %}
  <p>No articles found.</p>
{% endfor %}

{% for article in datasets.articles limit: 3 offset: 2 %}...{% endfor %}
{% for article in collection reversed %}...{% endfor %}
```

**forloop properties:** `index` (1-based), `index0` (0-based), `first`, `last`, `length`, `rindex`

**Flow control:** `{% break %}` to exit loop, `{% continue %}` to skip iteration.

### Variables

```liquid
{% assign featured = datasets.articles | where: 'featured', true %}
{% capture name %}{{ first }} {{ last }}{% endcapture %}
{% comment %}Not rendered{% endcomment %}
{% raw %}This {{ is not }} processed{% endraw %}
```

**assign_global** (Site Swarm extension) — sets a variable accessible in the parent layout:

```liquid
{% assign_global page_title = "Tree Removal - Box Tree Care" %}
```

**Important:** Regular `assign` variables are template-scoped and NOT accessible in the layout. Use `assign_global` for page titles, descriptions, and other layout-level data.

---

## Standard Liquid Filters

Standard Liquid filters are fully supported. See the [Cheat Sheet](cheat-sheet.md) for commonly used filters, or the [Liquid docs](https://shopify.github.io/liquid/filters/) for the complete list.

### Most Used

```liquid
{{ string | upcase }}                            <!-- HELLO -->
{{ string | downcase }}                          <!-- hello -->
{{ string | capitalize }}                        <!-- Hello world -->
{{ string | strip }}                             <!-- trim whitespace -->
{{ string | truncate: 100 }}                     <!-- Truncate characters -->
{{ string | replace: 'old', 'new' }}             <!-- Replace text -->
{{ string | split: ',' }}                        <!-- String to array -->
{{ '<p>hi</p>' | strip_html }}                   <!-- hi -->
```

### Arrays

```liquid
{{ collection | size }}                          <!-- 10 -->
{{ collection | first }}                         <!-- First item -->
{{ collection | map: 'title' | join: ', ' }}     <!-- Title 1, Title 2 -->
{{ collection | where: 'featured', true }}       <!-- Filtered array -->
{{ collection | sort: 'date' | reverse }}        <!-- Sorted, newest first -->
```

Other array filters: `last`, `uniq`, `compact`, `concat`, `sort_natural`

> **Important:** Filters like `| sort:` and `| where:` **cannot** be used inline inside `{% for %}` tags. This is invalid Liquid:
>
> ```liquid
> <!-- WRONG — causes syntax error -->
> {% for item in collection | sort: 'date' %}
> ```
>
> Instead, assign the filtered result first:
>
> ```liquid
> {% assign sorted = collection | sort: 'date' %}
> {% for item in sorted %}
>   {{ item.title }}
> {% endfor %}
> ```

### Math

```liquid
{{ 4 | plus: 2 }}        <!-- 6 -->
{{ 4 | minus: 2 }}       <!-- 2 -->
{{ 4 | times: 2 }}       <!-- 8 -->
{{ 10 | divided_by: 3 }} <!-- 3 -->
{{ 10 | modulo: 3 }}     <!-- 1 -->
{{ 4.7 | floor }}        <!-- 4 -->
{{ 4.2 | ceil }}         <!-- 5 -->
```

### Other

```liquid
{{ title | default: 'Untitled' }}    <!-- Fallback value -->
{{ object | json }}                  <!-- Convert to JSON -->

---

## Operators and Truthiness

**Comparison:** `==`, `!=`, `>`, `<`, `>=`, `<=`

**Logical:** `and`, `or`, `contains`

```liquid
{% if article.featured and article.published %}...{% endif %}
{% if article.title contains 'Guide' %}...{% endif %}
```

**Falsy values:** `false`, `nil`/`null`, empty string `""`

**Everything else is truthy**, including `0`, `[]`, and `{}`.

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
