const { spawn } = require('child_process');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

module.exports = function() {
  console.log('Pulling latest HostNet theme dev server...');
  console.log();

  const docker = spawn('docker', ['pull', DOCKER_IMAGE], { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error('Install Docker: https://docs.docker.com/get-docker/');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  });

  docker.on('exit', (code) => {
    if (code === 0) {
      console.log();
      console.log('Update complete!');
    }
    process.exit(code || 0);
  });
};
