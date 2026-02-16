# Theme Architecture Decision Guide

A decision-tree oriented guide for SiteSwarm theme developers. Covers datasets, templates, sections, snippets, composition patterns, and common use cases — with real examples from three reference themes: **btc-converted** (tree care business), **compass** (business directory), and **digest** (magazine/blog).

---

## Quick Decision Flowchart

```
Do you have a collection of similar items?
├── YES → Do they need their own URL?
│   ├── YES → Routed Dataset (slug_field + item_template)
│   │   └── Should URLs be nested? (e.g., /explore/austin/downtown)
│   │       ├── YES → Parameterized Routes ({% routes %})
│   │       └── NO → mount_path or fallthrough
│   └── NO → Support Dataset (no slug_field, no item_template)
└── NO → Is it site-wide configuration?
    ├── YES → Global Settings (settings_schema.json)
    └── NO → Is it per-page content?
        ├── YES → Page Template with settings
        └── NO → Inline in the template
```

```
Is this UI component reusable?
├── YES → Does it need admin-configurable settings?
│   ├── YES → Section (with sidecar schema)
│   └── NO → Snippet
│       └── Does it need visual variants?
│           ├── YES → Snippet with variant parameter
│           └── NO → Simple snippet
└── NO → Inline code in the template
```

---

## 1. Should This Be a Dataset?

Datasets are JSON collections in `data/datasets/`. They come in three flavors:

### Routed Datasets

Items get their own URL and dedicated template. Requires `slug_field` + `item_template`.

```json
// btc-converted: services dataset
{
  "alias": "services",
  "slug_field": "slug",
  "item_template": "service",
  "records": [
    { "title": "Tree Removal", "slug": "tree-removal", ... }
  ]
}
```

**Result:** `/tree-removal` renders `templates/service.liquid` with `{{ service }}` variable.

| Property | Purpose |
|----------|---------|
| `slug_field` | Which field contains the URL slug |
| `item_template` | Which template renders individual items |
| `mount_path` | Optional URL prefix (e.g., `/blog`, `/explore`) |

**URL routing options:**

| Strategy | Config | URL Pattern | Example Theme |
|----------|--------|-------------|---------------|
| **Fallthrough** | No `mount_path` | `/:slug` | btc-converted (services, locations) |
| **Mounted** | `mount_path: "/blog"` | `/blog/:slug` | digest (posts, events, team) |
| **Parameterized** | `{% routes %}` tag | `/explore/:city/:neighborhood` | digest (locations) |

### Support Datasets

Provide structured data used by templates/sections, but items don't have their own pages.

```json
// btc-converted: why_choose dataset — no slug_field, no item_template
{
  "alias": "why_choose",
  "name": "Why Choose Us Items",
  "records": [
    { "id": "licensed", "label": "Licensed & Insured", "icon": "check-circle" },
    { "id": "estimates", "label": "Free Estimates", "icon": "check-circle" }
  ]
}
```

```json
// digest: sponsors dataset — has slug_field but NO item_template
{
  "alias": "sponsors",
  "slug_field": "slug",
  "description": "Sponsor logos (no routing)"
}
```

### Decision Matrix: Dataset vs Settings vs Content

| Question | Dataset | Settings | Content |
|----------|---------|----------|---------|
| Multiple similar items? | Yes | No | Yes |
| Site owner adds/removes items? | Via admin | Via theme editor | Via CMS |
| Items need their own URL? | Optional | No | Usually |
| Data is structured (fields)? | Yes | Simple values | Rich (posts, authors) |
| Shared across pages? | Yes | Yes | Yes |
| Rails-backed with models? | No | No | Yes |

**Content** (`posts`, `authors`, `tags`) is for first-class CMS entities backed by Rails models. Declare these in `siteswarm.json` under `"content"`:

```json
// compass: siteswarm.json
{
  "content": {
    "authors": { "description": "Content authors for E-E-A-T compliance", "required": true },
    "posts": { "description": "Blog posts with author attribution", "required": true },
    "tags": { "description": "Post categorization tags", "required": false }
  }
}
```

Every dataset in a theme should include **sample records** — they serve as starter content for end users and as implicit schema definitions. Here are examples of each type:

**Routed dataset** with sample records (btc-converted services):

```json
{
  "alias": "services",
  "slug_field": "slug",
  "item_template": "service",
  "records": [
    {
      "title": "Tree Removal",
      "slug": "tree-removal",
      "nav_title": "Tree Removal",
      "description": "Safe and efficient removal of dangerous, diseased, or unwanted trees.",
      "hero_description": "Safe and efficient removal with complete cleanup and debris removal.",
      "image": "images/tree-removal.webp",
      "is_primary": true,
      "benefits": ["Eliminates safety hazards", "Prevents property damage", "Complete cleanup included"],
      "process": [
        { "step": 1, "title": "Site Assessment & Planning" },
        { "step": 2, "title": "Safety Preparation & Equipment Setup" },
        { "step": 3, "title": "Strategic Tree Sectioning" },
        { "step": 4, "title": "Complete Cleanup & Debris Removal" }
      ],
      "why_choose": ["Licensed & Insured", "Professional Equipment", "Emergency Services"]
    }
  ]
}
```

