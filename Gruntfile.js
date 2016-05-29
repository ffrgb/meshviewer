module.exports = function (grunt) {
  "use strict";

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["bower-install-simple", "lint", "copy", "sass", "postcss", "requirejs:default", "cachebreaker", "inline"]);
  grunt.registerTask("lint", ["sasslint", "eslint"]);
  grunt.registerTask("serve", ["bower-install-simple", "lint", "copy", "sass", "requirejs:dev", "browserSync", "watch"]);
};
