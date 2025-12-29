const { parseArgs, runDockerCommand } = require('../docker');

module.exports = function(args) {
  const flagsWithValues = ['--server-url', '-s', '--env', '-e'];
  const booleanFlags = ['--logout', '--help'];

  const { passArgs } = parseArgs(args, { flagsWithValues, booleanFlags });

  runDockerCommand('auth', passArgs, {
    errorContext: 'run authentication'
  });
};
