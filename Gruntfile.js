module.exports = function (grunt) {
  "use strict";

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["bower-install-simple", "lint", "copy", "sass:dist", "postcss", "requirejs:default", "inlinedata", "cachebreaker", "inline", "clean:release"]);
  grunt.registerTask("lint", ["sasslint", "eslint"]);
  grunt.registerTask("serve", ["bower-install-simple", "lint", "copy", "sass:dev", "postcss", "requirejs:dev", "inlinedata", "browserSync", "watch"]);
};
