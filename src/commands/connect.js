const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function(args) {
  // Find theme path (first non-flag argument)
  let themePath = args.find(a => !a.startsWith('-')) || '.';
  themePath = path.resolve(process.cwd(), themePath);

  // Validate theme directory exists
  if (!fs.existsSync(themePath)) {
    console.error(`Error: Theme directory not found: ${themePath}`);
    process.exit(1);
  }

  // Path to global config (API key storage)
  const configPath = path.join(os.homedir(), '.hostnet.yml');

  // Create the file if it doesn't exist (Docker would create a directory otherwise)
  // Also handle the case where it exists as a directory from a previous failed mount
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  } else if (fs.statSync(configPath).isDirectory()) {
    fs.rmdirSync(configPath);
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  }

  // Build Docker args
  const dockerArgs = [
    'run',
    '--rm',
    '-it',
    '-v', `${themePath}:/theme`,
    '-v', `${configPath}:/root/.hostnet.yml`
  ];

  // Pass through additional arguments (like --server-url, --env)
  // Handle flags that take values
  const passthroughArgs = [];
  const flagsWithValues = ['--server-url', '-s', '--env', '-e', '--account', '-a'];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === themePath || arg === path.resolve(process.cwd(), themePath)) {
      continue; // Skip the theme path, it's handled separately
    }
    if (flagsWithValues.includes(arg)) {
      passthroughArgs.push(arg);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        passthroughArgs.push(args[i + 1]);
        i++;
      }
    } else if (arg.startsWith('-')) {
      passthroughArgs.push(arg);
    }
  }

  dockerArgs.push(DOCKER_IMAGE, 'connect', '/theme', ...passthroughArgs);

  const docker = spawn('docker', dockerArgs, { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error();
      console.error('The hostnet CLI requires Docker to run the tunnel client.');
      console.error('Install Docker: https://docs.docker.com/get-docker/');
    } else {
      console.error('Error starting Docker:', err.message);
    }
    process.exit(1);
  });

  docker.on('exit', (code) => {
    process.exit(code || 0);
  });
};
