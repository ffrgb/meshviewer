module.exports = function (grunt) {
  "use strict";

  grunt.config.merge({
    bowerdir: "bower_components",
    copy: {
      html: {
        src: ["*.html"],
        expand: true,
        cwd: "html/",
        dest: "build/"
      },
      vendorjs: {
        src: ["es6-shim/es6-shim.min.js",
          "es6-shim/es6-shim.map"],
        expand: true,
        cwd: "bower_components/",
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
    "bower-install-simple": {
      options: {
        directory: "<%=bowerdir%>",
        color: true,
        interactive: false,
        production: true
      },
      "prod": {
        options: {
          production: true
        }
      }
    },
    requirejs: {
      default: {
        options: {
          baseUrl: "lib",
          name: "../bower_components/almond/almond",
          mainConfigFile: "app.js",
          include: "../app",
          out: "build/app.js",
          build: true
        }
      },
      dev: {
        options: {
          baseUrl: "lib",
          name: "../bower_components/almond/almond",
          mainConfigFile: "app.js",
          include: "../app",
          optimize: "none",
          out: "build/app.js",
          build: false,
          generateSourceMaps: true
        }
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

  grunt.loadNpmTasks("grunt-bower-install-simple");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-postcss");
  grunt.loadNpmTasks("grunt-inline");
  grunt.loadNpmTasks("grunt-inline-data");
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks("grunt-cache-breaker");
};
