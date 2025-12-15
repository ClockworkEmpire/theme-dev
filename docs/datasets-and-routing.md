# Datasets and Routing

Work with dynamic content and understand how URLs map to templates.

---

## Overview

HostNet sites connect to **datasets** - collections of structured content like articles, products, or team members. Datasets are:

- Defined by site owners in the HostNet dashboard
- Mounted to URL paths (e.g., `/blog`, `/products`)
- Accessible in templates via the `datasets` object

Your theme doesn't define what data exists - it renders whatever datasets the site owner has configured.

---

## URL Routing

### Routing Priority

When a request comes in, HostNet resolves URLs in this order:

1. **Exact template match** - `/about` → `templates/about.liquid`
2. **Parameterized route patterns** - `/companies/seattle/wa/acme` → template with matching `{% routes %}` block
3. **Dataset list page** - `/blog` → `templates/collection.liquid`
4. **Dataset item page** - `/blog/my-post` → `templates/article.liquid`
5. **404 page** - `templates/404.liquid`

### Template Matching

Static pages use exact template name matching:

| URL | Template |
|-----|----------|
| `/` | `templates/index.liquid` |
| `/about` | `templates/about.liquid` |
| `/contact` | `templates/contact.liquid` |
| `/pricing` | `templates/pricing.liquid` |

If `templates/about.liquid` exists, the URL `/about` renders that template.

### Dataset Mount Points

Site owners mount datasets to URL paths. For example:

| Dataset | Mount Path | List Template | Item Template |
|---------|------------|---------------|---------------|
| Articles | `/blog` | `collection.liquid` | `article.liquid` |
| Products | `/products` | `collection.liquid` | `product.liquid` |
| Team | `/team` | `collection.liquid` | `member.liquid` |

This configuration determines:
- `/blog` → collection page showing articles
- `/blog/my-first-post` → single article page
- `/products` → collection page showing products
- `/products/widget-pro` → single product page

---

## Parameterized Route Patterns

Templates can define custom URL patterns that capture dynamic segments. This is useful for:
- Location-based pages (e.g., `/properties/seattle/downtown`)
- Category filtering (e.g., `/products/electronics/phones`)
- Custom record lookups (e.g., `/companies/acme-corp`)

### Defining Routes

Use the `{% routes %}` block at the top of a template to define URL patterns:

```liquid
{% routes %}
/companies/:city/:state/:slug
/companies/:slug
{% endroutes %}

<h1>{{ company.name }}</h1>
```

**Pattern syntax:**
- Static segments match exactly: `/companies` matches "companies"
- Dynamic segments start with `:` and capture URL values: `:slug` captures any value in that position
- Multiple patterns per template are supported (one per line)

### Accessing Captured Parameters

Parameters captured from the URL are available in two ways:

**1. As top-level variables:**
```liquid
{{ city }}
{{ state }}
{{ slug }}
```

**2. Via the `route_params` object:**
```liquid
{{ route_params.city }}
{{ route_params.state }}
{{ route_params.slug }}
```

Both approaches are equivalent. Use whichever is clearer in context.

### Pattern Specificity

When multiple patterns could match a URL, the most specific pattern wins. Specificity is calculated by:

1. **Number of segments** - More segments = higher priority
2. **Static vs dynamic** - Static segments score higher than dynamic ones
3. **Position** - Earlier segments are weighted more heavily

Example: For URL `/companies/seattle/wa/acme`:
- `/companies/:city/:state/:slug` (4 segments, 1 static) - **wins**
- `/companies/:slug` (2 segments) - lower priority

### Real-World Examples

**Location-based business directory:**
```liquid
{% routes %}
/businesses/:city/:category
/businesses/:city
{% endroutes %}

<h1>
  {% if category %}
    {{ category | capitalize }} in {{ city | capitalize }}
  {% else %}
    Businesses in {{ city | capitalize }}
  {% endif %}
</h1>

{% for business in datasets.businesses %}
  {% if business.city == city %}
    {% if category == blank or business.category == category %}
      {% hostnet_render 'business-card', business: business %}
    {% endif %}
  {% endif %}
{% endfor %}
```

