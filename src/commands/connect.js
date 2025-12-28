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

  // Path to hostnetrc (API key storage)
  const hostnetrcPath = path.join(os.homedir(), '.hostnetrc');

  // Build Docker args
  const dockerArgs = [
    'run',
    '--rm',
    '-it',
    '-v', `${themePath}:/theme`
  ];

  // Mount hostnetrc if it exists
  if (fs.existsSync(hostnetrcPath)) {
    dockerArgs.push('-v', `${hostnetrcPath}:/root/.hostnetrc`);
  }

  // Pass through additional arguments (like --server-url)
  const passthroughArgs = args.filter(a => a.startsWith('-'));

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
