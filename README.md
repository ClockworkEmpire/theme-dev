# Site Swarm Theme Dev

Local development server for building and previewing Site Swarm themes.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) must be installed and running

## Installation

```bash
npm install -g github:clockworkempire/theme-dev
```

## Quick Start

```bash
# Create a new theme
swarm new my-theme

# Start the dev server (offline mode)
cd my-theme
swarm dev
```

Open http://localhost:4000 to view your theme.

### Tunnel Mode (Connect to Site Swarm)

Use the full Theme Editor UI while editing files locally:

```bash
# Authenticate once
swarm auth

# Connect to Site Swarm
swarm connect ./my-theme
```

This opens the Theme Editor at Site Swarm with your local files.

## Commands

| Command | Description |
|---------|-------------|
| `swarm new <name>` | Create a new theme from blank scaffold |
| `swarm new <name> --example` | Create from full example theme |
| `swarm dev [path]` | Start local dev server (offline mode) |
| `swarm dev --port 3000` | Use custom port |
| `swarm connect [path]` | Connect to Site Swarm Theme Editor (tunnel mode) |
| `swarm auth` | Authenticate with Site Swarm (save API key) |
| `swarm update` | Pull latest version |
| `swarm version` | Show version info |
| `swarm help` | Show help |

## Documentation

- [Getting Started](docs/getting-started.md)
- [Components](docs/components.md)
- [Content and Routing](docs/content-and-routing.md)
- [Liquid Reference](docs/liquid-reference.md)
- [Cheat Sheet](docs/cheat-sheet.md)

## Starter Themes

Browse the [starters/](starters/) directory for example themes:

- **blank/** - Minimal scaffold to start from scratch
- **minimal/** - Basic theme with datasets and mock data
- **directory/** - Full-featured business directory theme
