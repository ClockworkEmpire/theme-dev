# Section Blocks Specification

## Overview

Section blocks are **repeatable data items** within a section. They allow site owners to add, remove, and reorder structured content (team members, FAQ items, pricing tiers, etc.) without editing theme code.

---

## What Are Blocks?

**Blocks are pure data, not a new file type.**

| Concept | Type | Location | Purpose |
|---------|------|----------|---------|
| Sections | `.liquid` files | `sections/` | Configurable page components with settings |
| Snippets | `.liquid` files | `snippets/` | Simple reusable partials |
| Dropins | User HTML | Dashboard | Owner-managed content injection |
| **Blocks** | **JSON data** | **`settings.sections.{name}.blocks`** | **Repeatable items within a section** |

Blocks are NOT rendered independently - they're iterated over BY a section's Liquid template.

---

## Developer Experience

### 1. Define Block Schema (in section's `{% schema %}`)

```liquid
<!-- sections/team.liquid -->
<div class="team-grid">
  {% for block in section.blocks %}
    {% if block.type == 'member' %}
      <div class="team-card">
        <img src="{{ block.settings.photo | img_url: 'medium' }}" alt="{{ block.settings.name }}">
        <h3>{{ block.settings.name }}</h3>
        <p>{{ block.settings.role }}</p>
      </div>
    {% endif %}
  {% endfor %}
</div>

{% schema %}
{
  "name": "Team",
  "settings": [
    { "type": "text", "id": "title", "label": "Section Title", "default": "Our Team" }
  ],
  "blocks": [
    {
      "type": "member",
      "name": "Team Member",
      "settings": [
        { "type": "image_picker", "id": "photo", "label": "Photo" },
        { "type": "text", "id": "name", "label": "Name", "default": "John Doe" },
        { "type": "text", "id": "role", "label": "Role", "default": "Developer" },
        { "type": "url", "id": "linkedin", "label": "LinkedIn URL" }
      ]
    }
  ]
}
{% endschema %}
```

### 2. Populate Block Data (in settings)

**For production** (`config/settings_data.json`):
```json
{
  "current": {
    "sections": {
      "team": {
        "type": "team",
        "settings": { "title": "Meet Our Team" },
        "blocks": [
          {
            "type": "member",
            "settings": {
              "name": "Caleb Christopher",
              "role": "CEO & Founder",
              "linkedin": "https://linkedin.com/in/caleb"
            }
          },
          {
            "type": "member",
            "settings": {
              "name": "Aubrey Autumn",
              "role": "Marketing Director",
              "linkedin": "https://linkedin.com/in/aubrey"
            }
          }
        ]
      }
    }
  }
}
```

**For local development** (`data/settings.json`):
```json
{
  "sections": {
    "team": {
      "type": "team",
      "settings": { "title": "Meet Our Team" },
      "blocks": [
        { "type": "member", "settings": { "name": "Caleb Christopher", "role": "CEO & Founder" } },
        { "type": "member", "settings": { "name": "Aubrey Autumn", "role": "Marketing Director" } }
      ]
    }
  }
}
```

### 3. Render Blocks (in section template)

```liquid
{% for block in section.blocks %}
  {% case block.type %}
    {% when 'member' %}
      <div class="team-card">{{ block.settings.name }}</div>
    {% when 'advisor' %}
      <div class="advisor-card">{{ block.settings.name }}</div>
  {% endcase %}
{% endfor %}
```

---

