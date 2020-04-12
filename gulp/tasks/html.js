const fs = require('fs');

module.exports = function (gulp, plugins, config, env) {
  return function html() {
    return gulp.src(env.production() ? config.build + '/*.html' : 'html/*.html')
      .pipe(plugins.realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(config.faviconData)).favicon.html_code))
      .pipe(env.production(plugins.inlineSource({ compress: false })))
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
