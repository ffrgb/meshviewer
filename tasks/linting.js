module.exports = function (grunt) {
  "use strict";

  grunt.config.merge({
    checkDependencies: {
      options: {
        install: true
      }
    },
    sasslint: {
      options: {
        configFile: ".sass-lint.yml"
      },
      target: ['scss/main.scss', 'scss/night.scss', 'scss/*/*.scss']
    },
    eslint: {
      sources: {
        src: ["app.js", "!Gruntfile.js", "lib/**/*.js", "tasks/**/*.js"]
      },
      grunt: {
        src: ["Gruntfile.js", "tasks/*.js"]
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass-lint');
  grunt.loadNpmTasks("grunt-eslint");
};
