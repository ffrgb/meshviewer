module.exports = function exports(grunt) {
  'use strict';

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['lint', 'copy', 'sass:dist', 'postcss', 'requirejs:default', 'cachebreaker', 'inline', 'htmlmin', 'json-minify', 'clean:release']);
  grunt.registerTask('lint', ['sasslint', 'eslint']);
  grunt.registerTask('serve', ['lint', 'copy', 'sass:dev', 'postcss', 'requirejs:dev', 'inline:dev', 'htmlmin', 'json-minify', 'browserSync', 'watch']);
};
