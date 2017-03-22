const del = require('del');
module.exports = function (gulp, plugins, config) {
  return function clean() {
    return del(config.clean);
  };
};
