module.exports = function (grunt) {
  "use strict";

  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["lint", "copy", "sass:dist", "postcss", "requirejs:default", "inlinedata", "cachebreaker", "inline", "htmlmin", "json-minify", "clean:release"]);
  grunt.registerTask("lint", ["sasslint", "eslint"]);
  grunt.registerTask("serve", ["lint", "copy", "sass:dev", "postcss", "requirejs:dev", "inlinedata", "htmlmin", "json-minify", "browserSync", "watch"]);
};
