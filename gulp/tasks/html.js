const fs = require('fs');

// stringify functions https://gist.github.com/cowboy/3749767
var stringify = function (obj) {
  var placeholder = '____PLACEHOLDER____';
  var fns = [];
  var json = JSON.stringify(obj, function (key, value) {
    if (typeof value === 'function') {
      fns.push(value);
      return placeholder;
    }
    return value;
  }, 2);
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function () {
    return fns.shift();
  });
  return json;
};

module.exports = function (gulp, plugins, config, env) {
  return function html() {
    return gulp.src(env.production() ? config.build + '/*.html' : 'html/*.html')
      .pipe(plugins.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(config.faviconData)).favicon.html_code))
      .pipe(env.production(plugins.inlineSource({ compress: false })))
      .pipe(plugins.inject(gulp.src(['config.js']), {
        removeTags: true,
        starttag: '<!-- inject:config -->',
        transform: function () {
          delete require.cache[require.resolve('../../config.default')];
          delete require.cache[require.resolve('../../config')];
          var buildConfig = Object.assign({}, require('../../config.default')(), require('../../config')());
          return '<title>' + buildConfig.siteName + ' - loading...</title>' +
            '<script>window.config =' +
            stringify(buildConfig)
              .replace('<!-- inject:cache-breaker -->',
                Math.random().toString(12).substring(7)) +
            ';</script>';
        }
      }))
      .pipe(plugins.inject(gulp.src(['config.js']), {
        removeTags: true,
        starttag: '<!-- inject:title -->',
        transform: function () {
          delete require.cache[require.resolve('../../config.default')];
          delete require.cache[require.resolve('../../config')];
          var buildConfig = Object.assign({}, require('../../config.default')(), require('../../config')());
          return buildConfig.siteName;
        }
      }))
      .pipe(plugins.cacheBust({
        type: 'timestamp'
      }))
      .pipe(plugins.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true
      }))
      .pipe(gulp.dest(config.build));
  };
};
