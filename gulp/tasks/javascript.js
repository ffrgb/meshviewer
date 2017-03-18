module.exports = function (gulp, plugins, config, env) {
  return function javascript() {
    return gulp.src('app.js')
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.requirejsOptimize(env.production() ? config.requireJs.prod : config.requireJs.dev))
      .on('error', function () {
        this.emit('end');
      })
      .pipe(env.production(plugins.uglify({ output: { comments: 'all' } })))
      .pipe(plugins.sourcemaps.write('.', { addComment: true }))
      .pipe(gulp.dest(config.build));
  };
};
