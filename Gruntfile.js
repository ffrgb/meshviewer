module.exports = function (grunt) {
  grunt.loadTasks("tasks")

  grunt.registerTask("default", ["lint", "copy", "cssmin", "requirejs"])
  grunt.registerTask("lint", ["eslint"])
  grunt.registerTask("dev", ["default", "connect:server", "watch"])
}

