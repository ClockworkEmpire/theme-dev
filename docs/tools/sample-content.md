# Sample Content

Themes can provide sample content for first-class models (authors, tags, posts, pages, and drop-ins) in addition to custom datasets. This enables theme designers to ship realistic demo content that site owners can import with one click.

---

## Overview

Sample content differs from sample datasets:

| Feature | Sample Datasets | Sample Content |
|---------|-----------------|----------------|
| Location | `data/datasets/*.json` | `data/content/*.json` |
| Purpose | Custom data collections | First-class Rails models |
| Types | Any dataset schema | Authors, Tags, Posts, Pages, Drop-ins |
| References | Independent records | Cross-references (posts → authors, tags) |
| Import Order | Any order | Dependency order (authors first) |

---

## Directory Structure

```
my-theme/
  data/
    datasets/               # Existing - sample custom datasets
      businesses.json
      services.json
    content/                # NEW - sample first-class content
      authors.json          # Import first (posts/pages reference them)
      tags.json             # Import second (posts reference them)
      posts.json            # Import third
      pages.json            # Import fourth
      drop-ins.json         # Import last
```

All files are optional. Include only the content types your theme uses.

---

## Manifest Configuration

Declare content requirements in your `siteswarm.json`:

```json
{
  "name": "Blog Theme",
  "version": "1.0.0",
  "datasets": { ... },
  "content": {
    "authors": {
      "description": "Content authors for E-E-A-T compliance",
      "required": true
    },
    "tags": {
      "description": "Post categorization tags",
      "required": false
    },
    "posts": {
      "description": "Blog posts with author attribution",
      "required": true
    },
    "pages": {
      "description": "Static pages",
      "required": false
    },
    "drop_ins": {
      "description": "Reusable content blocks",
      "required": false
    }
  }
}
```

The `content` section is optional but helps document what content types your theme expects.

---

## File Formats

### authors.json

Authors provide E-E-A-T (Experience, Expertise, Authoritativeness, Trust) metadata for posts and pages.

```json
{
  "records": [
    {
      "slug": "jane-smith",
      "name": "Jane Smith",
      "bio": "Senior editor with 10+ years experience in technology journalism.",
      "job_title": "Senior Editor",
      "organization": "Tech Weekly",
      "email": "jane@example.com",
      "website_url": "https://janesmith.com",
      "credentials": "MA in Journalism, Stanford University",
      "social_links": {
        "twitter": "https://twitter.com/janesmith",
        "linkedin": "https://linkedin.com/in/janesmith"
      }
    },
    {
      "slug": "john-doe",
      "name": "John Doe",
      "bio": "Staff writer covering business and finance.",
      "job_title": "Staff Writer"
    }
  ]
}
```

**Required fields:** `name`

**Optional fields:** `slug` (auto-generated from name if omitted), `bio`, `job_title`, `organization`, `email`, `website_url`, `credentials`, `social_links`

---

### tags.json

Tags categorize posts and enable filtering.

```json
{
  "records": [
    {"name": "Technology", "slug": "technology"},
    {"name": "Business", "slug": "business"},
    {"name": "Tutorials", "slug": "tutorials"},
    {"name": "Case Studies", "slug": "case-studies"}
  ]
}
```

**Required fields:** `name`

**Optional fields:** `slug` (auto-generated from name if omitted)

---

### posts.json

Blog posts with rich text content and references to authors and tags.

```json
{
  "records": [
    {
      "slug": "getting-started",
      "title": "Getting Started with Site Swarm",
      "excerpt": "Learn how to build your first theme with our comprehensive guide.",
      "content": "<p>Welcome to Site Swarm!</p><p>This guide will walk you through...</p>",
      "published_at": "2024-01-15T10:00:00Z",
      "author_slug": "jane-smith",
      "tag_list": "tutorials, technology",
      "schema_type": "BlogPosting"
    },
    {
      "slug": "advanced-theming",
      "title": "Advanced Theming Techniques",
      "excerpt": "Take your themes to the next level with these pro tips.",
      "content": "<h2>Introduction</h2><p>Once you've mastered the basics...</p>",
      "published_at": "2024-02-01T14:30:00Z",
      "author_slug": "jane-smith",
      "tag_list": "tutorials, technology",
      "schema_type": "TechArticle"
    }
  ]
}
```

