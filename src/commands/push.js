const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function(args) {
  // Path to global config (API key storage)
  const configPath = path.join(os.homedir(), '.hostnet.yml');

  // Create the file if it doesn't exist (Docker would create a directory otherwise)
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  } else if (fs.statSync(configPath).isDirectory()) {
    fs.rmdirSync(configPath);
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  }

  // Parse arguments to find theme path and pass-through options
  const dockerArgs = ['run', '--rm', '-it'];

  // Find theme path (first non-flag argument that's not a value for a flag)
  let themePath = '.';
  const flagsWithValues = ['--config', '-c', '--token', '-t', '--url', '-u', '--account', '-a', '--theme-id', '--theme-name', '-n', '--env', '-e'];
  const booleanFlags = ['--create', '--help'];
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
    } else if (booleanFlags.includes(arg)) {
      // Boolean flags (no value)
      passArgs.push(arg);
    } else if (arg.startsWith('-')) {
      // Other flags
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

  // Mount the theme directory, global config, and local config
  dockerArgs.push('-v', `${themePath}:/theme`);
  dockerArgs.push('-v', `${configPath}:/root/.hostnet.yml`);

  // Mount theme directory's parent for local .hostnet.yml access
  const themeParent = path.dirname(themePath);
  dockerArgs.push('-v', `${themeParent}:/workdir`);

  // Pass through environment variables if set
  const envVars = ['HOSTNET_API_KEY', 'HOSTNET_API_TOKEN', 'HOSTNET_API_URL', 'HOSTNET_ACCOUNT_ID', 'HOSTNET_SERVER_URL'];
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      dockerArgs.push('-e', `${envVar}=${process.env[envVar]}`);
    }
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
