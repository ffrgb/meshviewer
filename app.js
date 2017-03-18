'use strict';
// Node search polyfill for mobile browsers and IE
if (!String.prototype.includes) {
  String.prototype.includes = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}
if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    'use strict';
    if (this === null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count === Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length === 0 || count === 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (; ;) {
      if ((count & 1) === 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count === 0) {
        break;
      }
      str += str;
    }
    // Could we try:
    // return Array(count + 1).join(this);
    return rpt;
  };
}

require.config({
  baseUrl: 'lib',
  paths: {
    'polyglot': '../node_modules/node-polyglot/build/polyglot',
    'leaflet': '../node_modules/leaflet/dist/leaflet',
    'leaflet.label': '../node_modules/leaflet-label/dist/leaflet.label',
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
    'helper': 'utils/helper',
    'language': 'utils/language'
  },
  shim: {
    'leaflet.label': ['leaflet'],
    'd3-drag': ['d3-selection'],
    'd3-force': ['d3-collection', 'd3-dispatch', 'd3-quadtree', 'd3-timer'],
    'd3-interpolate': ['d3-color'],
    'd3-zoom': ['d3-drag', 'd3-ease', 'd3-transition', 'd3-interpolate']
  }
});

require(['main'], function (main) {
  main(jsonData);
});
