const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function(args) {
  // Path to hostnetrc (API key storage)
  const hostnetrcPath = path.join(os.homedir(), '.hostnetrc');

  // Build Docker args
  const dockerArgs = [
    'run',
    '--rm',
    '-it',
    '-v', `${hostnetrcPath}:/root/.hostnetrc`
  ];

  // Pass through additional arguments (like --server-url)
  const passthroughArgs = args.filter(a => a.startsWith('-'));

  dockerArgs.push(DOCKER_IMAGE, 'auth', ...passthroughArgs);

  const docker = spawn('docker', dockerArgs, { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error();
      console.error('The hostnet CLI requires Docker to run authentication.');
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
