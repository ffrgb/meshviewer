module.exports = function (gulp, plugins, config, env) {
  return function sasslint() {
    return gulp.src('scss/**/*.scss')
      .pipe(plugins.stylelint({
        syntax: 'scss',
        failAfterError: env.production(),
        reporters: [
          { formatter: 'string', console: true }
        ]
      }));
  };
};
