const { runDockerCommand } = require('../docker');

module.exports = function(args) {
  runDockerCommand('env', args, {
    errorContext: 'manage environments'
  });
};
