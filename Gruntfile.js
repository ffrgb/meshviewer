module.exports = function (grunt) {
  grunt.loadTasks("tasks");

  grunt.registerTask("default", ["bower-install-simple", "lint", "copy", "sass", "postcss", "requirejs"]);
  grunt.registerTask("lint", ["eslint"]);
  grunt.registerTask("dev", ["default", "connect:server", "watch"]);
};