**Product category pages:**
```liquid
{% routes %}
/shop/:category/:subcategory
/shop/:category
{% endroutes %}

<nav class="breadcrumb">
  <a href="/">Home</a> /
  <a href="/shop/{{ category }}">{{ category | capitalize }}</a>
  {% if subcategory %}
    / {{ subcategory | capitalize }}
  {% endif %}
</nav>

<div class="product-grid">
  {% for product in datasets.products %}
    {% if product.category == category %}
      {% if subcategory == blank or product.subcategory == subcategory %}
        {% hostnet_render 'product-card', product: product %}
      {% endif %}
    {% endif %}
  {% endfor %}
</div>
```

**Custom record lookup:**
```liquid
{% routes %}
/team/:slug
{% endroutes %}

{% assign member = datasets.team | where: 'slug', slug | first %}

{% if member %}
  <article class="team-member">
    <h1>{{ member.name }}</h1>
    <p class="title">{{ member.title }}</p>
    <div class="bio">{{ member.bio }}</div>
  </article>
{% else %}
  <p>Team member not found.</p>
{% endif %}
```

### When to Use Parameterized Routes vs Dataset Mounts

| Use Case | Solution |
|----------|----------|
| Standard blog/articles | Dataset mount (automatic list + item pages) |
| Product catalog with categories | Parameterized routes for category filtering |
| Location-based directory | Parameterized routes for location segments |
| Simple record detail pages | Dataset mount item pages |
| Complex multi-segment URLs | Parameterized routes |

**Key difference:** Dataset mounts automatically handle list/item pages with pagination. Parameterized routes give you full control but require manual data fetching.

---

## The datasets Object

Access all mounted datasets in any template:

```liquid
{% for article in datasets.articles %}
  {{ article.title }}
{% endfor %}

{% for product in datasets.products %}
  {{ product.name }}
{% endfor %}
```

The alias (e.g., `articles`, `products`) is configured by the site owner when mounting the dataset.

### Lazy Loading

Datasets are loaded lazily - data is only fetched when accessed. This means you can reference multiple datasets without performance penalty if some aren't used on a particular page.

### Available Methods

| Method | Description |
|--------|-------------|
| `datasets.articles` | Access records |
| `datasets.articles.size` | Count of records |
| `datasets.articles.first` | First record |
| `datasets.articles.last` | Last record |

```liquid
{% if datasets.articles.size > 0 %}
  <h2>We have {{ datasets.articles.size }} articles</h2>
{% endif %}

{{ datasets.articles.first.title }}
```

---

## Collection Pages

Collection pages display lists of dataset records. Use `templates/collection.liquid`.

### Available Objects

| Object | Description |
|--------|-------------|
| `collection` | Paginated array of records for current page |
| `pagination` | Pagination metadata |
| `mount` | Dataset mount configuration |

### Basic Collection Template

```liquid
<div class="container">
  <h1>{{ mount.alias | capitalize }}</h1>

  <div class="grid">
    {% for item in collection %}
      {% hostnet_render 'card', item: item %}
    {% else %}
      <p>No items found.</p>
    {% endfor %}
  </div>

  {% if pagination.total_pages > 1 %}
    {% hostnet_render 'pagination' %}
  {% endif %}
</div>
```

### The mount Object

Information about the dataset mount configuration:

| Property | Description | Example |
|----------|-------------|---------|
| `mount.alias` | Dataset alias | `articles` |
| `mount.mount_path` | URL mount point | `/blog` |
| `mount.slug_field` | Field used for URLs | `slug` |
| `mount.items_per_page` | Records per page | `10` |

```liquid
<nav aria-label="Breadcrumb">
  <a href="/">Home</a> /
  <a href="{{ mount.mount_path }}">{{ mount.alias | capitalize }}</a>
</nav>
```

### Pagination

