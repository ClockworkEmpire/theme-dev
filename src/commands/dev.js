const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function(args) {
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 ? args[portIndex + 1] : '4000';

  // Find theme path (first non-flag argument)
  let themePath = args.find(a => !a.startsWith('-') && a !== port) || '.';
  themePath = path.resolve(process.cwd(), themePath);

  // Validate theme directory exists
  if (!fs.existsSync(themePath)) {
    console.error(`Error: Theme directory not found: ${themePath}`);
    process.exit(1);
  }

  console.log('Starting HostNet theme dev server...');
  console.log(`Theme: ${themePath}`);
  console.log(`URL: http://localhost:${port}`);
  console.log();
  console.log('Press Ctrl+C to stop');
  console.log();

  const docker = spawn('docker', [
    'run',
    '--rm',
    '-it',
    '-v', `${themePath}:/theme`,
    '-p', `${port}:4000`,
    DOCKER_IMAGE
  ], { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error();
      console.error('The hostnet CLI requires Docker to run the development server.');
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
