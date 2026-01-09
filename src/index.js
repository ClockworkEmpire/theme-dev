#!/usr/bin/env node

const commands = {
  new: require('./commands/new'),
  dev: require('./commands/dev'),
  connect: require('./commands/connect'),
  env: require('./commands/env'),
  push: require('./commands/push'),
  update: require('./commands/update'),
  version: require('./commands/version'),
  docs: require('./commands/docs'),
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
    --server-url <url> HostNet server URL

  env                  Manage environments (production, staging, local)
    list               List all environments
    show [name]        Show environment details
    use <name>         Set the default environment
    add <name>         Add a new environment interactively
    remove <name>      Remove an environment

  push [path]          Push theme to HostNet server
    --env <name>       Environment to use (default: current)
    --account <id>     Account ID (overrides environment)
    --theme-id <id>    Theme ID to update (creates new if omitted)
    --theme-name <n>   Theme name for new themes

  update               Pull the latest Docker image

  version              Show version information

  docs                 Access theme documentation
    extract [path]     Extract docs to local directory
    list               List available docs

  help                 Show this help message

Configuration:
  Create ~/.hostnet.yml or .hostnet.yml in your project:

    default_environment: development
    environments:
      development:
        api_key: your_api_key_here
        server_url: http://localhost:3000
        account_id: acct_xxx
      production:
        api_key: your_prod_key
        server_url: https://hostnet.io
        account_id: acct_yyy

Examples:
  hostnet new my-theme
  hostnet dev ./my-theme
  hostnet connect ./my-theme
  hostnet push ./my-theme
  hostnet env use production
  hostnet push --env staging ./my-theme

Documentation: https://github.com/clockworkempire/theme-dev
`);
}