The `pagination` object provides page navigation info:

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current_page` | Integer | Current page (1-indexed) |
| `pagination.total_pages` | Integer | Total pages |
| `pagination.prev_url` | String/nil | Previous page URL |
| `pagination.next_url` | String/nil | Next page URL |

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

---

## Item Pages

Item pages display a single dataset record. The template name typically matches the singular form of the dataset alias.

### Template Naming

| Dataset Alias | Item Template |
|---------------|---------------|
| `articles` | `templates/article.liquid` |
| `products` | `templates/product.liquid` |
| `team` | `templates/member.liquid` |
| `companies` | `templates/company.liquid` |

### Variable Naming

The record is available with the singular alias name:

```liquid
<!-- templates/article.liquid -->
{{ article.title }}
{{ article.content }}
{{ article.published_at | date: '%B %d, %Y' }}

<!-- templates/product.liquid -->
{{ product.name }}
{{ product.price }}
{{ product.description }}
```

### Basic Item Template

```liquid
<!-- templates/article.liquid -->
<article class="container max-w-3xl">
  <nav class="breadcrumb">
    <a href="/">Home</a> /
    <a href="{{ mount.mount_path }}">{{ mount.alias | capitalize }}</a> /
    <span>{{ article.title }}</span>
  </nav>

  <header>
    <h1>{{ article.title }}</h1>
    {% if article.published_at %}
      <time>{{ article.published_at | date: '%B %d, %Y' }}</time>
    {% endif %}
  </header>

  {% if article.image %}
    <img src="{{ article.image | img_url: 'large' }}" alt="">
  {% endif %}

  <div class="content prose">
    {{ article.content }}
  </div>

  <a href="{{ mount.mount_path }}">← Back to {{ mount.alias }}</a>
</article>
```

---

## Accessing Record Fields

Dataset records have dynamic fields defined by the site owner. Common patterns:

### Common Field Names

| Field | Description | Example Usage |
|-------|-------------|---------------|
| `title` / `name` | Display title | `{{ article.title }}` |
| `slug` | URL-friendly identifier | Used for URLs |
| `content` / `body` | Main content | `{{ article.content }}` |
| `excerpt` / `summary` | Short description | `{{ article.excerpt }}` |
| `image` / `photo` | Featured image | `{{ article.image \| img_url: 'large' }}` |
| `published_at` / `date` | Publish date | `{{ article.published_at \| date: '%b %d' }}` |
| `author` | Author name | `{{ article.author }}` |
| `category` / `tags` | Categorization | `{{ article.category }}` |

### Accessing Fields

```liquid
{{ article.title }}
{{ article.custom_field_name }}
{{ article.nested.field }}
```

### Safe Field Access

Handle missing or empty fields gracefully:

```liquid
<!-- Using default filter -->
{{ article.title | default: 'Untitled' }}
{{ article.excerpt | default: article.content | truncate_words: 30 }}

<!-- Using conditionals -->
{% if article.author %}
  <span>By {{ article.author }}</span>
{% endif %}

{% if article.image %}
  <img src="{{ article.image | img_url: 'medium' }}" alt="">
{% endif %}
```

### Field Aliases

Site owners can configure **field aliases** in the schema editor. Aliases allow multiple names to resolve to the same field. For example, if a dataset has a field `company_name` with aliases `business_name` and `name`, all of these work:

```liquid
{{ record.company_name }}    <!-- canonical key -->
{{ record.business_name }}   <!-- alias -->
{{ record.name }}            <!-- alias -->
```

**Why this matters for theme developers:**
- You can use common field names like `name`, `title`, `description` without knowing the exact schema
- Site owners can map their dataset's fields to match your template expectations
- Themes become more portable across different datasets

**Best practice:** Document which field names your theme expects. Site owners can then configure aliases to make their data work with your theme.

---

## Generating URLs

### The item_url Filter

Generate URLs for dataset records using the `item_url` filter:

```liquid
{{ article | item_url }}
<!-- Output: /blog/my-article-slug -->

