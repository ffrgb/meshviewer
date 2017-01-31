module.exports = function exports(grunt) {
  'use strict';

  grunt.config.merge({
    clean: {
      build: ['build/**/*', 'node_modules/grunt-newer/.cache'],
      release: ['build/vendor', 'build/*.map', 'build/config.json', 'build/main.css']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};
