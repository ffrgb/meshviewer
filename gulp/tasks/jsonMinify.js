module.exports = function (gulp, plugins, config) {
  return function jsonMinify() {
    return gulp.src(config.src.json)
      .pipe(plugins.jsonminify())
      .pipe(gulp.dest(config.build + '/locale'));
  };
};
