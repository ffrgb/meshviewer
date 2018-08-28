'use strict';

require.config({
  baseUrl: 'lib',
  paths: {
    'polyglot': '../node_modules/node-polyglot/build/polyglot',
    'Navigo': '../node_modules/navigo/lib/navigo',
    'leaflet': '../node_modules/leaflet/dist/leaflet',
    'moment': '../node_modules/moment/moment',
    // d3 modules indirect dependencies
    // by d3-zoom: d3-drag
    'd3-ease': '../node_modules/d3-ease/dist/d3-ease',
    'd3-transition': '../node_modules/d3-transition/dist/d3-transition',
    'd3-color': '../node_modules/d3-color/dist/d3-color',
    'd3-interpolate': '../node_modules/d3-interpolate/dist/d3-interpolate',
    // by d3-force
    'd3-collection': '../node_modules/d3-collection/dist/d3-collection',
    'd3-dispatch': '../node_modules/d3-dispatch/dist/d3-dispatch',
    'd3-quadtree': '../node_modules/d3-quadtree/dist/d3-quadtree',
    'd3-timer': '../node_modules/d3-timer/dist/d3-timer',
    // by d3-drag: d3-selection
    // d3 modules dependencies
    'd3-selection': '../node_modules/d3-selection/dist/d3-selection',
    'd3-force': '../node_modules/d3-force/dist/d3-force',
    'd3-zoom': '../node_modules/d3-zoom/dist/d3-zoom',
    'd3-drag': '../node_modules/d3-drag/dist/d3-drag',
    'snabbdom': '../node_modules/snabbdom/dist/snabbdom-patch',
    'rbush': '../node_modules/rbush/rbush',
    'helper': 'utils/helper'
  },
  shim: {
    'd3-drag': ['d3-selection'],
    'd3-force': ['d3-collection', 'd3-dispatch', 'd3-quadtree', 'd3-timer'],
    'd3-interpolate': ['d3-color'],
    'd3-zoom': ['d3-drag', 'd3-ease', 'd3-transition', 'd3-interpolate']
  }
});

require(['main'], function (main) {
  main();
});
