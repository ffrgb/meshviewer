module.exports = function (grunt) {
  grunt.loadTasks("tasks")

  grunt.registerTask("default", ["lint", "copy", "sass", "requirejs"])
  grunt.registerTask("lint", ["eslint"])
  grunt.registerTask("dev", ["default", "connect:server", "watch"])
}

