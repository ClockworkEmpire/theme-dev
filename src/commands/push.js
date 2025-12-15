const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function(args) {
  // Parse arguments to find theme path and pass-through options
  const dockerArgs = ['run', '--rm', '-it'];

  // Find theme path (first non-flag argument that's not a value for a flag)
  let themePath = '.';
  const flagsWithValues = ['--config', '-c', '--token', '-t', '--url', '-u', '--account', '-a', '--theme-id'];
  const passArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (flagsWithValues.includes(arg)) {
      // This flag takes a value, pass both through
      passArgs.push(arg);
      if (i + 1 < args.length) {
        passArgs.push(args[i + 1]);
        i++;
      }
    } else if (arg.startsWith('-')) {
      // Other flags (like --help)
      passArgs.push(arg);
    } else if (themePath === '.') {
      // First non-flag argument is the theme path
      themePath = arg;
    }
  }

  themePath = path.resolve(process.cwd(), themePath);

  // Validate theme directory exists
  if (!fs.existsSync(themePath)) {
    console.error(`Error: Theme directory not found: ${themePath}`);
    process.exit(1);
  }

  // Check for layout/theme.liquid
  const layoutPath = path.join(themePath, 'layout', 'theme.liquid');
  if (!fs.existsSync(layoutPath)) {
    console.error('Error: Invalid theme - missing layout/theme.liquid');
    process.exit(1);
  }

  // Mount the theme directory and run push command
  dockerArgs.push('-v', `${themePath}:/theme`);

  // Pass through environment variable for API token if set
  if (process.env.HOSTNET_API_TOKEN) {
    dockerArgs.push('-e', `HOSTNET_API_TOKEN=${process.env.HOSTNET_API_TOKEN}`);
  }

  dockerArgs.push(DOCKER_IMAGE, 'push', '/theme', ...passArgs);

  console.log('Pushing theme to HostNet...');
  console.log(`Theme: ${themePath}`);
  console.log();

  const docker = spawn('docker', dockerArgs, { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error();
      console.error('The hostnet CLI requires Docker to run.');
      console.error('Install Docker: https://docs.docker.com/get-docker/');
      console.error();
      console.error('Alternatively, install the Ruby gem for native execution:');
      console.error('  gem install hostnet-theme-dev');
    } else {
      console.error('Error starting Docker:', err.message);
    }
    process.exit(1);
  });

  docker.on('exit', (code) => {
    process.exit(code || 0);
  });
};
