# Search

How to build search functionality into your Site Swarm theme.

Site Swarm provides a built-in search system that queries all searchable datasets on a site. Theme developers create a `templates/search.liquid` template to display results. The search route (`/search?q=...`) is handled automatically -- no custom routing needed.

---

## Quick Start

Create `templates/search.liquid`:

```liquid
{% assign_global page_title = "Search Results" %}

<div class="search-page">
  <form action="/search" method="get">
    <input type="text" name="q" value="{{ search.query }}" placeholder="Search...">
    <button type="submit">Search</button>
  </form>

  {% if search.query %}
    <p>{{ search.total }} result{% if search.total != 1 %}s{% endif %} for "{{ search.query }}"</p>

    {% for result in search.results %}
      <article>
        <h3><a href="{{ result._item_url }}">{{ result.title | default: result.name }}</a></h3>
        <p>{{ result.excerpt | default: result.body | truncate_words: 30 }}</p>
        <span class="dataset">{{ result._dataset_alias }}</span>
      </article>
    {% else %}
      <p>No results found.</p>
    {% endfor %}

    {% if pagination.total_pages > 1 %}
      {% render 'pagination' %}
    {% endif %}
  {% endif %}
</div>
```

Visit `http://localhost:4000/search?q=hello` to preview.

---

## How Search Routing Works

The `/search` URL is a **special route** that takes priority over template matching when a `q` parameter is present:

| URL | Behavior |
|-----|----------|
| `/search?q=hello` | Search route -- renders `templates/search.liquid` with search context |
| `/search` (no `q`) | Normal template routing -- renders `templates/search.liquid` as a regular template |
| `/search?q=` (empty) | Normal template routing -- empty query treated as no search |

This mirrors production behavior where `SiteRouter` intercepts `/search?q=...` before normal route resolution.

---

## Search Context Variables

When the search route is active, these variables are available in `templates/search.liquid`:

### search

| Property | Type | Description |
|----------|------|-------------|
| `search.query` | String | The search query string |
| `search.results` | Array | Matching records (paginated) |
| `search.total` | Integer | Total matches across all datasets |

### pagination

Standard pagination object, same shape as collection pages:

| Property | Type | Description |
|----------|------|-------------|
| `pagination.current_page` | Integer | Current page (1-indexed) |
| `pagination.total_pages` | Integer | Total pages |
| `pagination.total_count` | Integer | Total results |
| `pagination.per_page` | Integer | Results per page (10) |
| `pagination.next_url` | String/nil | Next page URL (e.g., `/search?q=hello&page=2`) |
| `pagination.prev_url` | String/nil | Previous page URL |

### request.query

The raw query string is also available via `{{ request.query }}`.

### Result Metadata

Each result in `search.results` is a dataset record with additional metadata fields:

| Property | Description | Example |
|----------|-------------|---------|
| `result._item_url` | Full URL path to the record | `/articles/hello-world` |
| `result._dataset_alias` | Which dataset this result came from | `articles` |
| `result._dataset_name` | Same as `_dataset_alias` | `articles` |
| `result._mount_path` | Dataset mount path | `/articles` |

Plus all the record's own fields (`title`, `slug`, `body`, etc.).

---

## Search Form

Add a search form anywhere in your theme (header, sidebar, search page):

```liquid
<form action="/search" method="get">
  <input type="text" name="q" value="{{ request.query }}" placeholder="Search...">
  <button type="submit">Search</button>
</form>
```

Use `{{ request.query }}` to pre-fill the input with the current search term.

### Header Search Example

```liquid
<!-- sections/header.liquid -->
<header>
  <a href="/">{{ site.name }}</a>
  <nav>
    <a href="/about">About</a>
    <a href="/blog">Blog</a>
    <form action="/search" method="get" class="header-search">
      <input type="search" name="q" value="{{ request.query }}" placeholder="Search...">
    </form>
  </nav>
</header>
```

---

## Complete Search Template

A full-featured search template with empty states, result cards, and pagination:

