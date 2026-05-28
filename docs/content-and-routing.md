# Content and Routing

How content reaches pages, and how URLs resolve to templates.

Site Swarm sites combine two content systems: **page templates** for static pages with editable settings, and **datasets** for dynamic collections of records. Both integrate with a unified URL routing system that gives theme developers full control over URL structure.

---

## Templates

Templates live in `templates/` and handle standalone pages. Dataset templates live in `dataset_templates/` (preferred) or `templates/` (fallback).

### Standard Template Types

| Template | Purpose | URL |
|----------|---------|-----|
| `index.liquid` | Homepage | `/` |
| `404.liquid` | Not found page | Any unmatched URL |
| `search.liquid` | Search results page | `/search?q=...` (with search context) |
| `page.liquid` | Generic page fallback | Various |

### Dataset Templates

Templates for rendering dataset records should be placed in `dataset_templates/`. These are **only rendered in dataset context** (list/item pages) and are invisible to the URL router — they won't accidentally serve as standalone pages.

| Template | Purpose | URL |
|----------|---------|-----|
| `collection.liquid` | Dataset listing page | Mount path (e.g., `/blog`) |
| `article.liquid` | Single dataset item | Mount path + slug (e.g., `/blog/my-post`) |

**Lookup order:** `dataset_templates/{name}.liquid` → `templates/{name}.liquid`

Placing `collection.liquid` in `templates/` means `/collection` serves it as a standalone page (with no dataset context). Placing it in `dataset_templates/` avoids this — it's only used when rendering dataset lists.

### Template Naming Conventions

Item templates use the **singular form** of the dataset alias:

| Dataset Alias | Item Template |
|---------------|---------------|
| `articles` | `dataset_templates/article.liquid` |
| `products` | `dataset_templates/product.liquid` |
| `team` | `dataset_templates/member.liquid` |
| `companies` | `dataset_templates/company.liquid` |

> **Backward compatibility:** Templates in `templates/` still work for dataset rendering. The system checks `dataset_templates/` first, then falls back to `templates/`.

Any template file in `templates/` can also serve as a static page. For example, `templates/about.liquid` renders at `/about`, and `templates/contact.liquid` renders at `/contact`.

### Custom Templates

You can create any template name. If `templates/pricing.liquid` exists, `/pricing` renders it. Templates always take precedence over dataset routes, so you can override any URL by creating a matching template.

---

## Page Templates

Page templates provide static pages with per-page editable settings. They live in `page_templates/` and are distinct from dataset templates in `templates/`.

### Why Page Templates?

The `templates/` directory was designed for rendering dataset records. Page templates solve the need for static pages (About, Contact, Services, Landing pages) that have editable content without touching template code.

### Page and PageTemplate Relationship

One page template can power many pages, each with its own slug and settings:

```
page_templates/service.liquid     # The layout
    |
    +-- Page: "Plumbing" (slug: plumbing)    --> /plumbing
    +-- Page: "Electrical" (slug: electrical) --> /electrical
    +-- Page: "HVAC" (slug: hvac)            --> /hvac
```

- **Page records always reference a page_template**
- **One page_template can have many Pages** (different slugs, different content)
- **page_template with no Pages** renders at `/template-name` as an implicit route

### Creating Page Templates

Page templates use **sidecar schemas** -- a separate JSON file in `config/page_templates/` that defines editable settings.

**page_templates/about.liquid** (pure Liquid, no schema block):
```liquid
<div class="about-page">
  <h1>{{ settings.headline }}</h1>

  <div class="hero" style="background-image: url('{{ settings.hero_image }}')">
    <p>{{ settings.tagline }}</p>
  </div>

  <div class="prose">
    {{ settings.body }}
  </div>

  {% if settings.show_team %}
    {% section 'team-members' %}
  {% endif %}
</div>
```

