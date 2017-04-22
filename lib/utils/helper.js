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
    return d.slice().sort(function (a, b) {
      return a[key] - b[key];
    }).reverse();
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

  /* Helpers working with nodes */

  offline: function offline(d) {
    return !d.flags.online;
  },

  online: function online(d) {
    return d.flags.online;
  },

  hasLocation: function hasLocation(d) {
    return 'location' in d.nodeinfo &&
      Math.abs(d.nodeinfo.location.latitude) < 90 &&
      Math.abs(d.nodeinfo.location.longitude) < 180;
  },

  subtract: function subtract(a, b) {
    var ids = {};

    b.forEach(function (d) {
      ids[d.nodeinfo.node_id] = true;
    });

    return a.filter(function (d) {
      return !(d.nodeinfo.node_id in ids);
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
    return (1 / d.tq * 100).toFixed(0) + '%';
  },

  attributeEntry: function attributeEntry(el, label, value) {
    if (value === null || value === undefined) {
      return '';
    }

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.textContent = _.t(label);
    tr.appendChild(th);

    var td = document.createElement('td');

    if (typeof value === 'function') {
      value(td);
    } else {
      td.appendChild(document.createTextNode(value));
    }

    tr.appendChild(td);

    el.appendChild(tr);

    return td;
  },

  showStat: function showStat(o, subst) {
    var content;
    subst = typeof subst !== 'undefined' ? subst : {};

    content = document.createElement('img');
    content.src = require('helper').listReplace(o.image, subst);

    var p = document.createElement('p');

    if (o.href) {
      var link = document.createElement('a');
      link.target = '_blank';
      link.href = require('helper').listReplace(o.href, subst);
      link.appendChild(content);

      if (o.title) {
        link.title = require('helper').listReplace(o.title, subst);
      }

      p.appendChild(link);
    } else {
      p.appendChild(content);
    }

    return p;
  },

  getTileBBox: function getTileBBox(s, map, tileSize, margin) {
    var tl = map.unproject([s.x - margin, s.y - margin]);
    var br = map.unproject([s.x + margin + tileSize, s.y + margin + tileSize]);

    return { minX: br.lat, minY: tl.lng, maxX: tl.lat, maxY: br.lng };
  },
  positionClients: function positionClients(ctx, p, startAngle, clients, startDistance) {
    if (clients === 0) {
      return;
    }

    var radius = 3;
    var a = 1.2;

    for (var orbit = 0, i = 0; i < clients; orbit++) {
      var distance = startDistance + orbit * 2 * radius * a;
      var n = Math.floor((Math.PI * distance) / (a * radius));
      var delta = clients - i;

      for (var j = 0; j < Math.min(delta, n); i++, j++) {
        var angle = 2 * Math.PI / n * j;
        var x = p.x + distance * Math.cos(angle + startAngle);
        var y = p.y + distance * Math.sin(angle + startAngle);

        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
      }
    }
  }
});
