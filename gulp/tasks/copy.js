module.exports = function (gulp, plugins, config) {
  return function copy() {
    gulp.src(['html/*.html', 'assets/favicon/*'])
      .pipe(gulp.dest(config.build));
    gulp.src(['assets/logo.svg', 'service-worker.js'])
      .pipe(gulp.dest(config.build));
    gulp.src(['polyfill.js', 'node_modules/raven-js/dist/raven.js'])
      .pipe(gulp.dest(config.build + '/vendor'));
    gulp.src(['node_modules/promise-polyfill/dist/polyfill.js'])
      .pipe(gulp.dest(config.build + '/vendor/promise'));
    return gulp.src(['assets/fonts/*', 'assets/icons/fonts/*'])
      .pipe(gulp.dest(config.build + '/fonts'));
  };
};