**config/page_templates/about.json** (schema definition):
```json
{
  "name": "About Page",
  "settings": [
    {
      "id": "headline",
      "type": "text",
      "label": "Headline",
      "default": "About Us"
    },
    {
      "id": "tagline",
      "type": "text",
      "label": "Tagline"
    },
    {
      "id": "hero_image",
      "type": "image_picker",
      "label": "Hero Image"
    },
    {
      "id": "body",
      "type": "richtext",
      "label": "Body Content"
    },
    {
      "id": "show_team",
      "type": "checkbox",
      "label": "Show Team Section",
      "default": true
    }
  ]
}
```

The schema file name matches the page template file name (without extension). Inline `{% schema %}` blocks are also supported as a fallback, but sidecar files are recommended.

### Supported Setting Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single line text | Headlines, labels |
| `textarea` | Multi-line text | Descriptions |
| `richtext` | WYSIWYG editor producing sanitized HTML — see [richtext-editor.md](richtext-editor.md) | Body content, FAQ answers, "about" blurbs |
| `image_picker` | Image from media library | Hero images |
| `url` | URL input | Links |
| `checkbox` | Boolean toggle | Feature flags |
| `range` | Numeric slider | Spacing, counts |
| `select` | Dropdown with options | Style choices |
| `color` | Color picker | Accent colors |

### Accessing Settings in Templates

Settings defined in the schema are available via the `settings` object:

```liquid
<h1>{{ settings.service_name }}</h1>
<div class="price">Starting at {{ settings.price }}</div>
<div class="description">{{ settings.description }}</div>

{% if settings.cta_url %}
  <a href="{{ settings.cta_url }}" class="btn">{{ settings.cta_text }}</a>
{% endif %}
```

### The page Object

The `{{ page }}` object provides metadata about the current page:

```liquid
{{ page.id }}             --> "page_about"
{{ page.title }}          --> "About Us"
{{ page.slug }}           --> "about"
{{ page.url }}            --> "/about"
{{ page.page_template }}  --> "about"
{{ page.content }}        --> ""
{{ page.schema_type }}    --> "WebPage"
{{ page.settings }}       --> { ... }
```

### Settings Merge Order

When a Page record links to a page_template with a schema:

1. Schema defaults provide the base values
2. Page record `settings` override matching keys
3. Unset fields keep their schema defaults

### Comparison: page_templates/ vs templates/

| Aspect | page_templates/ | templates/ |
|--------|-----------------|------------|
| Purpose | Static pages | Dataset rendering |
| Settings | Per-page (stored in Page.settings) | Global (site settings) |
| URL binding | Via Page records or implicit | Via dataset mounts or direct match |
| Sitemap | Pages included automatically | Excluded unless `sitemap: true` |
| Multiple instances | One template --> many Pages | One template --> one URL |
| Dashboard editing | Page settings form | Theme settings only |

### Best Practice: Prefer Page Templates Over Individual Templates

> **Rule of thumb:** If a page doesn't render dataset records and doesn't need a truly unique layout, it should be a **Page record** using a **page_template** — not an individual template file.

**Anti-pattern — one template file per static page:**

```
templates/
├── about.liquid
├── contact.liquid
├── privacy.liquid
├── terms.liquid
├── faq.liquid
└── careers.liquid       # 6 files for 6 static pages
```

This is wrong because:
- Site owners can't edit page content without touching theme code
- Adding a new page (e.g., "Careers") requires a theme update and re-upload
- It defeats the purpose of a CMS — content should be manageable from the dashboard

**Correct pattern — one page_template, many Page records:**

```
page_templates/
└── page.liquid          # 1 generic template

data/content/pages.json  # 6 Page records using the same template
```

