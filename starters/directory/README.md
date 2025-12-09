# Directory Starter Theme

A production-ready business directory theme for HostNet. Features local business listings, blog/articles, contact pages, and a complete skinning system.

## Quick Start

```bash
# From the hostnet repository root
bin/theme-dev lib/theme_dev_server/starters/directory

# Visit http://localhost:4000
# Try different skins: http://localhost:4000/?skin=warm
```

## Theme Structure

```
directory/
├── assets/
│   ├── theme.css              # Design system with CSS custom properties
│   └── skins/                 # Color scheme variants
│       ├── warm.css           # Amber/orange scheme
│       ├── cool.css           # Teal/cyan scheme
│       └── forest.css         # Green nature scheme
│
├── config/
│   ├── settings_schema.json   # Theme settings definition
│   └── settings_data.json     # Default setting values
│
├── data/                      # Mock data for development
│   ├── site.json              # Site info + skin selection
│   └── datasets/
│       ├── businesses.json    # Business listings dataset
│       └── articles.json      # Blog articles dataset
│
├── layout/
│   └── theme.liquid           # Base HTML wrapper
│
├── sections/
│   ├── header.liquid          # Site navigation
│   ├── footer.liquid          # Site footer with links
│   ├── hero-search.liquid     # Homepage hero with search
│   └── featured-listings.liquid # Featured businesses grid
│
├── snippets/
│   ├── business-card.liquid   # Business listing card
│   ├── article-card.liquid    # Blog article card
│   ├── rating-stars.liquid    # Star rating display
│   ├── icon.liquid            # SVG icon helper
│   └── pagination.liquid      # Pagination controls
│
└── templates/
    ├── index.liquid           # Homepage
    ├── collection.liquid      # Dataset list (businesses)
    ├── business.liquid        # Single business page
    ├── blog.liquid            # Blog listing
    ├── article.liquid         # Single article page
    ├── about.liquid           # About page
    ├── contact.liquid         # Contact page
    ├── privacy.liquid         # Privacy policy
    ├── terms.liquid           # Terms of use
    ├── page.liquid            # Generic page template
    └── 404.liquid             # Not found page
```

## Skinning System

The theme uses CSS custom properties for all colors, making it easy to create color variants.

### Available Skins

| Skin | Description | Preview URL |
|------|-------------|-------------|
| `default` | Professional blue | `http://localhost:4000/` |
| `warm` | Amber/orange, earthy | `http://localhost:4000/?skin=warm` |
| `cool` | Teal/cyan, professional | `http://localhost:4000/?skin=cool` |
| `forest` | Green, natural | `http://localhost:4000/?skin=forest` |

### Setting the Default Skin

Edit `data/site.json`:

```json
{
  "name": "Local Directory",
  "skin": "warm",
  "available_skins": ["default", "warm", "cool", "forest"]
}
```

### Creating a Custom Skin

1. Create a new CSS file in `assets/skins/`:

```css
/* assets/skins/sunset.css */
:root {
  /* Brand colors */
  --color-primary: #f97316;
  --color-primary-hover: #ea580c;
  --color-primary-light: #ffedd5;

  /* Surface colors */
  --color-bg-page: #fffbeb;
  --color-bg-card: #ffffff;
  --color-bg-header: #7c2d12;
  --color-bg-footer: #431407;
  --color-bg-hero: #7c2d12;

  /* Override any other variables as needed */
}
```

2. Add to available skins in `data/site.json`:

```json
{
  "available_skins": ["default", "warm", "cool", "forest", "sunset"]
}
```

3. Preview: `http://localhost:4000/?skin=sunset`

### CSS Custom Properties Reference

The theme defines these categories of variables in `assets/theme.css`:

| Category | Variables | Purpose |
|----------|-----------|---------|
| Brand | `--color-primary`, `--color-primary-hover`, `--color-primary-light` | Primary action colors |
| Semantic | `--color-success`, `--color-warning`, `--color-danger` + `-light` variants | Status colors |
| Neutral | `--color-neutral-50` through `--color-neutral-900` | Gray scale |
| Surfaces | `--color-bg-page`, `--color-bg-card`, `--color-bg-header`, etc. | Background colors |
| Text | `--color-text-primary`, `--color-text-secondary`, `--color-text-muted` | Text colors |
| Typography | `--font-size-*`, `--font-weight-*`, `--line-height-*` | Type scale |
| Spacing | `--space-1` through `--space-24` | Spacing scale |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` | Border radius |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Box shadows |

## Dataset Configuration

### Business Listings (`data/datasets/businesses.json`)

```json
{
  "alias": "businesses",
  "mount_path": "/listings",
  "slug_field": "slug",
  "list_template": "collection",
  "item_template": "business",
  "schema": {
    "name": "company",
    "slug": "slug",
    "description": "paragraph",
    "category": { "type": "enum", "values": ["Plumbing", "Electrical", ...] },
    "address": "street_address",
    "phone": "phone",
    "email": "email",
    "featured": "boolean",
    "rating": { "type": "float", "min": 1, "max": 5 }
  },
  "records": [
    {
      "name": "Precision Plumbing",
      "slug": "precision-plumbing",
      "lat": 39.7817,
      "lng": -89.6501,
      "google_place_id": "ChIJd8BlQ2BZwokRAFUEcm_qrcA",
      "google_business_url": "https://maps.google.com/?cid=...",
      ...
    }
  ]
}
```

### Google Maps Integration

Business records support multiple ways to display maps:

| Field | Purpose | Example |
|-------|---------|---------|
| `google_place_id` | Best for embedding - use Place ID from Google | `ChIJd8BlQ2BZwokRAFUEcm_qrcA` |
| `lat`, `lng` | Coordinate-based embed | `39.7817`, `-89.6501` |
| `google_business_url` | Link to Google Business Profile | `https://maps.google.com/?cid=...` |
| `address`, `city`, `state`, `zip` | Fallback address search | Combined for geocoding |

