const { parseArgs, validateThemePath, runDockerCommand } = require('../docker');

module.exports = function(args) {
  const flagsWithValues = [
    '--server-url', '-s',
    '--env', '-e',
    '--account', '-a'
  ];
  const booleanFlags = ['--open', '-o', '--help'];

  const { themePath, passArgs } = parseArgs(args, { flagsWithValues, booleanFlags });
  const resolvedPath = validateThemePath(themePath || '.');

  runDockerCommand('connect', passArgs, {
    themePath: resolvedPath,
    errorContext: 'run the tunnel client'
  });
};
