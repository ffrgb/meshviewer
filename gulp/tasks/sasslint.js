module.exports = function (gulp, plugins) {
  return function sasslint() {
    return gulp.src('scss/*.scss')
      .pipe(plugins.sassLint())
      .pipe(plugins.sassLint.format())
      .pipe(plugins.sassLint.failOnError());
  };
};