{{ product | item_url }}
<!-- Output: /products/widget-pro -->
```

Use in links:

```liquid
<a href="{{ article | item_url }}">{{ article.title }}</a>

<a href="{{ article | item_url }}" class="read-more">
  Read more →
</a>
```

### Building Full URLs

```liquid
<!-- Relative URL -->
{{ article | item_url }}

<!-- With site domain -->
{{ site.url }}{{ article | item_url }}
```

---

## Filtering and Limiting

### Limit Results

```liquid
{% for article in datasets.articles limit: 5 %}
  {{ article.title }}
{% endfor %}
```

### Offset Results

```liquid
{% for article in datasets.articles limit: 5 offset: 5 %}
  <!-- Articles 6-10 -->
{% endfor %}
```

### Check for Content

```liquid
{% if datasets.articles.size > 0 %}
  <section class="articles">
    <h2>Latest Articles</h2>
    {% for article in datasets.articles limit: 3 %}
      {% hostnet_render 'article-card', article: article %}
    {% endfor %}
  </section>
{% endif %}
```

---

## Cross-Dataset Access

Access any mounted dataset from any template:

```liquid
<!-- On homepage (templates/index.liquid) -->
<section class="featured-articles">
  <h2>Latest Articles</h2>
  {% for article in datasets.articles limit: 3 %}
    {% hostnet_render 'article-card', article: article %}
  {% endfor %}
</section>

<section class="featured-products">
  <h2>Popular Products</h2>
  {% for product in datasets.products limit: 4 %}
    {% hostnet_render 'product-card', product: product %}
  {% endfor %}
</section>

<section class="team">
  <h2>Our Team</h2>
  {% for member in datasets.team %}
    {% hostnet_render 'team-card', member: member %}
  {% endfor %}
</section>
```

---

## Template Selection by Dataset

Use different card snippets based on the dataset type:

```liquid
<!-- templates/collection.liquid -->
<div class="grid">
  {% for item in collection %}
    {% case mount.alias %}
      {% when 'articles' %}
        {% hostnet_render 'article-card', article: item %}
      {% when 'products' %}
        {% hostnet_render 'product-card', product: item %}
      {% when 'team' %}
        {% hostnet_render 'team-card', member: item %}
      {% else %}
        {% hostnet_render 'generic-card', item: item %}
    {% endcase %}
  {% endfor %}
</div>
```

Or use a naming convention:

```liquid
<!-- If snippets are named: article-card, product-card, team-card -->
{% assign card_name = mount.alias | remove_last: 's' | append: '-card' %}
{% hostnet_render card_name, item: item %}
```

---

## Real-World Patterns

### Homepage with Multiple Datasets

```liquid
<!-- templates/index.liquid -->
<div class="container">
  {% section 'hero' %}

  {% if datasets.articles.size > 0 %}
    <section class="py-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Latest News</h2>
        <a href="/articles">View all →</a>
      </div>
      <div class="grid grid-cols-3 gap-6">
        {% for article in datasets.articles limit: 3 %}
          {% hostnet_render 'article-card', article: article %}
        {% endfor %}
      </div>
    </section>
  {% endif %}

  {% if datasets.products.size > 0 %}
    <section class="py-12 bg-gray-50">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Featured Products</h2>
        <a href="/products">Shop all →</a>
      </div>
      <div class="grid grid-cols-4 gap-6">
        {% for product in datasets.products limit: 4 %}
          {% hostnet_render 'product-card', product: product %}
        {% endfor %}
      </div>
    </section>
  {% endif %}
