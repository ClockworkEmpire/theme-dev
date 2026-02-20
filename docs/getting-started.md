# Getting Started

Build and deploy your first Site Swarm theme.

---

## Prerequisites

- Basic knowledge of HTML and CSS
- Familiarity with templating concepts (variables, loops, conditionals)
- A Site Swarm account with at least one site

---

## Theme Overview

A Site Swarm theme is a collection of:

- **Liquid templates** - HTML with dynamic content placeholders
- **Sections** - Reusable components with configurable settings
- **Snippets** - Simple partials for repeated UI patterns
- **Assets** - CSS, JavaScript, images, and fonts
- **Config** - Settings schema and default values

When you upload a theme, Site Swarm processes these files and makes them available to your site.

---

## Step 1: Create the Directory Structure

Create a new folder for your theme:

```
my-theme/
├── layout/
├── templates/
├── page_templates/
├── sections/
├── snippets/
├── assets/
└── config/
```

---

## Step 2: Create the Layout

The layout is the HTML wrapper for every page. Create `layout/theme.liquid`:

```liquid
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title | default: site.name }}</title>

  <!-- Tailwind CSS CDN for quick styling -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Your theme CSS -->
  <link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
</head>
<body class="min-h-screen flex flex-col bg-gray-50">
  {% section 'header' %}

  <main class="flex-1">
    {{ content_for_layout }}
  </main>

  {% section 'footer' %}
</body>
</html>
```

Key points:
- `{{ content_for_layout }}` is where page content appears
- `{% section 'header' %}` includes the header section
- `{{ 'theme.css' | asset_url }}` links to your CSS file

---

## Step 3: Create the Header Section

Sections are reusable components with settings. Create the Liquid template and its sidecar schema file.

**sections/header.liquid** (pure Liquid, no schema block)
```liquid
<header class="bg-white shadow-sm">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold">
        {{ section.settings.logo_text | default: site.name }}
      </a>

      <nav class="flex gap-6">
        <a href="/" class="hover:text-blue-600">Home</a>
        <a href="/articles" class="hover:text-blue-600">Articles</a>
      </nav>
    </div>
  </div>
</header>
```

**config/sections/header.json** (schema definition)
```json
{
  "name": "Header",
  "settings": [
    {
      "type": "text",
      "id": "logo_text",
      "label": "Logo Text",
      "info": "Leave blank to use site name"
    }
  ]
}
```

The sidecar JSON file defines settings that site owners can customize. The file name matches the section name.

---

## Step 4: Create the Footer Section

**sections/footer.liquid**
```liquid
<footer class="bg-gray-800 text-white mt-auto">
  <div class="container mx-auto px-4 py-8 text-center">
    <p>&copy; {{ 'now' | date: '%Y' }} {{ site.name }}</p>
  </div>
</footer>
```

**config/sections/footer.json**
```json
{
  "name": "Footer",
  "settings": []
}
```

---

## Step 5: Create the Homepage Template

Create `templates/index.liquid`:

```liquid
<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold text-center mb-8">
    Welcome to {{ site.name }}
  </h1>

  {% if datasets.articles.size > 0 %}
    <section class="mt-12">
      <h2 class="text-2xl font-bold mb-6">Latest Articles</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {% for article in datasets.articles limit: 3 %}
          {% render 'article-card', article: article %}
        {% endfor %}
      </div>
    </section>
  {% endif %}
</div>
```

This template:
- Displays a welcome heading
- Shows the 3 most recent articles using a reusable card snippet

---

## Step 6: Create a Reusable Card Snippet

Snippets are simple partials without settings. Create `snippets/article-card.liquid`:

```liquid
<article class="bg-white rounded-lg shadow-sm overflow-hidden">
  {% if article.image %}
    <img
      src="{{ article.image | img_url: 'medium' }}"
      alt="{{ article.title }}"
      class="w-full h-48 object-cover"
    >
  {% endif %}

  <div class="p-6">
    <h3 class="font-bold text-lg mb-2">
      <a href="{{ article | item_url }}" class="hover:text-blue-600">
        {{ article.title }}
      </a>
    </h3>

    {% if article.excerpt %}
      <p class="text-gray-600 text-sm">
        {{ article.excerpt | truncate_words: 20 }}
      </p>
    {% endif %}
  </div>
</article>
```

Key points:
- The snippet receives `article` as a passed variable
- `{{ article | item_url }}` generates the article's URL
- `{{ article.image | img_url: 'medium' }}` creates a sized image URL

---

## Step 7: Create the Collection Template

For dataset list pages (like `/articles`), create `templates/collection.liquid`:

