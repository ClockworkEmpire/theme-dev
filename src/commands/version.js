const pkg = require('../../package.json');

module.exports = function() {
  console.log(`hostnet v${pkg.version}`);
  console.log();
  console.log('HostNet Theme Development CLI');
  console.log('https://github.com/clockworkempire/theme-dev');
};