</div>
```

### Generic Collection with Metadata

```liquid
<!-- templates/collection.liquid -->
<div class="container py-12">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">{{ mount.alias | capitalize }}</h1>
    <p class="text-gray-600">
      Showing {{ collection.size }} items
      {% if pagination.total_pages > 1 %}
        (page {{ pagination.current_page }} of {{ pagination.total_pages }})
      {% endif %}
    </p>
  </header>

  {% if collection.size > 0 %}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {% for item in collection %}
        {% if mount.alias == 'articles' %}
          {% hostnet_render 'article-card', article: item %}
        {% elsif mount.alias == 'products' %}
          {% hostnet_render 'product-card', product: item %}
        {% else %}
          {% hostnet_render 'generic-card', item: item %}
        {% endif %}
      {% endfor %}
    </div>

    {% hostnet_render 'pagination' %}
  {% else %}
    <div class="text-center py-16 text-gray-500">
      <p>No {{ mount.alias }} found.</p>
    </div>
  {% endif %}
</div>
```

### Article with Related Content

```liquid
<!-- templates/article.liquid -->
<article class="container max-w-4xl py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold">{{ article.title }}</h1>
    <div class="flex items-center gap-4 mt-4 text-gray-600">
      {% if article.author %}
        <span>By {{ article.author }}</span>
      {% endif %}
      {% if article.published_at %}
        <time>{{ article.published_at | date: '%B %d, %Y' }}</time>
      {% endif %}
      {% if article.category %}
        <span class="badge">{{ article.category }}</span>
      {% endif %}
    </div>
  </header>

  {% if article.image %}
    <img
      src="{{ article.image | img_url: 'xlarge' }}"
      alt="{{ article.title }}"
      class="w-full rounded-lg mb-8"
    >
  {% endif %}

  <div class="prose prose-lg max-w-none">
    {{ article.content }}
  </div>

  <!-- Related Articles -->
  {% if datasets.articles.size > 1 %}
    <section class="mt-16 pt-8 border-t">
      <h2 class="text-2xl font-bold mb-6">More Articles</h2>
      <div class="grid grid-cols-3 gap-6">
        {% for related in datasets.articles limit: 3 %}
          {% unless related.slug == article.slug %}
            {% hostnet_render 'article-card', article: related %}
          {% endunless %}
        {% endfor %}
      </div>
    </section>
  {% endif %}

  <nav class="mt-8 pt-8 border-t">
    <a href="{{ mount.mount_path }}" class="text-blue-600">
      ← Back to {{ mount.alias | capitalize }}
    </a>
  </nav>
</article>
```

---

## Best Practices

### 1. Design for Empty States

Always handle the case where no data exists:

```liquid
{% if datasets.articles.size > 0 %}
  {% for article in datasets.articles %}
    ...
  {% endfor %}
{% else %}
  <p class="empty-state">No articles yet.</p>
{% endif %}
```

### 2. Don't Assume Field Names

Different sites may use different field names. Use sensible fallbacks:

```liquid
{{ item.title | default: item.name | default: 'Untitled' }}
{{ item.excerpt | default: item.description | default: item.content | truncate_words: 30 }}
```

**Better approach:** Document your expected field names and let site owners use [field aliases](#field-aliases) to map their data. For example, if your theme uses `{{ record.title }}`, site owners can add `title` as an alias to their `company_name` field.

### 3. Use Generic Templates

Build flexible templates that work with any dataset structure:

```liquid
<!-- snippets/generic-card.liquid -->
<article class="card">
  {% if item.image %}
    <img src="{{ item.image | img_url: 'medium' }}" alt="">
  {% endif %}
  <h3>{{ item.title | default: item.name }}</h3>
  <p>{{ item.excerpt | default: item.description | truncate_words: 20 }}</p>
  <a href="{{ item | item_url }}">View details</a>
</article>
```

### 4. Keep Collection Templates Generic

The same `collection.liquid` can serve multiple datasets:

```liquid
<!-- Works for /articles, /products, /team, etc. -->
<h1>{{ mount.alias | capitalize }}</h1>
{% for item in collection %}
  {% hostnet_render 'card', item: item %}
{% endfor %}
```

### 5. Use mount for Navigation

Build breadcrumbs and back links using mount info:

```liquid
<a href="{{ mount.mount_path }}">← Back to {{ mount.alias }}</a>
```
