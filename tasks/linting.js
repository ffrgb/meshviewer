module.exports = function (grunt) {
  grunt.config.merge({
    checkDependencies: {
      options: {
        install: true
      },
      bower: {
        options: {
          packageManager: "bower"
        }
      },
      npm: {}
    },
    eslint: {
      sources: {
        src: ["app.js", "!Gruntfile.js", "lib/**/*.js"]
      },
      grunt: {
        src: ["Gruntfile.js", "tasks/*.js"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-check-dependencies");
  grunt.loadNpmTasks("grunt-eslint");
};
