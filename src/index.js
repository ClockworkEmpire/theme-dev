#!/usr/bin/env node

const commands = {
  new: require('./commands/new'),
  dev: require('./commands/dev'),
  connect: require('./commands/connect'),
  env: require('./commands/env'),
  push: require('./commands/push'),
  lint: require('./commands/lint'),
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
Site Swarm Theme Development CLI

Usage: swarm <command> [options]

Commands:
  new <name>           Create a new theme
    --example          Start with a working example theme

  dev [path]           Start local development server (offline mode)
    --port <port>      Port to listen on (default: 4000)

  connect [path]       Connect to Site Swarm Theme Editor (tunnel mode)
    --env <name>       Environment to use (default: current)
    --server-url <url> Site Swarm server URL

  env                  Manage environments (production, staging, local)
    list               List all environments
    show [name]        Show environment details
    use <name>         Set the default environment
    add <name>         Add a new environment interactively
    remove <name>      Remove an environment

  push [path]          Push theme to Site Swarm server
    --env <name>       Environment to use (default: current)
    --account <id>     Account ID (overrides environment)
    --theme-id <id>    Theme ID to update (creates new if omitted)
    --theme-name <n>   Theme name for new themes
    --create           Create a new theme (required if no theme-id)

  lint [path]          Check theme for issues and unused settings
    --fix              Auto-fix issues (add missing schema, remove unused settings)
    --json             Output results as JSON

  update               Pull the latest Docker image

  version              Show version information

  docs                 Access theme documentation
    extract [path]     Extract docs to local directory
    list               List available docs

  help                 Show this help message

Configuration:
  Create ~/.siteswarm.yml or .siteswarm.yml in your project:

    default_environment: development
    environments:
      development:
        api_key: your_api_key_here
        server_url: http://localhost:3000
        account_id: acct_xxx
      production:
        api_key: your_prod_key
        server_url: https://siteswarm.co
        account_id: acct_yyy

Examples:
  swarm new my-theme
  swarm dev ./my-theme
  swarm connect ./my-theme
  swarm lint ./my-theme
  swarm lint --fix ./my-theme
  swarm push ./my-theme
  swarm env use production
  swarm push --env staging ./my-theme

Documentation: https://github.com/clockworkempire/theme-dev
`);
}
