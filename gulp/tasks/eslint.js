module.exports = function (gulp, plugins) {
  return function eslint() {
    return gulp.src(['app.js', 'gulpfile.js', 'lib/**/*.js', 'gulp/**/*.js'])
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.eslint.failAfterError());
  };
};
