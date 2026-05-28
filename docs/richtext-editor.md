# Rich Text Editor (WYSIWYG)

SiteSwarm includes a full WYSIWYG editor (powered by [TipTap](https://tiptap.dev) / ProseMirror) for any field, block, or setting declared as `"type": "richtext"`. The editor produces clean semantic HTML stored as a string and rendered verbatim at runtime.

## Where you can use it

`"type": "richtext"` works in all five schema contexts:

| Context | File / location | Liquid access |
|---|---|---|
| **Section setting** | `config/sections/<name>.json` → `settings[]` | `{{ section.settings.body }}` |
| **Block setting** | `config/sections/<name>.json` → `blocks[].settings[]` | `{{ block.settings.body }}` |
| **Template setting** | `config/templates/<name>.json` → `settings[]` | `{{ template.settings.body }}` |
| **Dataset record field** | `siteswarm.json` → `datasets.<alias>.fields[]` | `{{ record.body }}` / `{{ service.body }}` |
| **Site / global setting** | `config/settings_schema.json` | `{{ settings.body }}` |

## Declaring a richtext field

```json
{
  "id": "body",
  "type": "richtext",
  "label": "Content",
  "default": "<p>Add some content...</p>"
}
```

The platform handles the rest:
- **Customizer drawer** renders the field with a full TipTap editor (toolbar + body)
- **Dataset record drawer** mounts the same editor when editing a record
- **Preview iframe** wraps the rendered value with editable markers — clicking it opens a TipTap modal in the customizer
- **Sanitization** is applied server-side on every save (script, iframe, event handlers stripped)
- **HTML output** passes through Liquid unescaped — no `| html_safe` needed

## What the editor produces

The editor outputs clean semantic HTML:

```html
<h2>About our service</h2>
<p>We deliver <strong>fast</strong>, <em>reliable</em> tree care across the <a href="/service-areas">Austin area</a>.</p>
<ul>
  <li>Free estimates</li>
  <li>24/7 emergency response</li>
</ul>
<blockquote>"They saved my oak in a single afternoon." — Jamie R.</blockquote>
```

## Available formatting

The toolbar exposes:

- **Inline:** Bold, Italic, Strikethrough, inline `<code>`
- **Block:** Paragraph, H2, H3
- **Lists:** Bullet (`<ul>`), Numbered (`<ol>`)
- **Other:** Blockquote, Link
- **History:** Undo, Redo

(No images in v1 — coming in a follow-on.)

## Two ways to edit

### 1. From the customizer drawer

When you open a section's drawer (gear icon), each richtext field renders with a full TipTap editor inline in the drawer.

### 2. Inline modal on the rendered preview

Any rendered `{{ block.settings.X }}` or `{{ section.settings.X }}` or `{{ record.X }}` where `X` is a richtext field gets wrapped in a `<div class="swarm-editable swarm-richtext">` in editor mode. Click it → modal opens centered on screen with the editor preloaded. Cancel discards; Save persists.

The modal routes saves to the right endpoint automatically based on the editable's scope:

| Scope | Endpoint |
|-------|----------|
| `block` | `PATCH /swarm-customizer-api/sections/:section_id/blocks/:block_id` |
| `section` | `PATCH /swarm-customizer-api/sections/:section_id` |
| `template` | `PATCH /swarm-customizer-api/template_settings` |
| `record` | `PATCH /swarm-customizer-api/records/:record_id` |
| `global` | `PATCH /swarm-customizer-api/global_settings` |

## Link picker

The link button (🔗) in the toolbar opens a floating picker with two modes:

- **Paste a URL** — plain URL, `mailto:`, `tel:`, or absolute path. Press Enter or Apply.
- **Type a search term** — autocomplete searches across Pages, Posts, and DatasetRecords on the site. Results show title + subtitle (page type / dataset name) + URL. Click a result to insert.

The picker calls `GET /swarm-customizer-api/link_targets?q=<query>` which returns up to 20 best matches.

## HTML sanitization

Saves go through `RichTextSanitizer` with an allowlist:

**Allowed tags:** `p, br, hr, h1-h6, strong, b, em, i, u, s, del, ins, code, pre, blockquote, ul, ol, li, a, div, span`
**Allowed attributes:** `href, title, alt, class, id, rel, target`
**Stripped:** `<script>`, `<iframe>`, `<form>`, `<style>`, all `on*` event handlers, `javascript:` URLs

If sanitization removes everything (or near everything), the field is saved as the cleaned remainder — never as the raw input.

## Liquid in richtext

Liquid syntax inside richtext content is **not** auto-interpolated. To enable interpolation, theme authors apply the `parse_liquid` filter at render time:

```liquid
{{ block.settings.body | parse_liquid }}
```

This lets authors write content like `<p>Call us at {{ settings.phone }} today.</p>` and have the phone number resolved at render. Without the filter, the literal text passes through unchanged.

## For theme authors

Recommended structure for a section that needs WYSIWYG content:

```json
{
  "name": "Custom Content",
  "blocks": [
    {
      "type": "html",
      "name": "Content Block",
      "settings": [
        { "type": "richtext", "id": "body", "label": "Content" }
      ]
    }
  ]
}
```

And in the section liquid:

```liquid
<section class="my-section">
  {% for block in section.blocks %}
    {% if block.type == 'html' %}
      <div class="my-section__block">{{ block.settings.body }}</div>
    {% endif %}
  {% endfor %}
</section>
```

Editor mode automatically wraps `{{ block.settings.body }}` with the inline-edit markers; non-editor mode emits the HTML verbatim.

## Styling rich content in your theme

The platform makes **no styling decisions** for richtext output beyond what TipTap's HTML structure provides. You author the prose CSS in your theme so the output matches the rest of your design.

### The vocabulary you're styling

TipTap (with the current SiteSwarm bundle) can emit any of these elements inside your richtext wrapper. Style each one — or accept the browser default.

| Element | Source |
|---|---|
| `<p>` | Paragraph (default) |
| `<h2>`, `<h3>` | Toolbar H2 / H3 (H4–H6 if you enable them) |
| `<strong>`, `<em>`, `<s>`, `<u>` | Bold, italic, strike, underline |
| `<ul>` / `<ol>` / `<li>` | Bullet / ordered list |
| `<blockquote>` | Quote |
| `<code>` / `<pre>` | Inline code / code block |
| `<a href>` | Link |
| `<br>`, `<hr>` | Soft break, horizontal rule (if enabled) |

Future extensions (tables, images, embeds) emit their own elements. The list grows as you opt into more TipTap features.

### Recommended pattern: scope to your wrapper class

Pick a single wrapper class for each richtext slot in your theme. Style descendants of that class. This isolates the prose CSS so it doesn't bleed into structured content elsewhere in the same template.

```liquid
<div class="my-theme-prose">
  {{ service.additional_content }}
</div>
```

```css
.my-theme-prose {
  /* Base text styles */
  font-size: 1.0625rem;
  line-height: 1.75;
  color: var(--color-text);
}

.my-theme-prose > :first-child { margin-top: 0; }
.my-theme-prose > :last-child  { margin-bottom: 0; }

.my-theme-prose h2,
.my-theme-prose h3 {
  font-family: var(--font-display);
  color: var(--color-heading);
  margin: 2rem 0 0.875rem;
}

.my-theme-prose h2 { font-size: clamp(1.75rem, 3vw, 2.25rem); }
.my-theme-prose h3 { font-size: clamp(1.375rem, 2.2vw, 1.75rem); }

.my-theme-prose p  { margin: 0 0 1.25rem; }
.my-theme-prose ul,
.my-theme-prose ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
.my-theme-prose li { margin-bottom: 0.5rem; }

.my-theme-prose blockquote {
  border-left: 4px solid var(--color-accent);
  padding-left: 1.25rem;
  font-style: italic;
}

.my-theme-prose a {
  color: var(--color-link);
  text-decoration: underline;
}

.my-theme-prose code {
  background: var(--color-surface);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 0.92em;
}

.my-theme-prose pre {
  background: var(--color-surface);
  padding: 1rem 1.25rem;
  border-radius: 6px;
  overflow-x: auto;
}
```

**Reference implementation:** `btc-converted/assets/theme.css` → search for `.btc-service-content__body`. It uses the theme's existing `--font-display`, `--color-neutral-*`, `--color-primary-*` tokens for headings, list bullets, links, and blockquote — matching the rest of the theme's visual language.

### Using Tailwind Typography

If your theme uses Tailwind, the [Typography plugin](https://tailwindcss.com/docs/typography-plugin) is the fastest path. Add the plugin, then:

```liquid
<div class="prose prose-lg max-w-none">
  {{ service.additional_content }}
</div>
```

Customize the prose theme via Tailwind config so your tokens flow through. SiteSwarm doesn't ship Tailwind with themes, but nothing prevents you from adding it.

### Inheriting the rest of the page

If your theme already styles `h2`, `h3`, `p`, `a`, `blockquote`, etc. with global rules (no class), the richtext content will pick those up automatically. The starter above is for themes that scope typography via classes (the more common pattern). If you go global-style, your wrapper just needs spacing:

```css
.my-theme-prose { line-height: 1.75; }
.my-theme-prose > :first-child { margin-top: 0; }
.my-theme-prose > :last-child  { margin-bottom: 0; }
```

The rest happens for free.

### Editor preview parity

The customizer drawer's TipTap editor uses its own minimal styling (small, neutral, fits in a 360px-wide drawer). The **rendered** page is what your prose CSS targets. Don't try to match the drawer's appearance — match the page's appearance. The drawer is for editing; the page is the result.

### Click-to-modal inline edit

When a user clicks rendered richtext in the customizer preview, the editor mounts in a modal — same minimal styling as the drawer. Your prose CSS still applies to the page below; the modal floats above. Once the modal closes, the page re-renders with your prose CSS applied to the new content.

### Mobile considerations

Add a breakpoint for narrow screens — drop the base font-size and reduce vertical padding:

```css
@media (max-width: 768px) {
  .my-theme-prose { font-size: 1rem; }
}
```

### Test checklist before shipping

When wiring up a richtext slot, paste this into the editor and verify each element looks right:

```
# Heading 2
## Heading 3
A paragraph with **bold** and *italic* and a [link](/contact) and an `inline code` sample.

> Blockquote with a longer line that wraps so you can check the left border and color.

- Bulleted list item one
- Bulleted list item two

1. Numbered first
2. Numbered second

```code block
sample code
```
```

Render the resulting page in:
- Desktop width (~1440px)
- Tablet (~768px)
- Mobile (~375px)

Verify line lengths stay readable (45–80 characters per line is a good target — set `max-width` on the wrapper).

## Adding more features

The TipTap bundle at `vendor/javascript/tiptap-editor.js` is built from `scripts/tiptap-entry.js`. To enable more extensions (tables, images, etc.):

1. Add the npm package to `scripts/package.json`
2. Export it from `scripts/tiptap-entry.js`
3. Run `cd scripts && npm run build:tiptap`
4. Wire into the toolbar (Stimulus controller `form_richtext_editor_controller.js` and the inlined customizer JS in `liquid_renderer.rb`)
