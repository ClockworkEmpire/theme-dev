# HostNet Theme Dev

Local development server for building and previewing HostNet themes.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) must be installed and running

## Installation

```bash
# Configure npm for GitHub Packages (one-time setup)
npm config set @clockworkempire:registry https://npm.pkg.github.com

# Install globally
npm install -g @clockworkempire/theme-dev
```

## Quick Start

```bash
# Create a new theme
hostnet new my-theme

# Start the dev server
cd my-theme
hostnet dev
```

Open http://localhost:4000 to view your theme.

## Commands

| Command | Description |
|---------|-------------|
| `hostnet new <name>` | Create a new theme from blank scaffold |
| `hostnet new <name> --example` | Create from full example theme |
| `hostnet dev [path]` | Start dev server (default: current dir) |
| `hostnet dev --port 3000` | Use custom port |
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
