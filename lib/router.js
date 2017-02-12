define(['helper'], function (helper) {
  'use strict';

  return function () {
    var self = this;
    var objects = { nodes: {}, links: {} };
    var targets = [];
    var views = {};
    var currentView;
    var currentObject;
    var running = false;

    function saveState() {
      var e = '#!';

      e += 'v:' + currentView;

      if (currentObject) {
        if ('node' in currentObject) {
          e += ';n:' + encodeURIComponent(currentObject.node.nodeinfo.node_id);
        } else if ('link' in currentObject) {
          e += ';l:' + encodeURIComponent(currentObject.link.id);
        }
      }

      window.history.pushState(e, undefined, e);
    }

    function resetView(push) {
      push = helper.trueDefault(push);

      targets.forEach(function (t) {
        t.resetView();
      });

      if (push) {
        currentObject = undefined;
        saveState();
      }
    }

    function gotoNode(d, update) {
      if (!d) {
        return false;
      }

      targets.forEach(function (t) {
        t.gotoNode(d, update);
      });

      return true;
    }

    function gotoLink(d, update) {
      if (!d) {
        return false;
      }

      targets.forEach(function (t) {
        t.gotoLink(d, update);
      });

      return true;
    }

    function loadState(s, update) {
      if (!s) {
        return false;
      }

      s = decodeURIComponent(s);

      if (!s.startsWith('#!')) {
        return false;
      }

      var targetSet = false;

      s.slice(2).split(';').forEach(function (d) {
        var args = d.split(':');

        if (update !== true && args[0] === 'v' && args[1] in views) {
          currentView = args[1];
          views[args[1]]();
        }

        var id;

        if (args[0] === 'n') {
          id = args[1];
          if (id in objects.nodes) {
            currentObject = { node: objects.nodes[id] };
            gotoNode(objects.nodes[id], update);
            targetSet = true;
          }
        }

        if (args[0] === 'l') {
          id = args[1];
          if (id in objects.links) {
            currentObject = { link: objects.links[id] };
            gotoLink(objects.links[id], update);
            targetSet = true;
          }
        }
      });

      return targetSet;
    }

    self.getUrl = function getUrl(data) {
      var e = '#!';

      if (data.n) {
        e += 'n:' + encodeURIComponent(data.n);
      }

      if (data.l) {
        e += 'l:' + encodeURIComponent(data.l);
      }

      return e;
    };

    self.start = function start() {
      running = true;

      if (!loadState(window.location.hash)) {
        resetView(false);
      }

      window.onpopstate = function onpopstate(d) {
        if (!loadState(d.state)) {
          resetView(false);
        }
      };
    };

    self.view = function view(d) {
      if (d in views) {
        views[d]();

        if (!currentView || running) {
          currentView = d;
        }

        if (!running) {
          return;
        }

        saveState();

        if (!currentObject) {
          resetView(false);
          return;
        }

        if ('node' in currentObject) {
          gotoNode(currentObject.node);
        }

        if ('link' in currentObject) {
          gotoLink(currentObject.link);
        }
      }
    };

    self.node = function node(d) {
      return function () {
        if (gotoNode(d)) {
          currentObject = { node: d };
          saveState();
        }

        return false;
      };
    };

    self.link = function link(d) {
      return function () {
        if (gotoLink(d)) {
          currentObject = { link: d };
          saveState();
        }

        return false;
      };
    };

    self.gotoLocation = function gotoLocation(d) {
      if (!d) {
        return false;
      }

      targets.forEach(function (t) {
        if (!t.gotoLocation) {
          console.warn('has no gotoLocation', t);
        }
        t.gotoLocation(d);
      });

      return true;
    };

    self.reset = function reset() {
      resetView();
    };

    self.addTarget = function addTarget(d) {
      targets.push(d);
    };

    self.removeTarget = function removeTarget(d) {
      targets = targets.filter(function (e) {
        return d !== e;
      });
    };

    self.addView = function addView(k, d) {
      views[k] = d;
    };

    self.setData = function setData(data) {
      objects.nodes = {};
      objects.links = {};

      data.nodes.all.forEach(function (d) {
        objects.nodes[d.nodeinfo.node_id] = d;
      });

      data.graph.links.forEach(function (d) {
        objects.links[d.id] = d;
      });
    };

    self.update = function update() {
      loadState(window.location.hash, true);
    };

    return self;
  };
});
