define(['sorttable', 'snabbdom', 'helper'], function (SortTable, V, helper) {
  'use strict';
  V = V.default;

  function showUptime(uptime) {
    // 1000ms are 1 second and 60 second are 1min: 60 * 1000 =  60000
    var s = uptime / 60000;
    if (Math.abs(s) < 60) {
      return Math.round(s) + ' m';
    }
    s /= 60;
    if (Math.abs(s) < 24) {
      return Math.round(s) + ' h';
    }
    s /= 24;
    return Math.round(s) + ' d';
  }

  var headings = [{
    name: ''
  }, {
    name: 'node.nodes',
    sort: function (a, b) {
      return a.hostname.localeCompare(b.hostname);
    },
    reverse: false
  }, {
    name: 'node.uptime',
    class: 'ion-time',
    sort: function (a, b) {
      return a.uptime - b.uptime;
    },
    reverse: true
  }, {
    name: 'node.links',
    class: 'ion-share-alt',
    sort: function (a, b) {
      return a.neighbours.length - b.neighbours.length;
    },
    reverse: true
  }, {
    name: 'node.clients',
    class: 'ion-people',
    sort: function (a, b) {
      return ('clients' in a ? a.clients : -1) -
        ('clients' in b ? b.clients : -1);
    },
    reverse: true
  }];

  return function (router) {
    function renderRow(d) {
      var td0Content = [];
      var td1Content = [];
      var aClass = ['hostname', d.is_online ? 'online' : 'offline'];

      td1Content.push(V.h('a', {
        props: {
          className: aClass.join(' '),
          href: router.generateLink({ node: d.node_id })
        }, on: {
          click: function (e) {
            router.fullUrl({ node: d.node_id }, e);
          }
        }
      }, d.hostname));

      if (helper.hasLocation(d)) {
        td0Content.push(V.h('span', { props: { className: 'icon ion-location' } }));
      }

      var td0 = V.h('td', td0Content);
      var td1 = V.h('td', td1Content);
      var td2 = V.h('td', showUptime(d.uptime));
      var td3 = V.h('td', d.neighbours.length);
      var td4 = V.h('td', Number('clients' in d ? d.clients : 0).toFixed(0));

      return V.h('tr', [td0, td1, td2, td3, td4]);
    }

    var table = new SortTable(headings, 1, renderRow);

    this.render = function render(d) {
      var h2 = document.createElement('h2');
      h2.textContent = _.t('node.all');
      d.appendChild(h2);
      table.el.elm.classList.add('node-list');
      d.appendChild(table.el.elm);
    };

    this.setData = function setData(d) {
      var data = d.nodes.all.map(function (e) {
        var n = Object.create(e);
        if (e.is_online) {
          n.uptime = d.now - new Date(e.uptime).getTime();
        } else {
          n.uptime = e.lastseen - d.now;
        }
        n.neighbours = e.neighbours;
        return n;
      });

      table.setData(data);
    };
  };
});
