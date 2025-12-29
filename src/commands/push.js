const { parseArgs, validateThemePath, runDockerCommand } = require('../docker');

module.exports = function(args) {
  const flagsWithValues = [
    '--config', '-c',
    '--token', '-t',
    '--url', '-u',
    '--account', '-a',
    '--theme-id',
    '--theme-name', '-n',
    '--env', '-e'
  ];
  const booleanFlags = ['--create', '--help'];

  const { themePath, passArgs } = parseArgs(args, { flagsWithValues, booleanFlags });
  const resolvedPath = validateThemePath(themePath || '.');

  console.log('Pushing theme to HostNet...');
  console.log(`Theme: ${resolvedPath}`);
  console.log();

  runDockerCommand('push', passArgs, {
    themePath: resolvedPath,
    errorContext: 'push themes'
  });
};
