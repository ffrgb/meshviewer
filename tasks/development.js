module.exports = function (grunt) {
  "use strict";

  grunt.config.merge({
    "browserSync": {
      dev: {
        bsFiles: {
          src: [
            'build/*.css',
            'build/*.js',
            'build/*.html'
          ]
        },
        options: {
          open: 'local',
          watchTask: true,
          injectChanges: true,
          server: {
            baseDir: "build",
            index: "index.html"
          }
        }
      }
    },
    watch: {
      html: {
        files: ["html/index.html"],
        tasks: ["copy", "inlinedata"]
      },
      sass: {
        files: ["scss/**/*.scss"],
        tasks: ["sasslint", "sass"]
      },
      js: {
        files: ["app.js", "lib/**/*.js"],
        tasks: ["eslint", "requirejs:dev"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-browser-sync");
  grunt.loadNpmTasks("grunt-contrib-watch");
};
