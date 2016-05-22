module.exports = function (grunt) {
  grunt.config.merge({
    bowerdir: "bower_components",
    copy: {
      html: {
        options: {
          process: function (content) {
            return content.replace("#revision#", grunt.option("gitRevision"));
          }
        },
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
        src: ["es6-shim/es6-shim.min.js"],
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
      compile: {
        options: {
          baseUrl: "lib",
          name: "../bower_components/almond/almond",
          mainConfigFile: "app.js",
          include: "../app",
          wrap: true,
          optimize: "uglify",
          out: "build/app.js"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-bower-install-simple");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-postcss");
};
