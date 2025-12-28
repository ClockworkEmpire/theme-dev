# HostNet Theme Dev

Local development server for building and previewing HostNet themes.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) must be installed and running

## Installation

```bash
npm install -g github:clockworkempire/theme-dev
```

## Quick Start

```bash
# Create a new theme
hostnet new my-theme

# Start the dev server (offline mode)
cd my-theme
hostnet dev
```

Open http://localhost:4000 to view your theme.

### Tunnel Mode (Connect to HostNet)

Use the full Theme Editor UI while editing files locally:

```bash
# Authenticate once
hostnet auth

# Connect to HostNet
hostnet connect ./my-theme
```

This opens the Theme Editor at HostNet with your local files.

## Commands

| Command | Description |
|---------|-------------|
| `hostnet new <name>` | Create a new theme from blank scaffold |
| `hostnet new <name> --example` | Create from full example theme |
| `hostnet dev [path]` | Start local dev server (offline mode) |
| `hostnet dev --port 3000` | Use custom port |
| `hostnet connect [path]` | Connect to HostNet Theme Editor (tunnel mode) |
| `hostnet auth` | Authenticate with HostNet (save API key) |
| `hostnet update` | Pull latest version |
| `hostnet version` | Show version info |
| `hostnet help` | Show help |

## Documentation

- [Getting Started](docs/getting-started.md)
- [Theme Structure](docs/theme-structure.md)
- [Liquid Reference](docs/liquid-reference.md)
- [Local Development](docs/local-development.md)

## Starter Themes

Browse the [starters/](starters/) directory for example themes:

- **blank/** - Minimal scaffold to start from scratch
- **minimal/** - Basic theme with datasets and mock data
- **directory/** - Full-featured business directory theme
