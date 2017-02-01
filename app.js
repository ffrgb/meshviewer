'use strict';
// Node search polyfill for mobile browsers and IE
if (!String.prototype.includes) {
  String.prototype.includes = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

require.config({
  baseUrl: 'lib',
  paths: {
    'polyglot': '../node_modules/node-polyglot/build/polyglot',
    'leaflet': '../node_modules/leaflet/dist/leaflet',
    'leaflet.label': '../node_modules/leaflet-label/dist/leaflet.label',
    'chroma-js': '../node_modules/chroma-js/chroma.min',
    'moment': '../node_modules/moment/moment',
    'tablesort': '../node_modules/tablesort/src/tablesort',
    'd3': '../node_modules/d3/d3.min',
    'virtual-dom': '../node_modules/virtual-dom/dist/virtual-dom',
    'rbush': '../node_modules/rbush/rbush',
    'helper': 'utils/helper'
  },
  shim: {
    'leaflet.label': ['leaflet'],
    'tablesort': {
      exports: 'Tablesort'
    }
  }
});

require(['main'], function (main) {
  main(jsonData);
});