Priority order: `google_place_id` > `lat/lng` > `address`

### Blog Articles (`data/datasets/articles.json`)

```json
{
  "alias": "articles",
  "mount_path": "/blog",
  "slug_field": "slug",
  "list_template": "blog",
  "item_template": "article",
  "records": [
    {
      "title": "How to Choose a Contractor",
      "slug": "how-to-choose-contractor",
      "excerpt": "Tips for finding reliable service providers...",
      "content": "<p>Full article content...</p>",
      "author": "Sarah Johnson",
      "published_at": "2024-01-15"
    }
  ]
}
```

## Template Conventions

### Generic `item` Variable

All templates use the generic `item` variable for dataset records, making the theme portable across different data types:

```liquid
{% comment %} In collection.liquid {% endcomment %}
{% for item in collection %}
  {% hostnet_render 'business-card', item: item %}
{% endfor %}

{% comment %} In business.liquid (single item) {% endcomment %}
<h1>{{ item.name }}</h1>
<p>{{ item.description }}</p>
```

Snippets accept `item:` parameter:

```liquid
{% hostnet_render 'business-card', item: business %}
{% hostnet_render 'article-card', item: post %}
```

### URL Generation

Use the `item_url` filter to generate URLs:

```liquid
<a href="{{ item | item_url }}">{{ item.name }}</a>
```

This uses the `_mount_path` injected into each record.

## Semantic CSS Classes

The theme provides semantic CSS classes that use the design tokens. Use these instead of inline styles:

### Typography

```html
<h1 class="heading-1">Page Title</h1>
<h2 class="heading-2">Section Title</h2>
<p class="text-lg">Lead paragraph</p>
<p class="text-secondary">Secondary text</p>
<span class="text-muted">Muted text</span>
```

### Buttons

```html
<a class="btn btn-primary">Primary Action</a>
<a class="btn btn-secondary">Secondary</a>
<a class="btn btn-outline">Outline</a>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Cards

```html
<div class="card">
  <div class="card-body">
    <h3 class="heading-5">Card Title</h3>
    <p class="text-secondary">Card content</p>
  </div>
</div>
```

### Badges

```html
<span class="badge badge-featured">Featured</span>
<span class="badge badge-verified">Verified</span>
<span class="badge badge-category">Category</span>
```

### Layout

```html
<div class="container">Centered content with max-width</div>
<section class="section">Standard vertical padding</section>
<section class="section-lg">Large vertical padding</section>
<div class="bg-page">Page background color</div>
<div class="bg-hero">Hero/header background</div>
```

## Tailwind Usage

Tailwind is used ONLY for layout utilities:

- Flexbox/Grid: `flex`, `grid`, `grid-cols-*`, `gap-*`
- Spacing: `p-*`, `m-*`, `px-*`, `py-*`
- Responsive: `sm:`, `md:`, `lg:`, `xl:`
- Sizing: `w-*`, `h-*`, `max-w-*`

Colors, typography, and component styling use the semantic CSS classes.

## Development Tips

### Live Reload

The dev server includes live reload. Edit any file and the browser refreshes automatically.

### Cache Clearing

Template and data caches are cleared on file changes. If you need to force a reload, restart the dev server.

### Adding New Pages

1. Create `templates/page-name.liquid`
2. Visit `http://localhost:4000/page-name`

### Adding New Datasets

1. Create `data/datasets/your-dataset.json`
2. Configure `mount_path`, `slug_field`, and templates
3. Reference in templates via `datasets.your_dataset`

## Production Notes

When deploying to HostNet production:

1. **Skin selection**: Site owners set skin via site settings, not URL params
2. **Data source**: Datasets come from the database, not JSON files
3. **Assets**: Served from CDN with proper caching headers
4. **Maps API**: Requires a Google Maps Embed API key

## License

This theme is part of HostNet and follows the project's licensing terms.