**Support dataset** with sample records (btc-converted why_choose):

```json
{
  "alias": "why_choose",
  "name": "Why Choose Us Items",
  "records": [
    { "id": "licensed", "label": "Licensed & Insured", "icon": "check-circle" },
    { "id": "estimates", "label": "Free Estimates", "icon": "check-circle" },
    { "id": "sameday", "label": "Same-Day Service", "icon": "check-circle" }
  ]
}
```

**Display-only dataset** with sample records (digest sponsors):

```json
{
  "alias": "sponsors",
  "slug_field": "slug",
  "records": [
    { "slug": "acme-corp", "name": "Acme Corp", "logo": "images/sponsors/acme.png", "url": "https://acme.example.com" },
    { "slug": "globex", "name": "Globex Industries", "logo": "images/sponsors/globex.png", "url": "https://globex.example.com" }
  ]
}
```

---

## 2. Templates vs Page Templates

### Templates (`templates/`)

Render dataset items or system pages. The filename matches the `item_template` value from a dataset definition.

```
templates/
├── index.liquid          # Homepage (special)
├── service.liquid        # Renders items from services dataset
├── location.liquid       # Renders items from locations dataset
├── 404.liquid            # Not found (special)
├── search.liquid         # Search results (special)
└── collection.liquid     # Dataset mount listings (special)
```

**Key rule:** The template receives a variable named after `item_template`. `service.liquid` gets `{{ service }}`, `location.liquid` gets `{{ location }}`, `business.liquid` gets `{{ business }}`.

### Page Templates (`page_templates/`)

For static CMS pages with per-page editable settings. Site owners create pages in the admin and pick a page template.

```
page_templates/
├── page.liquid           # Generic page (richtext body)
├── about.liquid          # About page with mission, values, team
└── contact.liquid        # Contact page with form embed
```

Page templates get their settings from a sidecar JSON (`config/page_templates/page.json`) or an inline `{% schema %}` tag:

```liquid
<!-- page_templates/about.liquid (digest) -->
<h1>{{ settings.page_title | default: 'About Us' }}</h1>
<p>{{ settings.mission_statement }}</p>

{% schema %}
{
  "name": "About Page",
  "settings": [
    { "id": "page_title", "type": "text", "label": "Page Title", "default": "About Us" },
    { "id": "mission_statement", "type": "textarea", "label": "Mission Statement" }
  ]
}
{% endschema %}
```

### Decision Matrix

| Question | Template | Page Template |
|----------|----------|---------------|
| Driven by dataset items? | Yes | No |
| Site owner creates instances? | No (developer creates) | Yes (via admin) |
| Content editable in admin? | Dataset fields only | Rich per-page settings |
| Multiple pages from one file? | Yes (one per dataset item) | Yes (one per CMS page) |
| Example | `service.liquid` renders all services | `page.liquid` renders Privacy Policy, Terms |

### Template-Level Settings

Templates (not just page templates) can have settings via sidecar JSON in `config/templates/`:

```json
// btc-converted: config/templates/index.json
{
  "name": "Index",
  "settings": [
    { "type": "text", "id": "seo_title", "label": "SEO Title" }
  ]
}
```

Access in the template as `{{ template.settings.seo_title }}`.

### Template Layout Variants

A single template can support multiple layouts by using a template-level setting and a `{% case %}` switch. This avoids duplicating templates while giving end users layout control.

For example, a homepage could offer "magazine" and "broadsheet" layouts:

```json
// config/templates/index.json
{
  "name": "Index",
  "settings": [
    {
      "type": "select",
      "id": "layout",
      "label": "Homepage Layout",
      "default": "magazine",
      "options": [
        { "value": "magazine", "label": "Magazine (sidebar)" },
        { "value": "broadsheet", "label": "Broadsheet (full-width)" }
      ]
    }
  ]
}
```

```liquid
<!-- templates/index.liquid -->
{% case template.settings.layout %}
{% when 'broadsheet' %}
  {% render 'index-broadsheet' %}
{% else %}
  {% render 'index-magazine' %}
{% endcase %}
```

Each layout variant lives in a snippet (e.g., `snippets/index-magazine.liquid`, `snippets/index-broadsheet.liquid`), keeping the main template clean. This pattern works for any template — homepages, search results, collection listings — wherever the end user should choose between visual presentations.

