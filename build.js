({
  baseUrl: "lib",
  name: "../bower_components/almond/almond",
  mainConfigFile: "app.js",
  include: "../app",
  wrap: true,
  optimize: "uglify",
  out: "app-combined.js"
});
