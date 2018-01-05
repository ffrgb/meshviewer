module.exports = function (gulp, plugins, config, env) {
  return function sass() {
    return gulp.src('scss/*.scss')
      .pipe(env.development(plugins.sourcemaps.init()))
      .pipe(plugins.sass({
        outputStyle: 'compressed',
        sourceMap: false
      }))
      .on('error', function () {
        this.emit('end');
      })
      .pipe(plugins.autoprefixer({
        browsers: config.autoprefixer
      }))
      .pipe(env.development(plugins.sourcemaps.write('.', { addComment: true })))
      .pipe(gulp.dest(config.build));
  };
};