Create 1-2 generic page_templates (e.g., `page.liquid` for standard pages, `service.liquid` for service-specific layouts), then let site owners create Page records in the dashboard. Theme builders should provide sample pages via `data/content/pages.json` so users get starter content on import (see [Sample Content: pages.json](tools/sample-content.md#pagesjson)).

**When individual templates ARE appropriate:**
- **Homepage** (`templates/index.liquid`) — unique layout, always exists
- **Dataset templates** (`templates/collection.liquid`, `templates/article.liquid`) — render dataset records
- **Search** (`templates/search.liquid`) — unique search context
- **404** (`templates/404.liquid`) — error page
- **Truly unique layouts** that can't be served by a page_template with settings

---

## Datasets

Datasets are collections of structured content -- articles, products, team members, locations, or any custom type. They are defined by site owners in the dashboard and accessible in templates via the `datasets` object.

### The datasets Object

Access all mounted datasets from any template:

```liquid
{% for article in datasets.articles %}
  {{ article.title }}
{% endfor %}

{% for product in datasets.products %}
  {{ product.name }}
{% endfor %}
```

The alias (e.g., `articles`, `products`) is configured by the site owner when mounting the dataset. Datasets are loaded lazily -- data is only fetched when accessed.

### Available Methods

| Method | Description |
|--------|-------------|
| `datasets.articles` | Access records (capped at 200; use `{% paginate %}` for larger sets) |
| `datasets.articles.size` | Total count of records (efficient SQL query, loads no records) |
| `datasets.articles.first` | First record (loads only 1 record) |
| `datasets.articles.last` | Last record (loads only 1 record) |
| `datasets.articles.empty` | Whether the dataset has no records (SQL check, loads no records) |
| `datasets.articles.all_records` | All records with no cap (use sparingly for large datasets) |
| `datasets.articles \| count_where: 'field', 'value'` | Count matching records (SQL optimized, loads no records) |

> **Note:** Direct iteration over `datasets.articles` returns up to 200 records. For datasets with more than 200 records, use `{% paginate datasets.articles by 20 %}` for paginated access, or `datasets.articles.all_records` if you truly need every record at once.

### Collection Pages

Collection pages display paginated lists of dataset records. Use `templates/collection.liquid`.

**Available objects:**

| Object | Description |
|--------|-------------|
| `collection` | Paginated array of records for current page |
| `pagination` | Pagination metadata |
| `mount` | Dataset mount configuration |

**Basic collection template:**

```liquid
<div class="container">
  <h1>{{ mount.alias | capitalize }}</h1>

  <div class="grid">
    {% for item in collection %}
      {% render 'card', item: item %}
    {% else %}
      <p>No items found.</p>
    {% endfor %}
  </div>

  {% if pagination.total_pages > 1 %}
    {% render 'pagination' %}
  {% endif %}
</div>
```

**The mount object:**

| Property | Description | Example |
|----------|-------------|---------|
| `mount.alias` | Dataset alias | `articles` |
| `mount.mount_path` | URL mount point | `/blog` |
| `mount.slug_field` | Field used for URLs | `slug` |
| `mount.items_per_page` | Records per page | `10` |

**Pagination object:**

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current_page` | Integer | Current page (1-indexed) |
| `pagination.total_pages` | Integer | Total pages |
| `pagination.total_count` | Integer | Total records across all pages |
| `pagination.per_page` | Integer | Records per page |
| `pagination.prev_url` | String/nil | Previous page URL |
| `pagination.next_url` | String/nil | Next page URL |
| `pagination.parts` | Array | Pre-computed page links, ellipsis markers, and current-page indicators (see below) |

**Using `pagination.parts` (recommended):**

The `parts` array provides pre-computed page numbers with URLs so you don't need to do any math in Liquid. Each part has: `title` (page number or "…"), `url` (link target or nil), `is_link` (boolean), and `is_current` (boolean).

```liquid
{% if pagination.total_pages > 1 %}
  <nav class="pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}">Previous</a>
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
      <a href="{{ pagination.next_url }}">Next</a>
    {% endif %}
  </nav>
{% endif %}
```

For a minimal prev/next-only pagination, you can ignore `parts` and use just `prev_url`/`next_url`:

```liquid
{% if pagination.total_pages > 1 %}
  <nav class="pagination">
    {% if pagination.prev_url %}
      <a href="{{ pagination.prev_url }}">Previous</a>
    {% endif %}
    <span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span>
    {% if pagination.next_url %}
      <a href="{{ pagination.next_url }}">Next</a>
    {% endif %}
  </nav>
{% endif %}
```

### Item Pages

Item pages display a single dataset record. The template name matches the singular form of the dataset alias, and the record is available as a variable with that singular name.

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

**Variable naming convention:**

| Dataset Alias | Item Variable |
|---------------|---------------|
| `articles` | `article` |
| `pages` | `page` |
| `services` | `service` |
| `locations` | `location` |
| `team` | `team_member` |
| `products` | `product` |

The item variable name is derived from the alias using Rails' `singularize`.

### Common Record Fields

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

Handle missing fields gracefully:

```liquid
{{ article.title | default: 'Untitled' }}
{{ article.excerpt | default: article.content | truncate_words: 30 }}

{% if article.image %}
  <img src="{{ article.image | img_url: 'medium' }}" alt="">
{% endif %}
```

### Field Aliases

Site owners can configure field aliases in the schema editor. Aliases let multiple names resolve to the same field:

```liquid
{{ record.company_name }}    <!-- canonical key -->
{{ record.business_name }}   <!-- alias -->
{{ record.name }}            <!-- alias -->
```

This makes themes more portable. Document which field names your theme expects, and site owners can configure aliases to match.

### Cross-Dataset Access

The `datasets` object is available in every template, not just collection or item pages:

```liquid
<!-- On homepage (templates/index.liquid) -->
<section class="featured-articles">
  <h2>Latest Articles</h2>
  {% for article in datasets.articles limit: 3 %}
    {% render 'article-card', article: article %}
  {% endfor %}
</section>

<section class="featured-products">
  <h2>Popular Products</h2>
  {% for product in datasets.products limit: 4 %}
    {% render 'product-card', product: product %}
  {% endfor %}
</section>
```

### Filtering and Limiting

```liquid
<!-- Limit results -->
{% for article in datasets.articles limit: 5 %}
  {{ article.title }}
{% endfor %}

<!-- Offset results -->
{% for article in datasets.articles limit: 5 offset: 5 %}
  <!-- Articles 6-10 -->
{% endfor %}

<!-- Check for content -->
{% if datasets.articles.size > 0 %}
  {% for article in datasets.articles limit: 3 %}
    {% render 'article-card', article: article %}
  {% endfor %}
{% endif %}
```

### Sorting

Sort datasets using `{% assign %}` before the loop:

```liquid
{% assign sorted_articles = datasets.articles | sort: 'order' %}
{% for article in sorted_articles %}
  {{ article.title }}
{% endfor %}
```

For reverse order:

```liquid
{% assign newest_first = datasets.articles | sort: 'published_at' | reverse %}
{% for article in newest_first %}
  {{ article.title }}
{% endfor %}
```

> **Warning:** You **cannot** use filters inline inside `{% for %}` tags. This is invalid Liquid and will cause a syntax error:
>
> ```liquid
> <!-- WRONG — filters cannot go inside {% for %} tags -->
> {% for article in datasets.articles | sort: 'order' %}
> ```
>
> Always assign first, then loop over the sorted variable.

---

## URL Routing

Site Swarm uses a template-first routing system with fallthrough dataset slug resolution for dynamic content.

### Resolution Priority

When a request comes in, URLs resolve in this order:

| Priority | Match Type | Description |
|----------|-----------|-------------|
| 1 | **Search** | `/search?q=hello` renders `templates/search.liquid` with search context |
| 2 | **Exact template match** | `/about` matches `templates/about.liquid` |
| 3 | **Page by slug** | Page record with slug "about" renders its linked page_template |
| 4 | **Implicit page_template** | `page_templates/about.liquid` exists with no Page record |
| 5 | **Blog post routes** | `/blog` (list) or `/blog/:slug` (single post) |
| 6 | **Mounted dataset routes** | Collection at mount_path, item at mount_path + slug |
| 7 | **Parameterized routes** | Templates with `{% routes %}` patterns, matched by specificity |
| 8 | **Fallthrough dataset slugs** | Root-level slug match against datasets without mount_path |
| 9 | **Static pages (rich text)** | Page record with no page_template (plain content) |
| 10 | **404 fallback** | `templates/404.liquid` |

Templates always take precedence. This means you can override any URL by creating a matching template file.

### Resolution Examples

| Request | Resolution |
|---------|------------|
| `GET /` | `templates/index.liquid` (exact template) |
| `GET /about` | `templates/about.liquid` if it exists, else Page slug "about" renders its page_template |
| `GET /plumbing` | Page with slug "plumbing" (template: service) renders `page_templates/service.liquid` |
| `GET /contact` | `page_templates/contact.liquid` exists with no Page record (implicit route) |
| `GET /blog` | Blog post list (mounted dataset) |
| `GET /blog/hello-world` | Single blog post (mounted dataset item) |
| `GET /denver` | Fallthrough: found in `locations` dataset, renders `location.liquid` |
| `GET /tree-removal` | Fallthrough: found in `services` dataset, renders `service.liquid` |
| `GET /nonexistent` | No match anywhere, renders `404.liquid` |

### Dataset Routing Modes

Datasets support two routing modes controlled by the `mount_path` setting.

**Mounted datasets** (explicit URL path):

Set `mount_path` to give the dataset a dedicated URL prefix:

| mount_path | Collection URL | Item URL |
|------------|----------------|----------|
| `/blog` | `/blog` | `/blog/hello-world` |
| `/cities` | `/cities` | `/cities/denver` |
| `/tools/calculators` | `/tools/calculators` | `/tools/calculators/mortgage` |

Features:
- Collection page at the mount_path (toggle with `show_collection`)
- Item pages at mount_path + slug
- Supports nested paths
- Longest path matches first (prevents conflicts)

**Fallthrough datasets** (root-level URLs):

Leave `mount_path` blank for root-level URL resolution:

| Alias | Item URL | Notes |
|-------|----------|-------|
| `locations` | `/denver` | Checked first (alphabetical by alias) |
| `services` | `/tree-removal` | Checked after `locations` |

Features:
- Item pages at root level (`/slug`)
- No collection page (use explicit templates instead)
- Alphabetical resolution order by alias
- Only single-segment paths (no `/foo/bar`)

**Choosing the right mode:**

| Scenario | Mode |
|----------|------|
| Blog/articles with listing page | Mounted (`/blog`) |
| City landing pages at root | Fallthrough |
| Product catalog with categories | Mounted (`/products`) |
| Mixed SEO strategy | Both -- mounted for blog, fallthrough for cities |

Mounted datasets are checked before fallthrough, so there is no conflict when using both modes.

### Template Override Pattern

Templates always take precedence over dataset routes. To override a dataset URL with a custom page, create a matching template:

```liquid
<!-- templates/services.liquid - overrides any dataset at /services -->
<h1>Our Services</h1>
{% for service in datasets.services %}
  <a href="{{ service | item_url }}">{{ service.title }}</a>
{% endfor %}
```

---

## Parameterized Routes

Templates can define custom URL patterns that capture dynamic segments using the `{% routes %}` block.

### Defining Routes

Place a `{% routes %}` block at the top of a template:

```liquid
{% routes %}
/companies/:city/:state/:slug
/companies/:slug
{% endroutes %}

{% assign company = datasets.companies | where: 'slug', slug | first %}
<h1>{{ company.name }}</h1>
<p>Location: {{ city }}, {{ state }}</p>
```

**Pattern syntax:**
- Static segments match exactly: `/companies` matches "companies"
- Dynamic segments start with `:` and capture URL values: `:slug` captures any value
- Multiple patterns per template are supported (one per line)

### Accessing Captured Parameters

Parameters are available in two equivalent ways:

```liquid
<!-- As top-level variables -->
{{ city }}
{{ state }}
{{ slug }}

<!-- Via the route_params object -->
{{ route_params.city }}
{{ route_params.state }}
{{ route_params.slug }}
```

### Specificity Rules

When multiple patterns could match a URL, the most specific pattern wins:

1. **Number of segments** -- More segments = higher priority
2. **Static vs dynamic** -- Static segments score higher than dynamic
3. **Position** -- Earlier segments are weighted more heavily

| Pattern | Specificity |
|---------|-------------|
| `/companies/featured` (all static) | Highest |
| `/companies/:city/:state/:slug` (4 segments) | High |
| `/companies/:city/:slug` (3 segments) | Medium |
| `/companies/:slug` (2 segments) | Lower |

### Complete Example

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
      {% render 'business-card', business: business %}
    {% endif %}
  {% endif %}
{% endfor %}
```

### Adding Pagination with `{% paginate %}`

Parameterized routes don't get automatic pagination like mounted collection pages do. Use the `{% paginate %}` block tag to add pagination to any template:

```liquid
{% routes %}
/businesses/:city
{% endroutes %}

<h1>Businesses in {{ city | capitalize }}</h1>

{% paginate datasets.businesses by 12 as businesses %}
  {% for business in businesses %}
    {% if business.city == city %}
      {% render 'business-card', business: business %}
    {% endif %}
  {% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

**Syntax:** `{% paginate <collection> by <number> [as <variable>] %}`

The tag reads the current page from the `?page=N` query parameter automatically. Inside the block:

- `paginate.collection` — the current page's items
- `pagination.*` — same pagination object used by mounted collection pages (`current_page`, `total_pages`, `total_count`, `per_page`, `prev_url`, `next_url`, `parts`)
- Optional `as` alias provides a named variable for cleaner `{% for %}` loops

For dataset proxies (`datasets.*`), the tag uses efficient database offset/limit queries. For arrays (e.g., results of `| where:` filters), it slices in memory.

**Tip:** Create a reusable `snippets/pagination.liquid` using `pagination.parts` — it works identically inside `{% paginate %}` blocks and on mounted collection pages since the `pagination` object has the same shape. Use `parts` instead of hand-rolling page number math — Liquid's `if` conditions cannot contain filters, so expressions like `i == pagination.current_page | minus: 1` will cause syntax errors.

### When to Use Parameterized Routes vs Dataset Mounts

| Use Case | Solution |
|----------|----------|
| Standard blog/articles | Dataset mount (automatic list + item pages) |
| Product catalog with categories | Parameterized routes for category filtering |
| Location-based directory | Parameterized routes for location segments |
| Simple record detail pages | Dataset mount item pages |
| Complex multi-segment URLs | Parameterized routes |

**Key difference:** Dataset mounts automatically handle list/item pages with pagination. Parameterized routes give you full control but require manual data fetching. Use `{% paginate %}` to add pagination to parameterized routes or any template using `datasets.*`.

---

## Sitemap Behavior

| Source | Included in Sitemap? |
|--------|---------------------|
| `page_templates/` with linked Pages | Yes, via `page_urls()` |
| `page_templates/` without Pages | Yes, implicit URL |
| `templates/` with `{% routes %}` | No (URLs come from parameterized routes) |
| `templates/` without routes, `sitemap: false` | No |
| `templates/` without routes, `sitemap: true` | Yes (legacy behavior) |

### Excluding a Template from Sitemap

For dataset templates that should not appear in sitemaps (because the dataset records are included instead), add `sitemap: false` to the sidecar schema:

**config/templates/article.json:**
```json
{
  "name": "Article Template",
  "sitemap": false
}
```

---

## Generating URLs

### The item_url Filter

Generate URLs for dataset records:

```liquid
{{ article | item_url }}
<!-- Output: /blog/my-article-slug -->

{{ product | item_url }}
<!-- Output: /products/widget-pro -->
```

Use in links:

```liquid
<a href="{{ article | item_url }}">{{ article.title }}</a>
```

### Building Full URLs

```liquid
<!-- Relative URL -->
{{ article | item_url }}

<!-- With site domain -->
{{ site.url }}{{ article | item_url }}
```

### Back Links with mount

Use the `mount` object for breadcrumbs and back links on item pages:

```liquid
<nav aria-label="Breadcrumb">
  <a href="/">Home</a> /
  <a href="{{ mount.mount_path }}">{{ mount.alias | capitalize }}</a> /
  <span>{{ article.title }}</span>
</nav>

<!-- Back link -->
<a href="{{ mount.mount_path }}">Back to {{ mount.alias | capitalize }}</a>
```

### Manual URLs for Parameterized Routes

For templates using `{% routes %}`, construct URLs manually:

```liquid
<a href="/services/{{ service.slug }}">{{ service.title }}</a>
```

---

## Search

Search is a special route that intercepts `/search?q=...` before normal template matching, rendering `templates/search.liquid` with search context.

```
GET /search?q=hello  -->  templates/search.liquid (with search context)
GET /search          -->  templates/search.liquid (regular template, no search context)
```

**Available variables:**

| Variable | Type | Description |
|----------|------|-------------|
| `search.query` | String | The search query string |
| `search.results` | Array | Matching records (paginated, 10 per page) |
| `search.total` | Integer | Total number of matches |
| `pagination.*` | Object | Standard pagination (same shape as collection pages) |

**Result metadata:** Each result includes `_item_url`, `_dataset_alias`, and `_mount_path` for linking and display.

**Basic example:**

```liquid
<!-- templates/search.liquid -->
<form action="/search" method="get">
  <input type="text" name="q" value="{{ search.query }}" placeholder="Search...">
  <button type="submit">Search</button>
</form>

{% for result in search.results %}
  <h3><a href="{{ result._item_url }}">{{ result.title | default: result.name }}</a></h3>
  <p>{{ result.excerpt | default: result.body | truncate_words: 30 }}</p>
{% else %}
  <p>No results found.</p>
{% endfor %}

{% if pagination.total_pages > 1 %}
  {% render 'pagination' %}
{% endif %}
```

**Full guide:** [Search](search.md) covers forms, styling, empty states, dev server vs production differences, and best practices.

---

## Template Selection by Dataset

Use different card snippets based on the dataset type in collection templates:

```liquid
<!-- templates/collection.liquid -->
<div class="grid">
  {% for item in collection %}
    {% case mount.alias %}
      {% when 'articles' %}
        {% render 'article-card', article: item %}
      {% when 'products' %}
        {% render 'product-card', product: item %}
      {% else %}
        {% render 'generic-card', item: item %}
    {% endcase %}
  {% endfor %}
</div>
```

Or use a naming convention:

```liquid
{% assign card_name = mount.alias | remove_last: 's' | append: '-card' %}
{% render card_name, item: item %}
```

---

## Best Practices

### Design for Empty States

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

### Use Sensible Fallbacks

Different sites may use different field names:

```liquid
{{ item.title | default: item.name | default: 'Untitled' }}
{{ item.excerpt | default: item.description | default: item.content | truncate_words: 30 }}
```

Better approach: Document your expected field names and let site owners use field aliases to map their data.

### Keep Collection Templates Generic

The same `collection.liquid` can serve multiple datasets:

```liquid
<h1>{{ mount.alias | capitalize }}</h1>
{% for item in collection %}
  {% render 'card', item: item %}
{% endfor %}
```

### Use Descriptive Setting IDs (Page Templates)

```json
{ "id": "hero_headline", "type": "text", "label": "Hero Headline" }
{ "id": "cta_button_text", "type": "text", "label": "CTA Button Text" }
```

Avoid generic names like `text1` or `heading`.

### Provide Schema Defaults

```json
{
  "id": "cta_text",
  "type": "text",
  "label": "Call to Action",
  "default": "Learn More"
}
```

### Group Related Settings

Use `header` type entries to organize schema settings:

```json
{
  "settings": [
    { "type": "header", "content": "Hero Section" },
    { "id": "hero_headline", "type": "text", "label": "Headline" },
    { "id": "hero_image", "type": "image_picker", "label": "Image" },
    { "type": "header", "content": "Call to Action" },
    { "id": "cta_text", "type": "text", "label": "Button Text" },
    { "id": "cta_url", "type": "url", "label": "Button Link" }
  ]
}
```
