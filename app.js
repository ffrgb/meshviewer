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
    // d3 modules indirect dependencies
    // by d3-zoom: d3-drag
    'd3-ease': '../node_modules/d3-ease/build/d3-ease',
    'd3-transition': '../node_modules/d3-transition/build/d3-transition',
    'd3-color': '../node_modules/d3-color/build/d3-color',
    'd3-interpolate': '../node_modules/d3-interpolate/build/d3-interpolate',
    // by d3-force
    'd3-collection': '../node_modules/d3-collection/build/d3-collection',
    'd3-dispatch': '../node_modules/d3-dispatch/build/d3-dispatch',
    'd3-quadtree': '../node_modules/d3-quadtree/build/d3-quadtree',
    'd3-timer': '../node_modules/d3-timer/build/d3-timer',
    // by d3-drag: d3-selection
    // d3 modules dependencies
    'd3-selection': '../node_modules/d3-selection/build/d3-selection',
    'd3-force': '../node_modules/d3-force/build/d3-force',
    'd3-zoom': '../node_modules/d3-zoom/build/d3-zoom',
    'd3-drag': '../node_modules/d3-drag/build/d3-drag',
    'virtual-dom': '../node_modules/virtual-dom/dist/virtual-dom',
    'rbush': '../node_modules/rbush/rbush',
    'd3': 'forcegraph/d3',
    'helper': 'utils/helper',
    'language': 'utils/language'
  },
  shim: {
    'leaflet.label': ['leaflet'],
    'd3-drag': ['d3-selection'],
    'd3-force': ['d3-collection', 'd3-dispatch', 'd3-quadtree', 'd3-timer'],
    'd3-zoom': ['d3-drag', 'd3-ease', 'd3-transition', 'd3-color', 'd3-interpolate'],
    'tablesort': {
      exports: 'Tablesort'
    }
  }
});

require(['main'], function (main) {
  main(jsonData);
});