**Required fields:** `title`, `slug`

**Optional fields:**
- `excerpt` - Short summary for cards/lists
- `content` - HTML rich text content (stored via ActionText)
- `published_at` - ISO 8601 timestamp (omit for draft posts)
- `author_slug` - Reference to an author (must exist in authors.json)
- `tag_list` - Comma-separated tag names
- `schema_type` - JSON-LD type: `Article`, `BlogPosting`, `NewsArticle`, or `TechArticle` (default: `BlogPosting`)

---

### pages.json

Static pages with optional page templates and author attribution.

> **Theme builders SHOULD provide sample pages in `data/content/pages.json`.** These pages are imported when a site owner activates the theme, giving them starter content they can immediately edit from the dashboard. This is the correct way to provide static pages — not by creating individual template files.

The one-to-many pattern: **one page_template, many Page records.** A theme with a single `page_templates/page.liquid` can power About, Contact, Privacy, Terms, and any other static page the site owner creates.

```json
{
  "records": [
    {
      "slug": "about",
      "title": "About Us",
      "content": "<p>We are a team of passionate developers building tools for the modern web.</p>",
      "page_template": "page",
      "position": 1,
      "schema_type": "AboutPage",
      "settings": {
        "headline": "Our Story",
        "show_team": true
      }
    },
    {
      "slug": "contact",
      "title": "Contact Us",
      "content": "<p>Get in touch with our team.</p>",
      "page_template": "page",
      "position": 2,
      "schema_type": "ContactPage"
    },
    {
      "slug": "privacy",
      "title": "Privacy Policy",
      "content": "<p>Your privacy is important to us. This policy outlines how we handle your data.</p>",
      "page_template": "page",
      "position": 3,
      "schema_type": "WebPage"
    },
    {
      "slug": "terms",
      "title": "Terms of Service",
      "content": "<p>By using our services, you agree to the following terms and conditions.</p>",
      "page_template": "page",
      "position": 4,
      "schema_type": "WebPage"
    }
  ]
}
```

**Required fields:** `title`, `slug`

**Optional fields:**
- `content` - HTML rich text content
- `author_slug` - Reference to an author
- `page_template` - Links to `page_templates/{name}.liquid`
- `position` - Display order for navigation
- `schema_type` - JSON-LD type: `WebPage`, `AboutPage`, `ContactPage`, or `FAQPage` (default: `WebPage`)
- `settings` - Page-specific settings for template rendering

---

### drop-ins.json

Reusable content blocks that can be embedded in templates.

```json
{
  "records": [
    {
      "name": "footer-disclaimer",
      "content": "<p>All rights reserved. Content is for informational purposes only.</p>"
    },
    {
      "name": "copyright-notice",
      "content": "<p>&copy; 2024 Company Name. All rights reserved.</p>"
    },
    {
      "name": "promo-banner",
      "content": "<div class=\"promo\"><p>Special offer: Use code WELCOME for 20% off!</p></div>"
    }
  ]
}
```

**Required fields:** `name`, `content`

**Name format:** Lowercase alphanumeric with hyphens (e.g., `footer-disclaimer`)

---

## Cross-References

Posts and pages can reference authors via `author_slug`. The import service resolves these references automatically:

```
authors.json: { "slug": "jane-smith", "name": "Jane Smith" }
posts.json:   { "author_slug": "jane-smith", ... }
                     ↓
              Resolved to Author record
```

Posts can reference tags via `tag_list` (comma-separated):

```
tags.json:    { "name": "Technology", "slug": "technology" }
posts.json:   { "tag_list": "Technology, Tutorials", ... }
                      ↓
              Resolved to Tag records
```

**Import order ensures references work:**
1. Authors imported first
2. Tags imported second
3. Posts can reference both
4. Pages can reference authors
5. Drop-ins are standalone

---

## Local Development

The theme dev server loads sample content and makes it available in templates:

