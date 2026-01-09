# Batch Theme Conversion

This document describes how to convert multiple HTML templates to HostNet themes in bulk.

## Overview

The batch conversion system consists of:
1. **Manifest utility** (`scripts/batch-convert.ts`) - Tracks conversion progress
2. **HostNetTheme skill** - Performs individual conversions
3. **Parallel agents** - Run multiple conversions simultaneously

## Quick Start

```bash
# 1. Initialize manifest from a directory of HTML sources
bun run scripts/batch-convert.ts init ./my-html-sources

# 2. Check status
bun run scripts/batch-convert.ts status

# 3. Get next batch to convert
bun run scripts/batch-convert.ts next 5

# 4. Run conversions (in Claude Code conversation)
/theme convert ./my-html-sources/theme-1 --name theme-1
# or for parallel: ask Claude to spawn conversion agents

# 5. Mark as complete
bun run scripts/batch-convert.ts mark theme-1 completed
```

## Utility Commands

### Initialize Manifest

Creates a manifest from a directory where each subdirectory is a theme source:

```bash
bun run scripts/batch-convert.ts init <source-dir>
```

### Add Individual Sources

Add a single source to an existing manifest:

```bash
bun run scripts/batch-convert.ts add <source-path> [name]
```

### Check Status

```bash
bun run scripts/batch-convert.ts status
```

### Get Next Batch

```bash
bun run scripts/batch-convert.ts next [count]  # default: 5
```

### Update Status

```bash
bun run scripts/batch-convert.ts mark <theme-name> <status>
# status: pending | in_progress | completed | failed | skipped
```

### List Themes

```bash
bun run scripts/batch-convert.ts list           # all
bun run scripts/batch-convert.ts list pending   # filtered
```

### Export Commands

Generate conversion commands for copy/paste:

```bash
bun run scripts/batch-convert.ts export-batch 10
```

## Conversion Approaches

### Sequential (Single Conversation)

Best for: Small batches, when you want to review each conversion

```
1. Get next theme: bun run scripts/batch-convert.ts next 1
2. Convert: /theme convert <source> --name <name>
3. Verify the conversion
4. Mark complete: bun run scripts/batch-convert.ts mark <name> completed
5. Repeat
```

### Parallel (Spawn Agents)

Best for: Large batches, when sources are similar

Ask Claude to spawn multiple conversion agents:

```
"Convert the next 5 themes in parallel"
```

Claude will:
1. Get next batch from manifest
2. Mark them as in_progress
3. Spawn parallel themeforest-converter agents
4. Track completion and update manifest

## Priority System

Themes are prioritized by complexity (HTML file count):
- Priority 1: ≤10 HTML files (simplest)
- Priority 2: 11-15 HTML files
- Priority 3: 16-25 HTML files
- Priority 4: >25 HTML files (most complex)

Simpler themes are converted first to build up a library of working patterns.

## Manifest Format

```json
{
  "sourceDir": "./torado-input",
  "outputDir": "./",
  "createdAt": "2026-01-09T...",
  "updatedAt": "2026-01-09T...",
  "themes": [
    {
      "name": "consulting",
      "sourcePath": "torado-input/consulting",
      "outputPath": "./consulting-theme",
      "htmlFiles": 12,
      "status": "completed",
      "priority": 2,
      "notes": "Test conversion",
      "convertedAt": "2026-01-09T..."
    }
  ]
}
```

## Dev Server Port Management

When running dev servers for verification, use the port utility to avoid collisions:

```bash
# Find an available port starting from 4000
PORT=$(bun run scripts/find-port.ts 4000)
hostnet dev ./my-theme --port $PORT
```

## Troubleshooting

### Conversion Fails

1. Mark as failed: `bun run scripts/batch-convert.ts mark <name> failed "reason"`
2. Review the source HTML structure
3. Try manual conversion with more guidance

### Port Collision

Use `scripts/find-port.ts` to find available ports:

```bash
bun run scripts/find-port.ts 4000
```

### Resuming After Interruption

The manifest persists progress. Simply continue where you left off:

```bash
bun run scripts/batch-convert.ts status
bun run scripts/batch-convert.ts next 5
```
