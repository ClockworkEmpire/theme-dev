# A/B Testing Themes

Test different versions of your templates against each other to see which converts better. Same URL, same data, different templates served to different visitors.

---

## How It Works

1. You build **one theme** that contains both template variants
2. The original template is the **control** (e.g., `templates/index.liquid`)
3. Variant templates live alongside it (e.g., `templates/index-b.liquid`)
4. The platform randomly assigns visitors to a variant and keeps them there (sticky cookies)
5. You track conversions via URL goals (visitor reaches `/thank-you`) or JavaScript events

The key concept: **A/B testing swaps templates, not data.** Both variants render the same datasets, pages, and site content — they just present it differently.

---

## Building a Testable Theme

### Step 1: Start with the Control

Build your theme normally. The primary template is your control variant:

```
my-theme/
├── templates/
│   └── index.liquid          ← Control template
├── sections/
│   ├── hero.liquid
│   ├── features.liquid
│   ├── pricing.liquid
│   └── faq.liquid
```

Your control `templates/index.liquid`:

```liquid
{% section 'hero' %}
{% section 'features' %}
{% section 'pricing' %}
{% section 'faq' %}
```

### Step 2: Create Variant Sections

Copy the sections you want to change and give them a variant suffix. Keep the same CSS classes and HTML structure — change the **copy, layout, or emphasis**.

```
my-theme/
├── sections/
│   ├── hero.liquid           ← Control version
│   ├── hero-b.liquid         ← Variant B version
│   ├── features.liquid
│   ├── features-b.liquid
│   ├── pricing.liquid        ← Same in both? Don't duplicate.
│   └── faq.liquid            ← Same in both? Don't duplicate.
```

**Only duplicate sections that actually differ.** If pricing and FAQ are the same in both variants, use the originals in both templates.

### Step 3: Create the Variant Template

Create a new template file for the variant that references its own sections:

`templates/index-b.liquid`:

```liquid
{% section 'hero-b' %}
{% section 'features-b' %}
{% section 'pricing' %}
{% section 'faq' %}
```

Notice `pricing` and `faq` use the original sections — only the sections with different copy use the `-b` suffix.

### Final Structure

```
my-theme/
├── siteswarm.json
├── layout/
│   └── theme.liquid
├── templates/
│   ├── index.liquid          ← Control (variant A)
│   ├── index-b.liquid        ← Variant B
│   └── 404.liquid
├── sections/
│   ├── hero.liquid           ← Control hero
│   ├── hero-b.liquid         ← Variant B hero
│   ├── features.liquid       ← Control features
│   ├── features-b.liquid     ← Variant B features
│   ├── pricing.liquid        ← Shared (same in both)
│   ├── faq.liquid            ← Shared (same in both)
│   ├── nav.liquid
│   └── footer.liquid
├── assets/
│   └── theme.css             ← One CSS file covers both variants
├── config/
│   ├── settings_schema.json
│   ├── settings_data.json
│   └── sections/
│       ├── hero.json
│       ├── hero-b.json       ← Variant needs its own schema too
│       ├── features.json
│       └── features-b.json
```

---

## Section Settings for Variants

Each variant section gets its own schema file in `config/sections/`. If the control hero has settings (eyebrow text, heading, CTA label), the variant hero needs its own schema with its own defaults:

`config/sections/hero.json` (control):
```json
{
  "name": "Hero",
  "settings": [
    { "id": "eyebrow", "type": "text", "default": "For Digital Agencies" },
    { "id": "heading", "type": "text", "default": "Your AI Operating System" }
  ]
}
```

`config/sections/hero-b.json` (variant):
```json
{
  "name": "Hero (Variant B)",
  "settings": [
    { "id": "eyebrow", "type": "text", "default": "Stop Babysitting AI Tools" },
    { "id": "heading", "type": "text", "default": "AI That Actually Does the Work" }
  ]
}
```

---

## Naming Conventions

| Element | Control | Variant B | Variant C |
|---------|---------|-----------|-----------|
| Template | `templates/index.liquid` | `templates/index-b.liquid` | `templates/index-c.liquid` |
| Sections | `sections/hero.liquid` | `sections/hero-b.liquid` | `sections/hero-c.liquid` |
| Section schemas | `config/sections/hero.json` | `config/sections/hero-b.json` | `config/sections/hero-c.json` |

Use lowercase letters for variants: `-b`, `-c`, `-d`. These correspond to the variant **key** in the A/B test dashboard.

---

## Datasets in A/B Tests

A/B testing operates at the **template layer**, not the data layer. Both variants receive the same dataset records. This is usually what you want — test how different layouts or copy present the same content.

### When Both Variants Use the Same Dataset

This is the default and most common case. If your control and variant both render an articles collection, they both get the same articles. Only the HTML/layout differs.

```liquid
{%- comment -%} sections/articles-grid.liquid (control: card layout) {%- endcomment -%}
{% for article in datasets.articles %}
  <div class="card">{{ article.title }}</div>
{% endfor %}

{%- comment -%} sections/articles-grid-b.liquid (variant: list layout) {%- endcomment -%}
{% for article in datasets.articles %}
  <div class="list-item">{{ article.title }} — {{ article.excerpt }}</div>
{% endfor %}
```

