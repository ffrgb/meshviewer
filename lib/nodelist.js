define(['sorttable', 'snabbdom', 'helper'], function (SortTable, V, helper) {
  'use strict';
  V = V.default;

  function showUptime(uptime) {
    // 1000ms are 1 second and 60 second are 1min: 60 * 1000 =  60000
    if (isNaN(uptime)) {
      return '-';
    }
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
      if (isNaN(a.uptime) || isNaN(b.uptime)) {
        return isNaN(a.uptime) - isNaN(b.uptime);
      }
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
      return a.clients - b.clients;
    },
    reverse: true
  }];

  return function () {
    function renderRow(d) {
      var td0Content = '';
      if (helper.hasLocation(d)) {
        td0Content = V.h('span', { props: { className: 'icon ion-location', title: _.t('location.location') } });
      }

      var td1Content = V.h('a', {
        props: {
          className: ['hostname', d.is_online ? 'online' : 'offline'].join(' '),
          href: router.generateLink({ node: d.node_id })
        }, on: {
          click: function (e) {
            router.fullUrl({ node: d.node_id }, e);
          }
        }
      }, d.hostname);

      return V.h('tr', [
        V.h('td', td0Content),
        V.h('td', td1Content),
        V.h('td', showUptime(d.uptime)),
        V.h('td', d.neighbours.length),
        V.h('td', d.clients)
      ]);
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
        return n;
      });

      table.setData(data);
    };
  };
});
