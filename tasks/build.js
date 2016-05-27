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
      img: {
        src: ["img/*"],
        expand: true,
        dest: "build/"
      },
      vendorjs: {
        src: ["es6-shim/es6-shim.min.js",
          "es6-shim/es6-shim.map"],
        expand: true,
        cwd: "bower_components/",
        dest: "build/vendor/"
      },
      robotoSlab: {
        src: ["fonts/*",
          "roboto-slab-fontface.css"
        ],
        expand: true,
        dest: "build/",
        cwd: "bower_components/roboto-slab-fontface"
      },
      roboto: {
        src: ["fonts/*",
          "roboto-fontface.css"
        ],
        expand: true,
        dest: "build/",
        cwd: "bower_components/roboto-fontface"
      },
      ionicons: {
        src: ["fonts/*",
          "hopglass-icons.css"
        ],
        expand: true,
        dest: "build/",
        cwd: "assets/icons/"
      },
      leafletImages: {
        src: ["images/*"],
        expand: true,
        dest: "build/",
        cwd: "bower_components/leaflet/dist/"
      }
    },
    sass: {
      options: {
        sourceMap: true,
        outputStyle: "compressed"
      },
      dist: {
        files: {
          "build/style.css": "scss/main.scss"
        }
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          require("autoprefixer")({
            browsers: ["last 2 versions"]
          })
        ]
      },
      dist: {
        src: "build/style.css"
      }
    },
    cssmin: {
      target: {
        files: {
          "build/style.css": ["bower_components/leaflet/dist/leaflet.css",
            "bower_components/Leaflet.label/dist/leaflet.label.css",
            "style.css"
          ]
        }
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
          build: false
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
};
