module.exports = function(grunt) {
  grunt.config.merge({
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
        src: [ "es6-shim/es6-shim.min.js" ],
        expand: true,
        cwd: "bower_components/",
        dest: "build/vendor/"
      },
      robotoSlab: {
        src: [ "fonts/*",
               "roboto-slab-fontface.css"
             ],
        expand: true,
        dest: "build/",
        cwd: "bower_components/roboto-slab-fontface"
      },
      roboto: {
        src: [ "fonts/*",
               "roboto-fontface.css"
             ],
        expand: true,
        dest: "build/",
        cwd: "bower_components/roboto-fontface"
      },
      ionicons: {
        src: [ "fonts/*",
               "css/ionicons.min.css"
             ],
        expand: true,
        dest: "build/",
        cwd: "bower_components/ionicons/"
      }
    },
    sass: {
      dist: {
        options: {
          style: "compressed"
        },
        files: {
          "build/style.css": "scss/main.scss"
        }
      }
    },
    cssmin: {
      target: {
        files: {
          "build/style.css": [ "bower_components/leaflet/dist/leaflet.css",
                               "bower_components/Leaflet.label/dist/leaflet.label.css",
                               "style.css"
                             ]
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
  })

  grunt.loadNpmTasks("grunt-contrib-copy")
  grunt.loadNpmTasks("grunt-contrib-requirejs")
  grunt.loadNpmTasks("grunt-contrib-sass")
}
