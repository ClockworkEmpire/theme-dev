# Fix: Missing Dataset Requirements in Themes

**Status:** COMPLETED (2026-01-10)

## Summary

Multiple themes were missing `siteswarm.json` manifest files and/or sample datasets. The import infrastructure worked correctly - the themes just weren't created with these files.

> **Note:** For backward compatibility, the system also recognizes `hostnet.json` as a valid manifest filename.

## Root Cause

The import system looks for `siteswarm.json` (or `hostnet.json` for backward compatibility) at theme root and parses it into `theme_versions.manifest`. Without this file, manifest is empty = no requirements shown.

---

## Completed Fixes

### 1. Created Shared Sample Datasets

Created reusable sample datasets in `.claude/skills/HostNetTheme/Resources/datasets/`:

| File | Records | Description |
|------|---------|-------------|
| `listings.json` | 100 | Business listings with diverse categories |
| `articles.json` | 20 | Blog articles with varied topics |
| `locations.json` | 10 | Service area locations (Central Texas) |
| `services.json` | 10 | Tree care services |

### 2. DHA Directory Themes (5 themes) - FIXED

Added `siteswarm.json` + `data/datasets/listings.json` to:
- `dha-directory-list/`
- `dha-directory-cards/`
- `dha-directory-grid/`
- `dha-directory-map/`
- `dha-directory-minimal/`

### 3. Directory Listing Themes (3 themes) - FIXED

Added `siteswarm.json` declaring both `listings` and `articles` datasets to:
- `directory-listing-1-theme/`
- `directory-listing-2-theme/`
- `directory-listing-3-theme/`

Note: These themes already had sample data. Their schema uses nested objects (location.address, contact.phone, etc.) which differs from the simpler DHA schema.

### 4. LocalBiz Themes (4 themes) - FIXED

Added `siteswarm.json` + `data/datasets/locations.json` + `data/datasets/services.json` to:
- `localbiz-alternating/`
- `localbiz-minimal/`
- `localbiz-sidebar/`
- `localbiz-tabbed/`

### 5. HostNetTheme Skill Updated

Updated workflow documentation to require siteswarm.json and sample data:

**Build.md** - Added steps 9-10:
- Step 9: Generate siteswarm.json manifest (REQUIRED)
- Step 10: Generate substantial sample data (REQUIRED)

**Convert.md** - Added steps 8-9:
- Step 8: Generate siteswarm.json manifest (REQUIRED)
- Step 9: Generate substantial sample data (REQUIRED)

---

## Sample Data Standards

| Dataset Type | Minimum Records | Guidelines |
|--------------|-----------------|------------|
| Businesses/Listings | 100 | Diverse categories, realistic names/addresses |
| Articles/Blog Posts | 20 | Varied topics, realistic content |
| Locations/Service Areas | 10 | Real city names, addresses |
| Services | 10 | Realistic service descriptions |

**Quality requirements:**
- NO lorem ipsum - use realistic content
- Varied ratings (3.5-5.0), review counts (10-500)
- Mix of featured/verified flags
- Valid Unsplash image URLs
- Realistic phone numbers, emails, websites

---

## Verification

To verify a theme has proper dataset requirements:

1. Push the theme:
   ```bash
   cd /home/jjn/github/hostnet-themes
   hostnet push ./dha-directory-list --env development
   ```

2. In the Site Swarm dashboard:
   - Navigate to Themes
   - Click on the pushed theme
   - Verify "Required Datasets" section shows the expected datasets
   - Check that all fields are listed

---

## Key Reference Files

| Purpose | Path |
|---------|------|
| Import service | `app/services/theme_upload_service.rb` |
| ThemeVersion model | `app/models/theme_version.rb` |
| Shared sample datasets | `.claude/skills/HostNetTheme/Resources/datasets/` |
| HostNetTheme skill | `.claude/skills/HostNetTheme/` |

---

## Remaining Work

- **Directory-listing themes sample data expansion**: The existing sample data in directory-listing themes uses a complex nested schema (location.address, contact.phone, owner.name, etc.). These could be expanded to 100 listings + 20 articles if needed, but would require generating data matching their specific schema.
