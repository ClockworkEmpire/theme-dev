const pkg = require('../../package.json');

module.exports = function() {
  console.log(`swarm v${pkg.version}`);
  console.log();
  console.log('Site Swarm Theme Development CLI');
  console.log('https://github.com/clockworkempire/theme-dev');
};
