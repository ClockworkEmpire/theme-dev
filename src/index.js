#!/usr/bin/env node

const commands = {
  new: require('./commands/new'),
  dev: require('./commands/dev'),
  connect: require('./commands/connect'),
  auth: require('./commands/auth'),
  env: require('./commands/env'),
  push: require('./commands/push'),
  update: require('./commands/update'),
  version: require('./commands/version'),
  help: showHelp
};

const args = process.argv.slice(2);
const command = args[0] || 'help';

if (commands[command]) {
  commands[command](args.slice(1));
} else {
  console.error(`Unknown command: ${command}`);
  showHelp();
  process.exit(1);
}

function showHelp() {
  console.log(`
HostNet Theme Development CLI

Usage: hostnet <command> [options]

Commands:
  new <name>           Create a new theme
    --example          Use the full example theme instead of blank scaffold

  dev [path]           Start local development server (offline mode)
    --port <port>      Port to listen on (default: 4000)

  connect [path]       Connect to HostNet Theme Editor (tunnel mode)
    --env <name>       Environment to use (default: current)
    --server-url <url> HostNet server URL (default: https://hostnet.io)

  auth                 Authenticate with HostNet (save API key)
    --env <name>       Environment to authenticate (default: current)
    --server-url <url> HostNet server URL (default: https://hostnet.io)

  env                  Manage environments (production, staging, local)
    list               List all environments
    show [name]        Show environment details
    use <name>         Set the default environment
    add <name>         Add a new environment
    remove <name>      Remove an environment

  push [path]          Push theme to HostNet server
    --url <url>        API URL (e.g., https://app.hostnet.com)
    --account <id>     Account ID (e.g., acct_xxx)
    --theme-id <id>    Theme ID to push to (e.g., theme_xxx)
    --token <token>    API token (or set HOSTNET_API_TOKEN env var)
    --config <file>    Config file (default: .hostnet.yml)

  update               Pull the latest Docker image

  version              Show version information

  help                 Show this help message

Examples:
  hostnet new my-theme
  hostnet dev
  hostnet dev ./my-theme --port 3000
  hostnet connect ./my-theme
  hostnet auth
  hostnet env use staging
  hostnet connect --env staging ./my-theme
  hostnet push --url https://app.hostnet.com --account acct_xxx --theme-id theme_xxx

Documentation: https://github.com/clockworkempire/theme-dev
`);
}
