module.exports = function (grunt) {
  "use strict";

  grunt.config.merge({
    clean: {
      build: ["build/**/*", "node_modules/grunt-newer/.cache"],
      release: ["build/vendor", "build/*.map", "build/config.json", "build/style.css"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
};
