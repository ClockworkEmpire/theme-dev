const { parseArgs, validateThemePath, runDockerCommand } = require('../docker');

module.exports = function(args) {
  const flagsWithValues = [];
  const booleanFlags = ['--fix', '--json', '--help'];

  const { themePath, passArgs } = parseArgs(args, { flagsWithValues, booleanFlags });
  const resolvedPath = validateThemePath(themePath || '.');

  console.log('Linting theme...');
  console.log(`Theme: ${resolvedPath}`);
  console.log();

  runDockerCommand('lint', passArgs, {
    themePath: resolvedPath,
    errorContext: 'lint theme',
    interactive: false
  });
};