```liquid
{% comment %} Access authors {% endcomment %}
{% for author in authors %}
  <div class="author-card">
    <h3>{{ author.name }}</h3>
    <p>{{ author.bio }}</p>
  </div>
{% endfor %}

{% comment %} Lookup by slug {% endcomment %}
{{ authors["jane-smith"].name }}

{% comment %} Access posts with resolved references {% endcomment %}
{% for post in posts %}
  <article>
    <h2>{{ post.title }}</h2>
    <p>By {{ post.author.name }}</p>
    {% for tag in post.tags %}
      <span class="tag">{{ tag.name }}</span>
    {% endfor %}
  </article>
{% endfor %}

{% comment %} Access pages {% endcomment %}
{% for page in pages %}
  <a href="{{ page.url }}">{{ page.title }}</a>
{% endfor %}

{% comment %} Access tags {% endcomment %}
{% for tag in tags %}
  <a href="{{ tag.url }}">{{ tag.name }}</a>
{% endfor %}
```

**Computed fields added by dev server:**
- Posts: `url` (/blog/{slug}), `author` (resolved), `tags` (resolved array)
- Pages: `url` (/{slug}), `author` (resolved), `id`, `content`, `position`, `schema_type`, `created_at`, `updated_at`
- Authors: `display_name` (name + job title)
- Tags: `url` (/tags/{slug})

### Page Routing

Pages in `pages.json` are also routable by slug. Visiting `/about` renders the page record through its assigned `page_template`:

```json
{"slug": "about", "title": "About Us", "page_template": "page"}
```

- `/about` → renders `page_templates/page.liquid` with the page record as `{{ page }}`
- Page record settings are merged with the page_template's schema defaults

This means multiple pages (about, contact, faqs) can share a single `page_templates/page.liquid` template — the most common pattern. See [Content and Routing](../content-and-routing.md) for full details.

---

## Linting

The theme linter validates sample content files:

```bash
swarm lint /path/to/theme
```

**Validations performed:**

| Content Type | Required Fields | Warnings |
|--------------|-----------------|----------|
| Authors | `name` | - |
| Tags | `name` | - |
| Posts | `title`, `slug` | Invalid `author_slug`, invalid `schema_type` |
| Pages | `title`, `slug` | Invalid `author_slug`, invalid `schema_type` |
| Drop-ins | `name`, `content` | Invalid name format |

**Example lint output:**

```
Issues found:
  - Post at index 0 is missing required field 'title'
  - Drop-in 'Footer Disclaimer' has invalid name format. Use lowercase alphanumeric with hyphens.

Warnings:
  - Post 'my-post' references unknown author 'unknown-author'
  - Page 'about' has invalid schema_type 'CustomPage'. Valid: WebPage, AboutPage, ContactPage, FAQPage
```

---

## Importing to Production

When a theme with sample content is uploaded to Site Swarm:

1. Sample content files are extracted and stored with the theme version
2. On the theme detail page, an "Import Sample Content" option appears
3. Site owners can import all content types with one click
4. Import respects dependency order (authors → tags → posts → pages → drop-ins)
5. References are automatically resolved

**For theme designers:**
- Provide realistic, well-written sample content
- Include author bios and credentials for E-E-A-T
- Tag posts appropriately for your theme's topic
- Include pages that match your theme's page templates
- Use meaningful content in drop-ins (not lorem ipsum)

---

## Best Practices

### 1. Match Your Theme's Purpose

A photography theme should have photography-related posts and authors with photography credentials. A business directory theme should have industry-appropriate content.

### 2. Use Realistic Content

Replace lorem ipsum with actual meaningful content:
- Real-sounding author names and bios
- Descriptive post titles and excerpts
- Actual formatted content (headers, lists, emphasis)

### 3. Showcase Features

Include content that demonstrates your theme's capabilities:
- Multiple authors if your theme has author pages
- Various tags if your theme has tag filtering
- Posts with different content lengths
- Pages using each of your page templates

### 4. Keep It Focused

5-10 posts, 2-3 authors, 5-8 tags, and 3-5 pages is usually sufficient. Quality over quantity.

### 5. Test Import

Before releasing your theme:
1. Upload to a test account
2. Import the sample content
3. Verify all references resolved correctly
4. Check that content displays properly

---

## See Also

- [README](../README.md) - Theme structure and key concepts
- [Linting](./linting.md) - Validation and auto-fix
- [Content and Routing](../content-and-routing.md) - Templates, page templates, datasets
