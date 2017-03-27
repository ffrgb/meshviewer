const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const config = require('./gulp/config')();

const env = {
  development: plugins.environments.development,
  production: plugins.environments.production
};

// Default environment is production
plugins.environments.current(env.production);

function getTask(task) {
  return require('./gulp/tasks/' + task)(gulp, plugins, config, env);
}

gulp.task('generate-favicon',
  getTask('favicon')
);

require('./gulp/serve')(gulp, plugins, config, env);
gulp.task('serve',
  gulp.series(
    getTask('setDevelopment'),
    gulp.parallel(getTask('eslint'), getTask('sasslint')),
    gulp.parallel(getTask('copy'), getTask('javascript'), getTask('sass'), getTask('jsonMinify')),
    getTask('html'),
    gulp.parallel('watch', 'ws')
  )
);

gulp.task('default',
  gulp.series(
    gulp.parallel(getTask('eslint'), getTask('sasslint')),
    gulp.parallel(getTask('copy'), getTask('javascript'), getTask('sass'), getTask('jsonMinify')),
    getTask('html'),
    getTask('clean')
  )
);