## Block Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  settings_data.json (production) / data/settings.json (local dev)  │
│                                                                     │
│  {                                                                  │
│    "sections": {                                                    │
│      "team": {                                                      │
│        "blocks": [ { "type": "member", "settings": {...} } ]        │
│      }                                                              │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HostNet Platform / Dev Server                                      │
│                                                                     │
│  Reads settings, injects into `section` context                     │
│  section.blocks = [ { type: "member", settings: {...} } ]           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  sections/team.liquid                                               │
│                                                                     │
│  {% for block in section.blocks %}                                  │
│    {{ block.type }}              → "member"                         │
│    {{ block.settings.name }}     → "Caleb Christopher"              │
│  {% endfor %}                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Blocks vs Datasets

| Aspect | Blocks | Datasets |
|--------|--------|----------|
| **Purpose** | Section-scoped repeatable items | Site-wide content collections |
| **Quantity** | Small arrays (2-20 items) | Potentially hundreds/thousands |
| **Pagination** | No | Yes |
| **Storage** | Theme settings JSON | Separate data store |
| **URL routing** | No | Yes (`/blog/my-post`) |
| **Editing** | Theme customizer UI | Content management UI |
| **Use case** | Team members, FAQ items, pricing tiers, nav links | Blog posts, products, listings |

**Rule of thumb:**
- If it's theme configuration (owner picks which items to show) → **Blocks**
- If it's content management (owner creates/edits content) → **Datasets**

---

## Multiple Block Types Per Section

Sections can define multiple block types:

```liquid
{% schema %}
{
  "name": "Testimonials",
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        { "type": "text", "id": "name", "label": "Name" },
        { "type": "textarea", "id": "quote", "label": "Quote" },
        { "type": "range", "id": "stars", "label": "Rating", "min": 1, "max": 5, "default": 5 }
      ]
    },
    {
      "type": "video_testimonial",
      "name": "Video Testimonial",
      "settings": [
        { "type": "text", "id": "name", "label": "Name" },
        { "type": "url", "id": "video_url", "label": "Video URL" }
      ]
    }
  ]
}
{% endschema %}
```

Render with type filtering:
```liquid
{% for block in section.blocks %}
  {% if block.type == 'testimonial' %}
    <div class="text-testimonial">...</div>
  {% elsif block.type == 'video_testimonial' %}
    <div class="video-testimonial">...</div>
  {% endif %}
{% endfor %}
```

---

## Empty State Handling

Always handle empty blocks gracefully:

```liquid
{% if section.blocks.size > 0 %}
  <div class="team-grid">
    {% for block in section.blocks %}
      ...
    {% endfor %}
  </div>
{% else %}
  <!-- Fallback for local dev / empty state -->
  <p class="team-empty">No team members configured.</p>
{% endif %}
```

Or provide hardcoded fallback content for local development:

```liquid
{% if section.blocks.size > 0 %}
  {% for block in section.blocks %}
    <div class="team-card">{{ block.settings.name }}</div>
  {% endfor %}
{% else %}
  <!-- Local dev fallback -->
  <div class="team-card">John Doe - CEO</div>
  <div class="team-card">Jane Smith - CTO</div>
{% endif %}
```

---

## Implementation Requirements

For section blocks to work, HostNet dev server needs to:

1. **Read `data/settings.json`** and look for `sections` object
2. **Match section name** from `{% section 'team' %}` to `settings.sections.team`
3. **Inject blocks array** into `section.blocks` context variable
4. **Inject section settings** into `section.settings` context variable

The section schema in `{% schema %}` defines the STRUCTURE (what fields blocks can have).
The settings JSON defines the DATA (actual block instances with values).

---

## Example: Full Team Section

**sections/team.liquid:**
```liquid
<section class="team-section">
  <div class="container">
    <h2>{{ section.settings.title | default: 'Our Team' }}</h2>

    {% if section.blocks.size > 0 %}
      <div class="team-grid">
        {% for block in section.blocks %}
          {% if block.type == 'member' %}
            <div class="team-card">
              {% if block.settings.photo %}
                <img src="{{ block.settings.photo | img_url: 'medium' }}"
                     alt="{{ block.settings.name }}">
              {% endif %}
              <h3>{{ block.settings.name }}</h3>
              <p>{{ block.settings.role }}</p>
              {% if block.settings.linkedin %}
                <a href="{{ block.settings.linkedin }}">LinkedIn</a>
              {% endif %}
            </div>
          {% endif %}
        {% endfor %}
      </div>
    {% else %}
      <p>Team members will appear here when configured.</p>
    {% endif %}
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
        { "type": "text", "id": "role", "label": "Role", "default": "Developer" },
        { "type": "url", "id": "linkedin", "label": "LinkedIn URL" }
      ]
    }
  ]
}
{% endschema %}
```

**data/settings.json:**
```json
{
  "sections": {
    "team": {
      "type": "team",
      "settings": {
        "title": "Meet Our Awesome Team"
      },
      "blocks": [
        {
          "type": "member",
          "settings": {
            "name": "Caleb Christopher",
            "role": "CEO & Founder",
            "linkedin": "https://linkedin.com/in/caleb"
          }
        },
        {
          "type": "member",
          "settings": {
            "name": "Aubrey Autumn",
            "role": "Marketing Director",
            "linkedin": "https://linkedin.com/in/aubrey"
          }
        }
      ]
    }
  }
}
```