---

## 3. When to Break Out: Sections, Snippets, or Inline

### Sections

Self-contained UI components with **admin-configurable settings** via sidecar schemas. Used with `{% section 'name' %}`.

**When to use:**
- Component appears on multiple pages or the homepage
- Site owner needs to customize text, images, or behavior
- Template is getting complex — **prefer more modular over less modular**. Even if a component is only used once, extracting it into a section simplifies the parent template and makes future edits easier. When in doubt, break it out.

**Examples across themes:**

| Section | Theme | Purpose |
|---------|-------|---------|
| `hero` | All 3 | Main banner with configurable headline, CTAs |
| `contact` | btc-converted | Contact info + embedded form |
| `testimonials-carousel` | compass | Block-based carousel with dataset fallback |
| `newsletter` | digest | Email signup with configurable text |
| `category-nav` | digest | Horizontal category navigation |
| `sponsors-grid` | digest | Sidebar sponsor logos |

**Anatomy of a section:**

```liquid
<!-- sections/hero.liquid -->
<section class="btc-hero">
  <h1>{{ section.settings.headline | default: 'Welcome' }}</h1>
  <p>{{ section.settings.subheadline }}</p>
</section>
```

```json
// config/sections/hero.json (sidecar schema)
{
  "name": "Hero",
  "settings": [
    { "type": "text", "id": "headline", "label": "Headline", "default": "Welcome" },
    { "type": "textarea", "id": "subheadline", "label": "Subheadline" }
  ]
}
```

### Snippets

Reusable partials that receive data via parameters. Used with `{% render 'name', param: value %}`.

**When to use:**
- Rendering a single item from a dataset (card, row, badge)
- Reusable across multiple templates/sections
- No admin settings needed (data comes from caller)

**Examples across themes:**

| Snippet | Theme | Purpose |
|---------|-------|---------|
| `service-card` | btc-converted | Card for a single service |
| `area-card-image` | btc-converted | Location card with image |
| `icon` | btc-converted, compass | Centralized SVG icon rendering |
| `business-card` | compass | 4-variant business listing card |
| `post-card` | digest | Blog post card |
| `author-byline` | digest | Author name + avatar + date |

### The Variant Pattern

When a snippet needs multiple visual presentations, use a `variant` parameter with `{% case %}`:

```liquid
<!-- compass: snippets/business-card.liquid -->
{% assign card_variant = variant | default: 'default' %}

{% case card_variant %}
{% when 'horizontal' %}
  <!-- Side-by-side layout for list views -->
  <article class="cmp-business-card cmp-business-card--horizontal">
    ...
  </article>

{% when 'compact' %}
  <!-- Minimal card for grids -->
  <article class="cmp-business-card cmp-business-card--compact">
    ...
  </article>

{% when 'featured' %}
  <!-- Premium styling with badge -->
  <article class="cmp-business-card cmp-business-card--featured">
    <div class="cmp-business-card__featured-badge">Featured</div>
    ...
  </article>

{% else %}
  <!-- Default: full card -->
  <article class="cmp-business-card cmp-business-card--default">
    ...
  </article>
{% endcase %}
```

**Usage:**

```liquid
{% render 'business-card', business: business, variant: 'featured' %}
{% render 'business-card', business: business, variant: 'compact' %}
{% render 'business-card', business: business %}  <!-- default -->
```

### Inline Code

Leave code inline only when it's a small, template-specific block. However, **err on the side of extracting** — if a template accumulates multiple inline blocks, it becomes harder to read and maintain. A good rule of thumb: if a template has more than 2-3 inline content blocks, start extracting them into snippets or sections namespaced to that template (e.g., `service-benefits`, `service-process`).

**btc-converted's `service.liquid`** has inline benefits and process blocks. At this scale it's borderline — a more modular approach would extract each into a snippet:

```liquid
<!-- Inline approach (acceptable for 1-2 small blocks) -->
{% if service.benefits.size > 0 %}
<section class="btc-benefits">
  <div class="btc-benefits__grid">
    {% for benefit in service.benefits %}
      <div class="btc-benefits__item">
        {% render 'icon', name: 'check-circle', size: 24 %}
        <p>{{ benefit }}</p>
      </div>
    {% endfor %}
  </div>
</section>
{% endif %}

<!-- More modular approach (preferred when template is complex) -->
{% render 'service-benefits', benefits: service.benefits %}
{% render 'service-process', steps: service.process %}
```

### Decision Tree

