const path = require('path');
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

  // Derive theme name from directory for fallback
  // (Docker mounts at /theme, so CLI can't see the real name)
  // Pass as env var so config file theme_name can take precedence
  const dirName = path.basename(resolvedPath);
  const derivedThemeName = dirName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  console.log('Pushing theme to HostNet...');
  console.log(`Theme: ${resolvedPath}`);
  console.log();

  runDockerCommand('push', passArgs, {
    themePath: resolvedPath,
    errorContext: 'push themes',
    env: { HOSTNET_THEME_NAME_FALLBACK: derivedThemeName }
  });
};
