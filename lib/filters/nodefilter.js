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

      n.links = data.links.filter(function (d) {
        return filter(d.source) && filter(d.target);
      });

      return n;
    };
  };
});
