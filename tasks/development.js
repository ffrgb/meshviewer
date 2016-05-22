module.exports = function (grunt) {
  grunt.config.merge({
    connect: {
      server: {
        options: {
          base: "build/", //TODO: once grunt-contrib-connect 0.9 is released, set index file
          livereload: true
        }
      }
    },
    watch: {
      sources: {
        options: {
          livereload: true
        },
        files: ["*.css", "app.js", "lib/**/*.js", "*.html"],
        tasks: ["default"]
      },
      config: {
        options: {
          reload: true
        },
        files: ["Gruntfile.js", "tasks/*.js"],
        tasks: []
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
};
