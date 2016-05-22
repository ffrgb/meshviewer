define([], function () {
  return function (filter) {
    return function (data) {
      var n = Object.create(data);
      n.nodes = {};

      for (var key in data.nodes) {
        n.nodes[key] = data.nodes[key].filter(filter);
      }

      var filteredIds = new Set();

      n.graph = {};
      n.graph.nodes = data.graph.nodes.filter(function (d) {
        var r;
        if (d.node) {
          r = filter(d.node);
        } else {
          r = filter({});
        }

        if (r) {
          filteredIds.add(d.id);
        }

        return r;
      });

      n.graph.links = data.graph.links.filter(function (d) {
        return filteredIds.has(d.source.id) && filteredIds.has(d.target.id);
      });

      return n;
    };
  };
});
