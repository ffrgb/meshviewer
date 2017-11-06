'use strict';

define({
  get: function get(url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function onload() {
        if (req.status === 200) {
          resolve(req.response);
        } else {
          reject(Error(req.statusText));
        }
      };

      req.onerror = function onerror() {
        reject(Error('Network Error'));
      };

      req.send();
    });
  },

  getJSON: function getJSON(url) {
    return require('helper').get(url).then(JSON.parse);
  },

  sortByKey: function sortByKey(key, d) {
    return d.sort(function (a, b) {
      return b[key] - a[key];
    });
  },

  limit: function limit(key, m, d) {
    return d.filter(function (n) {
      return n[key].isAfter(m);
    });
  },

  sum: function sum(a) {
    return a.reduce(function (b, c) {
      return b + c;
    }, 0);
  },

  one: function one() {
    return 1;
  },

  dictGet: function dictGet(dict, key) {
    var k = key.shift();

    if (!(k in dict)) {
      return null;
    }

    if (key.length === 0) {
      return dict[k];
    }

    return this.dictGet(dict[k], key);
  },

  listReplace: function listReplace(s, subst) {
    for (var key in subst) {
      if (subst.hasOwnProperty(key)) {
        var re = new RegExp(key, 'g');
        s = s.replace(re, subst[key]);
      }
    }
    return s;
  },

  hasLocation: function hasLocation(d) {
    return 'location' in d &&
      Math.abs(d.location.latitude) < 90 &&
      Math.abs(d.location.longitude) < 180;
  },

  subtract: function subtract(a, b) {
    var ids = {};

    b.forEach(function (d) {
      ids[d.node_id] = true;
    });

    return a.filter(function (d) {
      return !ids[d.node_id];
    });
  },

  /* Helpers working with links */

  showDistance: function showDistance(d) {
    if (isNaN(d.distance)) {
      return '';
    }

    return d.distance.toFixed(0) + ' m';
  },

  showTq: function showTq(d) {
    return (d * 100).toFixed(0) + '%';
  },

  attributeEntry: function attributeEntry(V, children, label, value) {
    if (value !== undefined) {
      if (typeof value !== 'object') {
        value = V.h('td', value);
      }

      children.push(V.h('tr', [
        V.h('th', _.t(label)),
        value
      ]));
    }
  },
  showStat: function showStat(V, o, subst) {
    var content = V.h('img', { attrs: { src: require('helper').listReplace(o.image, subst) } });

    if (o.href) {
      return V.h('p', V.h('a', {
        attrs:
          {
            href: require('helper').listReplace(o.href, subst),
            target: '_blank',
            title: require('helper').listReplace(o.title, subst)
          }
      }, content));
    }
    return V.h('p', content);
  },

  getTileBBox: function getTileBBox(s, map, tileSize, margin) {
    var tl = map.unproject([s.x - margin, s.y - margin]);
    var br = map.unproject([s.x + margin + tileSize, s.y + margin + tileSize]);

    return { minX: br.lat, minY: tl.lng, maxX: tl.lat, maxY: br.lng };
  },
  positionClients: function positionClients(ctx, p, startAngle, node, startDistance) {
    if (node.clients === 0) {
      return;
    }

    var radius = 3;
    var a = 1.2;
    var mode = 0;

    ctx.beginPath();
    ctx.fillStyle = config.client.wifi24;

    for (var orbit = 0, i = 0; i < node.clients; orbit++) {
      var distance = startDistance + orbit * 2 * radius * a;
      var n = Math.floor((Math.PI * distance) / (a * radius));
      var delta = node.clients - i;

      for (var j = 0; j < Math.min(delta, n); i++, j++) {
        if (mode !== 1 && i >= (node.clients_wifi24 + node.clients_wifi5)) {
          mode = 1;
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = config.client.wifi5;
        } else if (mode === 0 && i >= node.clients_wifi24) {
          mode = 2;
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = config.client.other;
        }
        var angle = 2 * Math.PI / n * j;
        var x = p.x + distance * Math.cos(angle + startAngle);
        var y = p.y + distance * Math.sin(angle + startAngle);

        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
      }
    }
    ctx.fill();
  }
});