```
Is the parent template getting complex (3+ content blocks)?
├── YES → Extract into sections/snippets regardless of reuse
└── NO → Is this code used in more than one place?
    ├── YES → Does it need admin-configurable settings?
    │   ├── YES → Section (with sidecar schema)
    │   └── NO → Snippet
    │       └── Multiple visual presentations?
    │           ├── YES → Snippet with variant parameter
    │           └── NO → Simple snippet with data parameters
    └── NO → Inline it (but reconsider if template grows)
```

**Bias toward modularity.** More modular is almost always better than less modular. Extracting a block into a snippet or section is cheap; debugging a 300-line template is not.

---

## 4. Dataset Design

### Field Types

| Type | Use For | Example |
|------|---------|---------|
| `string` | Short text, slugs, URLs, icons | `"slug": "tree-removal"` |
| `text` | Long text, descriptions | `"description": "Safe and efficient..."` |
| `integer` | Whole numbers, counts | `"review_count": 42` |
| `decimal` | Ratings, coordinates, prices | `"rating": 4.8` |
| `boolean` | Flags, toggles | `"is_primary": true` |
| `date` | Dates without time | `"published_date": "2024-01-15"` |
| `datetime` | Dates with time | `"event_start": "2024-01-15T09:00:00"` |
| `array` | Lists of simple values | `"benefits": ["Fast", "Reliable"]` |
| `json` | Structured nested data | `"process": [{"step": 1, "title": "..."}]` |
| `attachment` | Images, files | `"image": "images/hero.webp"` |
| `attachments` | Multiple images/files | `"gallery": [...]` |

**Invalid types:** `url` (use `string`), `number` (use `integer` or `decimal`), `richtext` (use `text`)

### Complexity Scale

**Minimal** — Support data with no field definitions:

```json
// btc-converted: why_choose (0 field definitions in siteswarm.json)
{
  "alias": "why_choose",
  "records": [
    { "id": "licensed", "label": "Licensed & Insured", "icon": "check-circle" }
  ]
}
```

**Simple** — A few typed fields, no routing:

```json
// btc-converted: additional_services
{
  "alias": "additional_services",
  "fields": [{ "key": "slug", "type": "string" }],
  "records": [
    { "title": "Land Clearing", "order": 1 }
  ]
}
```

**Standard** — Routed with typed fields:

```json
// btc-converted: locations
{
  "alias": "locations",
  "slug_field": "slug",
  "item_template": "location",
  "fields": [
    { "key": "name", "type": "string" },
    { "key": "state", "type": "string" },
    { "key": "is_primary", "type": "boolean" },
    { "key": "image", "type": "attachment" }
  ]
}
```

**Complex** — Routed with arrays, JSON, multiple text fields:

```json
// btc-converted: services
{
  "alias": "services",
  "slug_field": "slug",
  "item_template": "service",
  "fields": [
    { "key": "title", "type": "string" },
    { "key": "hero_description", "type": "text" },
    { "key": "description", "type": "text" },
    { "key": "image", "type": "attachment" },
    { "key": "benefits", "type": "array" },
    { "key": "process", "type": "json" },
    { "key": "why_choose", "type": "array" },
    { "key": "is_primary", "type": "boolean" }
  ]
}
```

**Enterprise** — 30+ fields with geo data, nested structures:

```json
// compass: businesses (abbreviated — 40+ fields)
{
  "alias": "businesses",
  "fields": [
    { "key": "name", "type": "string" },
    { "key": "rating", "type": "decimal" },
    { "key": "review_count", "type": "integer" },
    { "key": "amenities", "type": "array" },
    { "key": "hours", "type": "array" },
    { "key": "geo_latitude", "type": "decimal" },
    { "key": "geo_longitude", "type": "decimal" },
    { "key": "cover_image", "type": "attachment" },
    { "key": "logo", "type": "attachment" }
  ]
}
```

### Relationship Patterns

Datasets relate to each other via **slug references** — a field in one dataset that matches a slug in another:

```json
// digest: posts reference authors via author_slug
{ "title": "How AI is Changing...", "author_slug": "maria-chen", "category_slug": "technology" }
```

```liquid
<!-- Filter posts by author -->
{% assign author_posts = datasets.posts | where: 'author_slug', author.slug %}

<!-- Filter posts by category -->
{% assign category_posts = datasets.posts | where: 'category_slug', category.slug %}
```

### Array vs JSON

| Use `array` when... | Use `json` when... |
|---------------------|--------------------|
| Simple list of strings | Each item has multiple fields |
| `["Fast", "Reliable", "Safe"]` | `[{"step": 1, "title": "Assessment"}]` |
| Rendered with `{% for item in field %}` | Rendered with `{{ item.step }}`, `{{ item.title }}` |

```liquid
<!-- Array: simple iteration -->
{% for benefit in service.benefits %}
  <p>{{ benefit }}</p>
{% endfor %}

<!-- JSON: access nested fields -->
{% for step in service.process %}
  <div>{{ step.step }}. {{ step.title }}</div>
{% endfor %}
```

