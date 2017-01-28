module.exports = function (grunt) {
  "use strict";

  grunt.config.merge({
    nodedir: "node_modules",
    copy: {
      html: {
        src: ["*.html"],
        expand: true,
        cwd: "html/",
        dest: "build/"
      },
      vendorjs: {
        src: ["promise-polyfill/promise.js"],
        expand: true,
        cwd: "<%=nodedir%>/",
        dest: "build/vendor/"
      },
      config: {
        src: ["config.json"],
        expand: true,
        cwd: ".",
        dest: "build/"
      },
      ionicons: {
        src: ["fonts/*"],
        expand: true,
        dest: "build/",
        cwd: "assets/icons/"
      },
      assistantFont: {
        src: ["fonts/*"],
        expand: true,
        dest: "build/",
        cwd: "assets/"
      },
      locale: {
        src: ["locale/*"],
        expand: true,
        dest: "build/",
        cwd: "."
      }
    },
    sass: {
      dev: {
        options: {
          sourceMap: true,
          outputStyle: "expanded"
        },
        files: {
          "build/style.css": "scss/main.scss",
          "build/night.css": "scss/night.scss"
        }
      },
      dist: {
        options: {
          outputStyle: "compressed"
        },
        files: {
          "build/style.css": "scss/main.scss",
          "build/night.css": "scss/night.scss"
        }
      }
    },
    postcss: {
      options: {
        map: false,
        processors: [
          require("autoprefixer")({
            browsers: ["> 1% in DE"]
          })
        ]
      },
      dist: {
        src: "build/*.css"
      }
    },
    inline: {
      dist: {
        options: {
          cssmin: true,
          uglify: true
        },
        src: "build/index.html",
        dest: "build/index.html"
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true
        },
        files: {
          'build/index.html': 'build/index.html'
        }
      }
    },
    inlinedata: {
      injs: {
        expand: true,
        cwd: ".",
        src: ["build/*.html"],
        ext: ".html"
      }
    },
    requirejs: {
      default: {
        options: {
          baseUrl: "lib",
          name: "../<%=nodedir%>/almond/almond",
          mainConfigFile: "app.js",
          include: "../app",
          out: "build/app.js",
          build: true
        }
      },
      dev: {
        options: {
          baseUrl: "lib",
          name: "../<%=nodedir%>/almond/almond",
          mainConfigFile: "app.js",
          include: "../app",
          optimize: "none",
          out: "build/app.js",
          build: false,
          generateSourceMaps: true
        }
      }
    },
    'json-minify': {
      build: {
        files: 'build/locale/*.json'
      }
    },
    cachebreaker: {
      default: {
        options: {
          match: ["app.js"]
        },
        files: {
          src: ["build/index.html"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-postcss");
  grunt.loadNpmTasks("grunt-inline");
  grunt.loadNpmTasks("grunt-inline-data");
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.loadNpmTasks("grunt-cache-breaker");
};
