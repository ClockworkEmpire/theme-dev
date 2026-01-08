/**
 * Shared Docker utilities for hostnet CLI commands.
 * Provides consistent volume mounting and error handling.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DOCKER_IMAGE = 'ghcr.io/clockworkempire/theme-dev:latest';

/**
 * Ensures the global config file exists as a file (not directory).
 * Docker creates a directory if the mount target doesn't exist.
 * @returns {string} Path to the global config file
 */
function ensureGlobalConfigFile() {
  const configPath = path.join(os.homedir(), '.hostnet.yml');

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  } else if (fs.statSync(configPath).isDirectory()) {
    fs.rmdirSync(configPath);
    fs.writeFileSync(configPath, '', { mode: 0o600 });
  }

  return configPath;
}

/**
 * Build Docker arguments with standard volume mounts.
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.themePath] - Path to theme directory (mounted to /theme)
 * @param {boolean} [options.interactive=true] - Whether to use -it flags
 * @param {Object} [options.ports] - Port mappings { host: container }
 * @param {Object} [options.env] - Environment variables to pass through
 * @returns {string[]} Docker run arguments
 */
function buildDockerArgs(options = {}) {
  const {
    themePath,
    interactive = true,
    ports = {},
    env = {}
  } = options;

  const globalConfigPath = ensureGlobalConfigFile();
  const cwd = process.cwd();

  const args = ['run', '--rm'];

  // On Linux, use host network mode so localhost works directly
  // On macOS/Windows, use host.docker.internal with add-host
  const isLinux = os.platform() === 'linux';
  if (isLinux) {
    args.push('--network', 'host');
    // Tell Ruby not to transform localhost URLs (host network means localhost works)
    args.push('-e', 'DOCKER_HOST_NETWORK=1');
  } else {
    args.push('--add-host=host.docker.internal:host-gateway');
  }

  if (interactive) {
    args.push('-it');
  }

  // Always mount the global config file
  args.push('-v', `${globalConfigPath}:/root/.hostnet.yml`);

  // Always mount the current working directory for local .hostnet.yml
  args.push('-v', `${cwd}:/workdir`);
  args.push('-w', '/workdir');

  // Mount theme directory if provided
  if (themePath) {
    const resolvedThemePath = path.resolve(cwd, themePath);
    args.push('-v', `${resolvedThemePath}:/theme`);
  }

  // Add port mappings
  for (const [host, container] of Object.entries(ports)) {
    args.push('-p', `${host}:${container}`);
  }

  // Add environment variables
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined && value !== null) {
      args.push('-e', `${key}=${value}`);
    }
  }

  // Pass through standard HOSTNET env vars if set
  const hostnetEnvVars = [
    'HOSTNET_API_KEY',
    'HOSTNET_API_TOKEN',
    'HOSTNET_API_URL',
    'HOSTNET_ACCOUNT_ID',
    'HOSTNET_SERVER_URL'
  ];
  for (const envVar of hostnetEnvVars) {
    if (process.env[envVar]) {
      args.push('-e', `${envVar}=${process.env[envVar]}`);
    }
  }

  return args;
}

/**
 * Run a Docker command with proper error handling.
 *
 * @param {string} command - The hostnet CLI command to run (e.g., 'push', 'connect')
 * @param {string[]} commandArgs - Arguments to pass to the command
 * @param {Object} options - Docker configuration options (see buildDockerArgs)
 * @param {string} [options.errorContext] - Context for error messages (e.g., 'run the tunnel')
 */
function runDockerCommand(command, commandArgs = [], options = {}) {
  const { errorContext = `run ${command}` } = options;

  const dockerArgs = buildDockerArgs(options);

  // Add the image and command
  dockerArgs.push(DOCKER_IMAGE, command);

  // If theme was mounted, pass /theme as the path argument
  if (options.themePath) {
    dockerArgs.push('/theme');
  }

  // Add remaining command arguments
  dockerArgs.push(...commandArgs);

  const docker = spawn('docker', dockerArgs, { stdio: 'inherit' });

  docker.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('Error: Docker not found.');
      console.error();
      console.error(`The hostnet CLI requires Docker to ${errorContext}.`);
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

  return docker;
}

/**
 * Parse command-line arguments, separating flags with values from boolean flags.
 *
 * @param {string[]} args - Command line arguments
 * @param {Object} options - Parsing options
 * @param {string[]} [options.flagsWithValues] - Flags that take a value
 * @param {string[]} [options.booleanFlags] - Flags that are boolean
 * @returns {Object} { themePath, passArgs }
 */
function parseArgs(args, options = {}) {
  const {
    flagsWithValues = [],
    booleanFlags = []
  } = options;

  let themePath = null;
  const passArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (flagsWithValues.includes(arg)) {
      passArgs.push(arg);
      if (i + 1 < args.length) {
        passArgs.push(args[i + 1]);
        i++;
      }
    } else if (booleanFlags.includes(arg)) {
      passArgs.push(arg);
    } else if (arg.startsWith('-')) {
      passArgs.push(arg);
    } else if (themePath === null) {
      themePath = arg;
    }
  }

  return { themePath, passArgs };
}

/**
 * Validate that a theme directory exists and contains layout/theme.liquid.
 *
 * @param {string} themePath - Path to theme directory
 * @returns {string} Resolved absolute path
 */
function validateThemePath(themePath) {
  const resolved = path.resolve(process.cwd(), themePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: Theme directory not found: ${resolved}`);
    process.exit(1);
  }

  const layoutPath = path.join(resolved, 'layout', 'theme.liquid');
  if (!fs.existsSync(layoutPath)) {
    console.error('Error: Invalid theme - missing layout/theme.liquid');
    console.error(`Path: ${resolved}`);
    process.exit(1);
  }

  return resolved;
}

module.exports = {
  DOCKER_IMAGE,
  ensureGlobalConfigFile,
  buildDockerArgs,
  runDockerCommand,
  parseArgs,
  validateThemePath
};