### Sample Data Requirements

**Every dataset must include sample records.** These serve as:
- Starter content for end users deploying the theme
- Implicit schema definitions showing expected field shapes
- Working data for local development and previews

### End-to-End Example: Dataset to Template

The best way to understand dataset design is to trace a complex record from JSON through to its template. Here's btc-converted's services dataset → service.liquid:

**Dataset record** (`data/datasets/services.json`):

```json
{
  "title": "Tree Removal",
  "slug": "tree-removal",
  "nav_title": "Tree Removal",
  "description": "Safe and efficient removal of dangerous, diseased, or unwanted trees.",
  "hero_description": "Safe and efficient removal with complete cleanup and debris removal.",
  "image": "images/tree-removal.webp",
  "is_primary": true,
  "benefits": [
    "Eliminates safety hazards from dead or diseased trees",
    "Prevents property damage from falling branches",
    "Complete cleanup and debris removal included"
  ],
  "process": [
    { "step": 1, "title": "Site Assessment & Planning" },
    { "step": 2, "title": "Safety Preparation & Equipment Setup" },
    { "step": 3, "title": "Strategic Tree Sectioning" },
    { "step": 4, "title": "Complete Cleanup & Debris Removal" }
  ],
  "why_choose": ["Licensed & Insured", "Professional Equipment", "Emergency Services"]
}
```

**Template** (`templates/service.liquid`) — how each field is consumed:

```liquid
<!-- String fields: direct output -->
<h1>{{ service.title }}</h1>
<p>{{ service.hero_description | default: service.description }}</p>

<!-- Attachment field: through img_url filter -->
<img src="{{ service.image | img_url }}" alt="{{ service.title }}">

<!-- Array field (simple strings): direct iteration -->
{% for benefit in service.benefits %}
  <p>{{ benefit }}</p>
{% endfor %}

<!-- JSON field (structured objects): access nested properties -->
{% for step in service.process %}
  <div>{{ step.step }}. {{ step.title }}</div>
{% endfor %}

<!-- Array field used as list: direct iteration -->
{% for item in service.why_choose %}
  <span>{{ item }}</span>
{% endfor %}

<!-- Boolean field: conditional rendering -->
<!-- (is_primary is used in listing pages to filter, not on detail page) -->

<!-- Cross-dataset reference: accessing another dataset -->
{% for location in datasets.locations %}
  {% if location.is_primary %}
    {% render 'area-card-image', location: location, tagline: service.title %}
  {% endif %}
{% endfor %}
```

Notice how the template uses `{{ service.X }}` — the variable name `service` comes from the dataset's `item_template: "service"` setting.

---

## 5. Blocks vs Datasets for Repeating Content

### Blocks

Admin-editable repeating items **within a section**. Defined in the section's sidecar schema. Best for content that varies per page or is managed through the visual editor.

### Datasets

Developer-defined structured data. Best for content shared across multiple pages or managed in bulk.

### The Fallback Pattern

Compass's `testimonials-carousel.liquid` demonstrates the best practice — **blocks with dataset fallback**:

```liquid
{% assign use_blocks = false %}
{% assign testimonials = datasets.testimonials %}
{% if section.blocks.size > 0 %}
  {% assign use_blocks = true %}
{% endif %}

{% if use_blocks %}
  {% for block in section.blocks %}
    <blockquote>{{ block.settings.content }}</blockquote>
    <span>{{ block.settings.author_name }}</span>
  {% endfor %}
{% else %}
  {% for testimonial in testimonials limit: 6 %}
    <blockquote>{{ testimonial.content }}</blockquote>
    <span>{{ testimonial.author_name }}</span>
  {% endfor %}
{% endif %}
```

**Why this works:**
- In **development** or **initial setup**, the dataset provides sample content immediately
- In **production**, site owners add blocks through the visual editor, overriding the dataset
- No content gap — something always renders

### Decision Matrix

| Question | Use Blocks | Use Dataset |
|----------|-----------|-------------|
| Content varies per page? | Yes | No |
| Managed in visual editor? | Yes | No (JSON files) |
| Shared across multiple pages? | No | Yes |
| Developer provides defaults? | Via presets | Via records |
| 50+ items? | No (blocks are slow) | Yes |

---

## 6. Content Architecture Strategy

The three reference themes demonstrate three distinct strategies:

**Important:** In all strategies below, the **developer builds the framework** (templates, sections, snippets) while the **end user customizes through datasets and settings**. A single theme can serve many different clients — a tree care theme serves different tree service companies by swapping dataset records and settings. A directory theme works for plumbers or financial planners by changing the business dataset. The architecture strategy determines how much editorial (blog/CMS) capability the theme provides on top of dataset-driven pages.