### When Variant Copy Lives in Sections (Not Datasets)

If your variants differ primarily in **marketing copy** (headlines, body text, CTAs), put that copy directly in the section HTML or section settings — not in a dataset. This is the cleanest approach for landing page tests.

**Do this:**
```liquid
{%- comment -%} sections/hero.liquid — conversational copy {%- endcomment -%}
<h1>Your AI doesn't have to suck.</h1>
<p>Most agencies are standing on the chatbot side, waving across...</p>

{%- comment -%} sections/hero-b.liquid — refined copy {%- endcomment -%}
<h1>AI That Actually Does the Work</h1>
<p>There's a massive gap between "we use AI" and "AI does the work."</p>
```

**Avoid this** (using datasets for variant-specific copy):
```
datasets/
├── hero-content/        ← Don't split copy into datasets per variant
│   └── conversational/
│   └── refined/
```

Datasets are for **site content** (articles, products, listings). Variant-specific marketing copy belongs in the sections themselves.

### Datasets with Identical Names Across Themes

If you're merging two separate themes (each with their own datasets of the same name) into one testable theme, the datasets merge naturally — there's only one set of data, and both templates render it.

**Example:** Theme A and Theme B both expect a `testimonials` dataset. In the merged theme, there's one `testimonials` dataset. Both `sections/testimonials.liquid` and `sections/testimonials-b.liquid` render the same testimonial records with different layouts.

---

## Setting Up the Test in the Dashboard

Once your theme is pushed to the site:

1. Go to **Sites → [Your Site] → A/B Tests**
2. Click **New Test**
3. Set the **Template Path** to the control: `templates/index.liquid`
4. Add variants:

| Key | Name | Template Path | Weight |
|-----|------|---------------|--------|
| `a` | Control | *(leave blank — uses the test's template)* | 50 |
| `b` | Variant B | `templates/index-b.liquid` | 50 |

5. Add conversion goals:
   - **URL goal**: `/thank-you` or `/apply` (fires when a visitor lands on that page)
   - **Event goal**: `cta_click` (fires from JavaScript — see below)

6. Click **Activate**

### Conversion Tracking with JavaScript

For event-based goals, add this to your template:

```html
<script>
document.querySelectorAll('[data-ab-event]').forEach(function(el) {
  el.addEventListener('click', function() {
    fetch('/ab/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: el.dataset.abEvent })
    });
  });
});
</script>
```

Then on your CTA buttons:

```html
<a href="/apply" class="btn btn--primary" data-ab-event="cta_click">
  Apply Now
</a>
```

### Testing Variants Manually

Force a specific variant with the UTM parameter:

```
https://yoursite.com/?ab=b    ← Forces variant B
https://yoursite.com/?ab=a    ← Forces control
```

The `ab` parameter name is configurable per test. Clear your cookies to reset assignment.

---

## Workflow: Merging Two Existing Themes into One Testable Theme

If you already have two separate themes (like `steamspire-c` and `steamspire-r`) and want to A/B test them:

### 1. Pick one as the base

Choose the control variant as the base theme. Copy its full directory.

### 2. Bring in the variant sections

Copy sections from the other theme, renaming with the variant suffix:

```bash
# From the variant theme, copy sections that differ
cp steamspire-r/sections/hero.liquid merged-theme/sections/hero-b.liquid
cp steamspire-r/sections/problem.liquid merged-theme/sections/problem-b.liquid
# ... etc for each section that has different copy
```

### 3. Create the variant template

Create `templates/index-b.liquid` referencing the variant sections:

```liquid
{% section 'hero-b' %}
{% section 'stat-bar-b' %}
{% section 'product-overview-b' %}
...
```

### 4. Merge section schemas

Copy `config/sections/*.json` from the variant theme, adding the `-b` suffix to filenames.

### 5. Merge assets

If both themes share the same CSS (same class names, same visual framework), one `theme.css` covers both. If the variant has unique styles, add them to the shared CSS file — the unused rules for the non-displayed variant are negligible.

### 6. Push and configure

Push the merged theme, then set up the A/B test in the dashboard.

---

## Tips

- **Test one thing at a time.** A test that changes the hero, pricing, AND FAQ at once tells you something changed, but not what. If you must test full-page rewrites, that's fine — just know the results are "page A vs page B", not "hero A vs hero B."

- **Shared sections stay shared.** Nav, footer, and any section that's identical in both variants should use the same file. Don't duplicate for the sake of completeness.

- **CSS covers both variants.** Both variants use the same `theme.css`. Structure your CSS so variant sections use the same class names. If a variant section needs a unique style, add a modifier class.

- **One active test per site.** The platform enforces this. Complete or delete the current test before starting a new one.

- **50/50 is the default.** Equal traffic split. Adjust weights if you want to send more traffic to the control while testing (e.g., 80/20).

- **Results take traffic.** You need meaningful sample sizes before drawing conclusions. A few dozen visitors won't tell you much.
