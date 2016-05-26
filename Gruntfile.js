module.exports = function (grunt) {
  "use strict";

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["bower-install-simple", "lint", "copy", "sass", "postcss", "requirejs:default", "inline"]);
  grunt.registerTask("lint", ["sasslint", "eslint"]);
  grunt.registerTask("dev", ["bower-install-simple", "lint", "copy", "sass", "requirejs:dev"]);
  grunt.registerTask("serve", ["dev", "connect:server", "watch"]);
};