### Dataset-Only: btc-converted

No blog, no authors, no first-class CMS content. All site content is driven by datasets and settings. End users customize by editing dataset records (services, locations) and theme settings (brand name, phone, CTAs).

```
datasets: services, locations, why_choose, property_types, additional_services
content: (none)
pages: homepage + dataset detail pages + generic page template
```

**When to use:** Service businesses, landing pages, single-product sites. These sites don't need a blog or editorial content — the primary content is structured data (services offered, areas served) that changes per client.

**Reusability example:** The same btc-converted theme serves any tree care company. Client A in Austin has 6 services and 8 locations; Client B in Denver has 4 services and 12 locations. Same templates, different dataset records.

### Hybrid: compass

Structured datasets for the core experience (directory listings) plus first-class CMS content for editorial (blog posts with E-E-A-T author attribution).

```
datasets: businesses, categories, locations, faqs, testimonials
content: authors, posts, tags
dropins: announcement, claim-listing-cta, sponsored-listing, trust-bar
```

**When to use:** Sites where the primary value is structured data (directory, marketplace) but that also benefit from editorial content for SEO and user engagement. End users manage listings through datasets and publish blog posts through the CMS.

**Reusability example:** The same compass theme works as a plumber directory, a financial planner directory, or a restaurant guide — swap the business dataset, adjust category records, and update settings.

### Content-Heavy: digest

Rich editorial capabilities with extensive dataset support for navigation, discovery, and structured content like events and team profiles. Blog posts and authors are still managed through the CMS (or modeled as datasets for local dev).

```
datasets: locations, categories, team, sponsors, events, posts, authors
content: blog posts, authors (via CMS in production)
dropins: announcement, footer-disclaimer, newsletter-promo
```

**When to use:** Publications, magazines, news sites, content-marketing sites. The blog and editorial content are the primary offering, supported by structured datasets for categories, events, team pages, and sponsors.

### Choosing Your Strategy

```
Does the site need blog/editorial content?
├── NO → Dataset-Only (btc-converted pattern)
│   └── Datasets + settings drive all pages
│   └── End users customize via dataset records and settings
└── YES → Is editorial the primary content?
    ├── NO → Hybrid (compass pattern)
    │   └── Datasets for core feature + CMS for blog
    └── YES → Content-Heavy (digest pattern)
        └── CMS for editorial + datasets for supporting structure
```

In all cases, datasets are the mechanism for end-user customization. The question is whether the site also needs CMS-managed editorial content (blog posts, authored articles) on top of dataset-driven pages.

---

## 7. Composition Patterns

### Homepage: Pure Section Composition

The homepage is typically a sequence of section calls. This is the simplest and most maintainable pattern.

```liquid
<!-- btc-converted: templates/index.liquid (~10 lines) -->
{% section 'hero' %}
{% section 'services' %}
{% section 'about' %}
{% section 'areas' %}
{% section 'contact' %}
```

```liquid
<!-- digest: templates/index.liquid (sections + inline layout) -->
{% section 'hero' %}
{% section 'category-nav' %}

<div class="dg-layout dg-layout--sidebar">
  <div class="dg-main-content">
    {% section 'featured-posts' %}

    <div class="dg-grid dg-grid--2">
      {% for post in datasets.posts limit: 6 offset: 3 %}
        {% render 'post-card', article: post %}
      {% endfor %}
    </div>
  </div>

  <aside class="dg-sidebar">
    {% section 'newsletter' %}
    {% section 'popular-tags' %}
    {% section 'sponsors-grid' %}
  </aside>
</div>
```

**Pattern:** Homepages range from pure sections (btc-converted) to sections + inline dataset iteration + sidebar layout (digest). Use pure sections when each block is independently configurable. Add inline code when you need layout control between sections.

### Dataset Detail Pages: Hybrid

Dataset detail pages mix inline template code with snippets and sections.

```liquid
<!-- btc-converted: templates/service.liquid -->

<!-- Inline: breadcrumb (one-off) -->
<div class="btc-breadcrumb">
  <a href="/">Back to Services</a>
</div>

<!-- Inline: hero (uses {{ service }} variable directly) -->
<section class="btc-service-hero">
  <h1>{{ service.title }}</h1>
  <p>{{ service.hero_description }}</p>
</section>

<!-- Inline: benefits (template-specific, not reused) -->
{% for benefit in service.benefits %}
  <p>{{ benefit }}</p>
{% endfor %}

<!-- Snippet: area cards (reused on homepage too) -->
{% for location in datasets.locations %}
  {% render 'area-card-image', location: location, tagline: service.title %}
{% endfor %}

<!-- Section: contact (shared across all pages) -->
{% section 'contact' %}
```

