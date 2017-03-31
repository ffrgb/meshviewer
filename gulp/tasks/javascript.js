module.exports = function (gulp, plugins, config, env) {
  return function javascript() {
    gulp.src('app.js')
      .pipe(env.development(plugins.sourcemaps.init()))
      .pipe(plugins.requirejsOptimize(env.production() ? config.requireJs.prod : config.requireJs.dev))
      .on('error', function () {
        this.emit('end');
      })
      .pipe(env.production(plugins.uglify({ output: { comments: 'all' } })))
      .pipe(env.development(plugins.sourcemaps.write('.', { addComment: true })))
      .pipe(gulp.dest(config.build));
    return gulp.src('service-worker.js')
      .pipe(env.development(plugins.sourcemaps.init()))
      .pipe(env.production(plugins.uglify({ output: { comments: 'all' } })))
      .pipe(env.development(plugins.sourcemaps.write('.', { addComment: true })))
      .pipe(gulp.dest(config.build));
  };
};
