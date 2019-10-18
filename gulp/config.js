module.exports = function () {
  const build = 'build';

  return {
    build: build,
    faviconData: 'assets/faviconData.json',
    src: {
      sass: 'scss/**/*.scss',
      javascript: ['./app.js', 'lib/**/*.js'],
      json: 'locale/*.json',
      html: ['html/*.html', './config*.js']
    },
    clean: [build + '/*.map', build + '/vendor', build + '/main.css'],
    browsersync: {
      open: false,
      server: {
        baseDir: build
      },
      files: [
        build + '/*.css',
        build + '/*.js',
        build + '/*.html',
        build + '/locale/*.json'
      ]
    },
    requireJs: {
      prod: {
        baseUrl: 'lib',
        name: '../node_modules/almond/almond',
        mainConfigFile: 'app.js',
        include: '../app',
        out: 'app.js',
        build: true,
        preserveLicenseComments: true
      },
      dev: {
        baseUrl: 'lib',
        name: '../node_modules/almond/almond',
        mainConfigFile: 'app.js',
        include: '../app',
        optimize: 'none',
        out: 'app.js',
        build: false
      }
    }
  };
};