```liquid
{% assign_global page_title = search.query | prepend: 'Search: ' | default: 'Search' %}
{% assign_global page_description = 'Search results across all content.' %}

<div class="search-page">
  <h1>Search</h1>

  <form action="/search" method="get" class="search-form">
    <input type="text" name="q" value="{{ search.query }}" placeholder="Search this site..." autofocus>
    <button type="submit">Search</button>
  </form>

  {% if search.query %}
    {% if search.total > 0 %}
      <p class="search-meta">
        {{ search.total }} result{% if search.total != 1 %}s{% endif %}
        for "<strong>{{ search.query }}</strong>"
        {% if pagination.total_pages > 1 %}
          (page {{ pagination.current_page }} of {{ pagination.total_pages }})
        {% endif %}
      </p>

      <div class="search-results">
        {% for result in search.results %}
          <article class="search-result">
            <h3><a href="{{ result._item_url }}">{{ result.title | default: result.name | default: 'Untitled' }}</a></h3>
            {% if result.excerpt or result.body or result.description %}
              <p>{{ result.excerpt | default: result.body | default: result.description | truncate_words: 40 }}</p>
            {% endif %}
            <div class="search-result-meta">
              <span class="result-type">{{ result._dataset_alias | capitalize }}</span>
              {% if result.published_at %}
                <time>{{ result.published_at | date: '%b %d, %Y' }}</time>
              {% endif %}
            </div>
          </article>
        {% endfor %}
      </div>

      {% if pagination.total_pages > 1 %}
        {% render 'pagination' %}
      {% endif %}

    {% else %}
      <div class="no-results">
        <p>No results found for "<strong>{{ search.query }}</strong>".</p>
        <p>Try different keywords or check your spelling.</p>
      </div>
    {% endif %}

  {% else %}
    <p class="search-prompt">Enter a search term to find content across this site.</p>
  {% endif %}
</div>
```

---

## Styling Search Results

Search results come from multiple datasets, so design cards that handle different field names gracefully:

```liquid
<!-- snippets/search-result.liquid -->
<article class="search-result">
  {% if result.image %}
    <img src="{{ result.image | img_url: 'small' }}" alt="">
  {% endif %}
  <div>
    <h3><a href="{{ result._item_url }}">
      {{ result.title | default: result.name | default: 'Untitled' }}
    </a></h3>
    <p>{{ result.excerpt | default: result.description | default: result.body | truncate_words: 30 }}</p>
    <small>{{ result._dataset_alias | capitalize }}</small>
  </div>
</article>
```

Then in your search template:

```liquid
{% for result in search.results %}
  {% render 'search-result', result: result %}
{% endfor %}
```

---

## Dev Server vs Production

| Aspect | Dev Server (`swarm dev`) | Production |
|--------|--------------------------|------------|
| **Search engine** | In-memory substring match across all datasets | PostgreSQL ILIKE across searchable datasets |
| **Searchable flag** | All datasets searched | Only datasets flagged as searchable |
| **Results** | Any record with a matching string value | Text fields searched |
| **Sorting** | Insertion order | Relevance-based |
| **Performance** | Instant (in-memory) | Database query |

The dev server searches all dataset records by checking every string field value for a substring match. This is intentionally more permissive than production to make template development easier -- you'll always see results if matching data exists.

In production, site owners control which datasets appear in search results via the "searchable" flag in the dashboard.

---

## Best Practices

### Handle Empty States

Always show helpful messages when there are no results or no query:

```liquid
{% if search.query == blank %}
  <p>Enter a search term above.</p>
{% elsif search.total == 0 %}
  <p>No results found. Try different keywords.</p>
{% endif %}
```

### Use Fallback Fields

Records from different datasets have different field names. Chain defaults:

```liquid
{{ result.title | default: result.name | default: 'Untitled' }}
{{ result.excerpt | default: result.description | default: result.body | truncate_words: 30 }}
```

### Show Dataset Context

Help users understand where results come from:

```liquid
<span class="badge">{{ result._dataset_alias | capitalize }}</span>
```

### Reuse Your Pagination Snippet

The search `pagination` object has the same shape as collection pages, so your existing `snippets/pagination.liquid` works unchanged:

```liquid
{% if pagination.total_pages > 1 %}
  {% render 'pagination' %}
{% endif %}
```

### SEO for Search Pages

Search pages should not be indexed:

```liquid
{% assign_global page_robots = 'noindex, follow' %}
```

---

## Linking to Search

Create links to pre-filled searches:

```liquid
<a href="/search?q={{ tag.name | url_encode }}">Find more about {{ tag.name }}</a>
```

Build a tag cloud that links to search:

```liquid
{% for tag in tags %}
  <a href="/search?q={{ tag.name | url_encode }}">{{ tag.name }}</a>
{% endfor %}
```
