const fs = require('fs');
module.exports = function (gulp, plugins, config, env) {
  return function html() {
    return gulp.src(env.production() ? config.build + '/*.html' : 'html/*.html')
      .pipe(plugins.inject(gulp.src(['config.json']), {
        starttag: '<!-- inject:config -->',
        transform: function (filePath, file) {
          return '<script>var jsonData =' +
            file.contents.toString('utf8')
              .replace('<!-- inject:cache-breaker -->',
                Math.random().toString(12).substring(7)) +
            ';</script>'
            ;
        }
      }))
      .pipe(env.production(plugins.kyhInlineSource({ compress: false })))
      .pipe(plugins.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(config.faviconData)).favicon.html_code))
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