```liquid
<div class="container mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold mb-8">{{ mount.alias | capitalize }}</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {% for item in collection %}
      {% render 'article-card', article: item %}
    {% else %}
      <p class="col-span-3 text-gray-500 text-center py-12">
        No items found.
      </p>
    {% endfor %}
  </div>

  {% if pagination.total_pages > 1 %}
    {% render 'pagination' %}
  {% endif %}
</div>
```

---

## Step 8: Create the Pagination Snippet

Create `snippets/pagination.liquid`:

```liquid
<nav class="flex justify-center gap-4 mt-12">
  {% if pagination.prev_url %}
    <a href="{{ pagination.prev_url }}" class="px-4 py-2 border rounded">
      ← Previous
    </a>
  {% endif %}

  <span class="px-4 py-2">
    Page {{ pagination.current_page }} of {{ pagination.total_pages }}
  </span>

  {% if pagination.next_url %}
    <a href="{{ pagination.next_url }}" class="px-4 py-2 border rounded">
      Next →
    </a>
  {% endif %}
</nav>
```

**Tip:** This snippet also works inside `{% paginate %}` blocks for paginating any collection:

```liquid
{% paginate datasets.articles by 10 as articles %}
  {% for article in articles %}...{% endfor %}
  {% render 'pagination' %}
{% endpaginate %}
```

---

## Step 9: Create the Article Template

For single items, create `templates/article.liquid`:

```liquid
<article class="container mx-auto px-4 py-12 max-w-3xl">
  <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>

  {% if article.published_at %}
    <time class="text-gray-500">
      {{ article.published_at | date: '%B %d, %Y' }}
    </time>
  {% endif %}

  {% if article.image %}
    <img
      src="{{ article.image | img_url: 'large' }}"
      alt="{{ article.title }}"
      class="w-full rounded-lg mt-8"
    >
  {% endif %}

  <div class="prose mt-8">
    {{ article.content }}
  </div>

  <a href="{{ mount.mount_path }}" class="inline-block mt-8 text-blue-600">
    ← Back to {{ mount.alias }}
  </a>
</article>
```

---

## Step 10: Create the 404 Template

Create `templates/404.liquid`:

```liquid
<div class="container mx-auto px-4 py-24 text-center">
  <h1 class="text-6xl font-bold text-gray-300">404</h1>
  <p class="text-xl mt-4">Page not found</p>
  <a href="/" class="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded">
    Go Home
  </a>
</div>
```

---

## Step 11: Add Basic CSS

Create `assets/theme.css`:

```css
/* Article content styling */
.prose {
  line-height: 1.75;
}

.prose p {
  margin-bottom: 1.25rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}

.prose img {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
```

---

## Step 12: Create Config Files

Create `config/settings_schema.json`:

```json
[
  {
    "name": "General",
    "settings": [
      {
        "type": "text",
        "id": "site_description",
        "label": "Site Description",
        "default": "A website built with Site Swarm"
      }
    ]
  }
]
```

Create `config/settings_data.json`:

```json
{
  "site_description": "A website built with Site Swarm"
}
```

---

## Step 13: Package and Upload

Create a ZIP file of your theme folder:

```
my-theme.zip
├── layout/theme.liquid
├── templates/
│   ├── index.liquid
│   ├── collection.liquid
│   ├── article.liquid
│   └── 404.liquid
├── page_templates/           # Optional: static pages
│   └── about.liquid
├── sections/
│   ├── header.liquid
│   └── footer.liquid
├── snippets/
│   ├── article-card.liquid
│   └── pagination.liquid
├── assets/
│   └── theme.css
└── config/
    ├── settings_schema.json
    ├── settings_data.json
    ├── sections/
    │   ├── header.json
    │   └── footer.json
    └── page_templates/       # Optional: page template schemas
        └── about.json
```

Upload the ZIP through the Site Swarm dashboard:
1. Go to your site's Theme settings
2. Click "Upload Theme"
3. Select your ZIP file
4. Wait for validation
5. Preview your site

---

## Next Steps

Now that you have a working theme:

1. **[Components](components.md)** - Sections, snippets, blocks, drop-ins, and settings
2. **[Content and Routing](content-and-routing.md)** - Templates, page templates, datasets, URL routing
3. **[Liquid Reference](liquid-reference.md)** - Complete templating language reference
4. **[Cheat Sheet](cheat-sheet.md)** - Quick reference card

---

## Complete Example

A complete minimal theme is available in the [examples/minimal-theme](examples/minimal-theme/) directory. This includes all the files from this tutorial plus additional templates and snippets.
