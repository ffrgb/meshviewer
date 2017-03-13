module.exports = function exports(grunt) {
  'use strict';

  grunt.config.merge({
    nodedir: 'node_modules',
    copy: {
      html: {
        src: ['*.html'],
        expand: true,
        cwd: 'html/',
        dest: 'build/'
      },
      vendorjs: {
        src: ['promise-polyfill/promise.js'],
        expand: true,
        cwd: '<%=nodedir%>/',
        dest: 'build/vendor/'
      },
      config: {
        src: ['config.json'],
        expand: true,
        cwd: '.',
        dest: 'build/'
      },
      ionicons: {
        src: ['fonts/*'],
        expand: true,
        dest: 'build/',
        cwd: 'assets/icons/'
      },
      assistantFont: {
        src: ['fonts/*'],
        expand: true,
        dest: 'build/',
        cwd: 'assets/'
      },
      locale: {
        src: ['locale/*'],
        expand: true,
        dest: 'build/',
        cwd: '.'
      }
    },
    sass: {
      dev: {
        options: {
          sourceMap: true,
          outputStyle: 'expanded'
        },
        files: [{
          expand: true,
          cwd: 'scss/',
          src: '*.scss',
          dest: 'build/',
          ext: '.css'
        }]
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: [{
          expand: true,
          cwd: 'scss/',
          src: '*.scss',
          dest: 'build/',
          ext: '.css'
        }]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({
            browsers: ['> 1% in DE']
          })
        ]
      },
      dev: {
        options: {
          map: true
        },
        dist: {
          src: 'build/*.css'
        }
      },
      dist: {
        options: {
          map: false
        },
        dist: {
          src: 'build/*.css'
        }
      }
    },
    inline: {
      dev: {
        options: {
          cssmin: true,
          uglify: true
        },
        src: 'build/index.html',
        dest: 'build/index.html'
      },
      dist: {
        options: {
          tag: '__build',
          cssmin: true,
          uglify: true
        },
        src: 'build/index.html',
        dest: 'build/index.html'
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
    requirejs: {
      default: {
        options: {
          baseUrl: 'lib',
          name: '../<%=nodedir%>/almond/almond',
          mainConfigFile: 'app.js',
          include: '../app',
          out: 'build/app.js',
          build: true
        }
      },
      dev: {
        options: {
          baseUrl: 'lib',
          name: '../<%=nodedir%>/almond/almond',
          mainConfigFile: 'app.js',
          include: '../app',
          optimize: 'none',
          out: 'build/app.js',
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
      js: {
        options: {
          match: ['app.js']
        },
        files: {
          src: ['build/index.html']
        }
      },
      variable: {
        options: {
          match: ['vy*zx'],
          position: 'overwrite'
        },
        files: {
          src: ['build/config.json']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.loadNpmTasks('grunt-cache-breaker');
};