**Pattern:** Inline the template-specific content, use snippets for reusable cards, end with shared sections.

### Static Pages: Minimal

Page templates are simple wrappers for admin-editable content.

```liquid
<!-- btc-converted: page_templates/page.liquid -->
<div class="btc-page">
  <h1>{{ settings.title }}</h1>
  {% if settings.show_updated_date and settings.updated_date != blank %}
    <p>Last updated: {{ settings.updated_date }}</p>
  {% endif %}
  <div class="btc-prose">
    {{ settings.body }}
  </div>
</div>
```

### Collection/Mount Pages

When a dataset has `mount_path`, the mount URL renders `collection.liquid` with a list of all items.

```liquid
<!-- digest: templates/collection.liquid -->
{% case mount.alias %}
{% when 'events' %}
  <h1>Upcoming Events</h1>
  {% for item in collection %}
    {% render 'event-card', event: item %}
  {% endfor %}
{% when 'team' %}
  <h1>Our Team</h1>
  {% for item in collection %}
    {% render 'team-card', member: item %}
  {% endfor %}
{% else %}
  {% for item in collection %}
    {% render 'post-card', article: item %}
  {% endfor %}
{% endcase %}
```

---

## 8. Common Use Case Recipes

### Collection vs Item Templates

Every routed dataset involves **two** template contexts:

| Context | Template | Variable | URL | Purpose |
|---------|----------|----------|-----|---------|
| **Item** | Named after `item_template` (e.g., `service.liquid`) | Singular (e.g., `{{ service }}`) | `/:slug` or `/mount/:slug` | Renders a single dataset record |
| **Collection** | `collection.liquid` | `{{ collection }}` (array), `{{ mount }}` | `/mount` (the mount_path URL) | Renders the listing of all records in a mounted dataset |

For example, with `mount_path: "/blog"`:
- `/blog` renders `collection.liquid` with `{{ collection }}` containing all posts and `{{ mount.alias }}` = `"posts"`
- `/blog/my-article` renders `post.liquid` with `{{ post }}` containing the matched record

Fallthrough datasets (no `mount_path`) only have item templates — there's no automatic listing page.

### Blog / Articles

Blog posts and authors are **first-class CMS entities** in SiteSwarm, not custom datasets. They're backed by Rails models and managed through the CMS admin. However, from a **template perspective**, they're accessed identically to datasets — `datasets.posts`, `{{ post.title }}`, etc. This means the templating patterns are the same; the difference is in how content is managed (CMS vs JSON files).

For local development, posts and authors can be modeled as datasets in `data/datasets/` with sample records.

```
Strategy: First-class CMS content (accessed like a dataset in templates)
CMS entities: posts, authors, tags
Template: post.liquid (item), collection.liquid (listing)
mount_path: "/blog"
Supporting: authors for E-E-A-T, categories/tags for filtering
Snippets: post-card, author-byline
Reference: digest
```

### Services

```
Strategy: Routed dataset with fallthrough (no mount_path)
Dataset: services (slug_field: "slug", item_template: "service")
Template: service.liquid
Fields: title, description, hero_description, image, benefits (array), process (json)
Sections: services (grid on homepage)
Snippets: service-card
Reference: btc-converted
```

### Locations / Service Areas

```
Strategy: Routed dataset — fallthrough OR parameterized routes
Dataset: locations (slug_field: "slug", item_template: "location")
Template: location.liquid

For simple sites (btc-converted):
  Fallthrough routing → /leander-tx, /austin-tx

For complex sites (digest):
  Parameterized routes → /explore/:city/:neighborhood
  {% routes %}
  /explore/:city/:neighborhood
  /explore/:city
  {% endroutes %}

Snippets: area-card, location-card
Reference: btc-converted (simple), digest (parameterized)
```

### Team / Staff

```
Strategy: Routed dataset with mount_path
Dataset: team (slug_field: "slug", item_template: "team-member", mount_path: "/team")
Template: team-member.liquid
Fields: name, slug, role, bio, avatar (attachment), social links
Snippets: team-card
Reference: digest
```

### Contact

```
Strategy: Section (not a dataset)
Section: contact.liquid with sidecar schema
Settings: title, subtitle, form_embed_url, social links
Accesses: settings.phone, settings.email, settings.address_line1 (global)
Reference: btc-converted
```

### FAQ

```
Strategy: Support dataset (no routing)
Dataset: faqs (no slug_field, no item_template)
Fields: question, answer, category (optional)
Usage: Iterated in a section or inline
Section: faq-accordion.liquid with dataset fallback
Reference: compass
```

### Testimonials

