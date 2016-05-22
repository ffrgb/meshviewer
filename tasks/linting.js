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
      options: {
        rules: {
          "strict": [2, "never"],
          "no-multi-spaces": 0,
          "no-new": 0,
          "no-shadow": 0,
          "no-use-before-define": [1, "nofunc"],
          "no-underscore-dangle": 0
        }
      },
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
