module.exports = function (gulp, plugins, config, env) {
  return function setDevelopment(done) {
    plugins.environments.current(env.development);
    done();
  };
};