```
Strategy: Support dataset + blocks fallback
Dataset: testimonials (no slug_field, no item_template)
Fields: content, author_name, author_title, rating, avatar
Section: testimonials-carousel.liquid
Pattern: Check section.blocks first, fall back to dataset
Reference: compass
```

### Business Directory

```
Strategy: Complex routed dataset
Dataset: businesses (slug_field: "slug", item_template: "business")
Template: business.liquid
Fields: 30+ (name, rating, reviews, hours, amenities, geo coords, etc.)
Snippet: business-card with 4 variants (default, horizontal, compact, featured)
Supporting: categories dataset, locations dataset
Reference: compass
```

---

## 9. Quick Reference Tables

### Dataset Complexity Scale

| Level | Fields | Routing | Example |
|-------|--------|---------|---------|
| **Minimal** | 0 defined | None | btc why_choose (labels + icons) |
| **Simple** | 1-3 | None | btc additional_services |
| **Standard** | 4-10 | Fallthrough | btc locations |
| **Complex** | 10-15 | Mounted or fallthrough | btc services, digest posts |
| **Enterprise** | 15+ | Multiple strategies | compass businesses (40+ fields) |

### Section vs Snippet Decision Matrix

| Criterion | Section | Snippet |
|-----------|---------|---------|
| Has admin settings? | Yes (sidecar schema) | No |
| Called with? | `{% section 'name' %}` | `{% render 'name', data: value %}` |
| Receives data from? | `section.settings`, `datasets` | Parameters from caller |
| One per page? | Yes (by default) | No limit |
| Schema file? | `config/sections/name.json` | None |
| Use case | Hero, footer, contact form | Cards, badges, icons |

### Field Type Quick Reference

| You Want... | Use Type | Not... |
|-------------|----------|--------|
| URL | `string` | ~~url~~ |
| Number (whole) | `integer` | ~~number~~ |
| Number (decimal) | `decimal` | ~~float~~ |
| Rich text | `text` | ~~richtext~~ |
| Simple list | `array` | `json` |
| Structured list | `json` | `array` |
| Single image | `attachment` | `string` |
| Multiple images | `attachments` | `array` |

### When to Create New Files

| Situation | Create | Don't Create |
|-----------|--------|--------------|
| Reusable card for dataset items | Snippet | |
| Component with admin settings | Section + sidecar schema | |
| One-off template-specific block | | Inline in template |
| New type of routable content | Dataset + template | |
| Static page (privacy, terms) | Page template | Template |
| Icon or badge | Snippet | Section |
| Variant of existing snippet | | Add `{% case %}` branch |

### Routing Quick Reference

| URL Pattern | Configuration | Template Variable |
|-------------|---------------|-------------------|
| `/:slug` (fallthrough) | No `mount_path` in dataset | Named after `item_template` |
| `/blog/:slug` (mounted) | `mount_path: "/blog"` | Named after `item_template` |
| `/blog` (mount listing) | `mount_path: "/blog"` | `collection`, `mount` |
| `/explore/:city` (param) | `{% routes %}` in template | `city` (top-level) |
| `/explore/:city/:hood` | `{% routes %}` in template | `city`, `hood` (top-level) |

### Global Settings Categories

Based on patterns across all three themes:

| Category | Examples | Access |
|----------|----------|--------|
| Brand | `brand_name`, `tagline`, `logo` | `settings.brand_name` |
| Contact | `phone`, `email`, `address` | `settings.phone` |
| CTA Labels | `cta_call_now`, `cta_get_quote` | `settings.cta_get_quote` |
| Social | `facebook_url`, `instagram_url` | `settings.facebook_url` |
| Display | `enable_dark_mode`, `show_author_credentials` | `settings.enable_dark_mode` |
| Industry | `industry_name`, `service_noun_singular` | `settings.industry_name` |

---

## Appendix: Theme Comparison

| Feature | btc-converted | compass | digest |
|---------|---------------|---------|--------|
| **Category** | Business (tree care) | Directory | Magazine |
| **Datasets** | 5 (2 routed) | 5 (3 routed) | 7 (6 routed) |
| **Content types** | 0 | 3 (authors, posts, tags) | 0 |
| **Drop-ins** | 0 | 4 | 3 |
| **Sections** | 7 | 12+ | 10+ |
| **Snippets** | 9 | 10+ | 8+ |
| **Routing** | Fallthrough only | Fallthrough | Fallthrough + mounted + parameterized |
| **Skins** | Yes | Yes | Yes (11 skins) |
| **i18n** | No | No | Yes |
| **Dark mode** | No | No | Yes |
| **Blocks** | No | Yes (testimonials) | Yes |
| **Snippet variants** | No | Yes (business-card: 4) | No |
| **Page templates** | 1 (generic) | 1+ | 2+ (about, generic) |
| **Complexity** | Low-medium | High | High |
