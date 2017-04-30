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
  main(jsonData);
});
