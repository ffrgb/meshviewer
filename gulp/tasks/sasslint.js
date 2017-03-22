module.exports = function (gulp, plugins, config, env) {
  return function sasslint() {
    return gulp.src('scss/*.scss')
      .pipe(plugins.sassLint())
      .pipe(plugins.sassLint.format())
      .pipe(env.production(plugins.sassLint.failOnError()));
  };
};
