define(function () {
  'use strict';

  return function (filter) {
    return function (data) {
      var n = Object.create(data);
      n.nodes = {};

      for (var key in data.nodes) {
        if (data.nodes.hasOwnProperty(key)) {
          n.nodes[key] = data.nodes[key].filter(filter);
        }
      }

      return n;
    };
  };
});
