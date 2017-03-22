module.exports = function (gulp, plugins, config, env) {
  const browserSync = require('browser-sync');

  function getTask(task) {
    return require('./tasks/' + task)(gulp, plugins, config, env);
  }

  gulp.task('ws', () =>
    browserSync(config.browsersync)
  );

  gulp.task('watch:html', () =>
    gulp.watch(config.src.html,
      gulp.parallel(getTask('html'))
    )
  );

  gulp.task('watch:javascript', () =>
    gulp.watch(config.src.javascript,
      gulp.parallel(getTask('eslint'), getTask('javascript'))
    )
  );

  gulp.task('watch:styles', () =>
    gulp.watch(config.src.sass,
      gulp.parallel(getTask('sasslint'), getTask('sass'))
    )
  );

  gulp.task('watch:json', () =>
    gulp.watch(config.src.json,
      gulp.parallel(getTask('jsonMinify'))
    )
  );

  gulp.task('watch',
    gulp.parallel('watch:html', 'watch:styles', 'watch:javascript', 'watch:json')
  );
};
