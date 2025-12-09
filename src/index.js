#!/usr/bin/env node

const commands = {
  new: require('./commands/new'),
  dev: require('./commands/dev'),
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

  dev [path]           Start the development server
    --port <port>      Port to listen on (default: 4000)

  update               Pull the latest Docker image

  version              Show version information

  help                 Show this help message

Examples:
  hostnet new my-theme
  hostnet new my-theme --example
  hostnet dev
  hostnet dev ./my-theme --port 3000

Documentation: https://github.com/clockworkempire/theme-dev
`);
}
