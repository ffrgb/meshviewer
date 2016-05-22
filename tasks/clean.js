module.exports = function (grunt) {
  grunt.config.merge({
    clean: {
      build: ["build/**/*", "node_modules/grunt-newer/.cache"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
};
