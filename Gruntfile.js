module.exports = function (grunt) {
  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["bower-install-simple", "lint", "copy", "sass", "postcss", "requirejs:default", "inline"]);
  grunt.registerTask("lint", ["eslint"]);
  grunt.registerTask("dev", ["bower-install-simple", "lint", "copy", "sass", "requirejs:dev"]);
  grunt.registerTask("serve", ["dev", "connect:server", "watch"]);
};

