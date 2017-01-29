define(['sorttable', 'virtual-dom', 'helper'], function (SortTable, V, helper) {
  'use strict';

  function getUptime(now, d) {
    if (d.flags.online && 'uptime' in d.statistics) {
      return Math.round(d.statistics.uptime);
    } else if (!d.flags.online && 'lastseen' in d) {
      return Math.round(-(now.unix() - d.lastseen.unix()));
    }
    return 0;
  }

  function showUptime(uptime) {
    var s = '';
    uptime /= 3600;

    if (uptime !== undefined) {
      if (Math.abs(uptime) >= 24) {
        s = Math.round(uptime / 24) + 'd';
      } else {
        s = Math.round(uptime) + 'h';
      }
    }

    return s;
  }

  var headings = [{
    name: ''
  }, {
    name: 'Knoten',
    sort: function (a, b) {
      return a.nodeinfo.hostname.localeCompare(b.nodeinfo.hostname);
    },
    reverse: false
  }, {
    name: 'Uptime',
    sort: function (a, b) {
      return a.uptime - b.uptime;
    },
    reverse: true
  }, {
    name: '#Links',
    sort: function (a, b) {
      return a.meshlinks - b.meshlinks;
    },
    reverse: true
  }, {
    name: 'Clients',
    sort: function (a, b) {
      return ('clients' in a.statistics ? a.statistics.clients : -1) -
        ('clients' in b.statistics ? b.statistics.clients : -1);
    },
    reverse: true
  }];

  return function (router) {
    function renderRow(d) {
      var td0Content = [];
      var td1Content = [];
      var aClass = ['hostname', d.flags.online ? 'online' : 'offline'];

      td1Content.push(V.h('a', {
        className: aClass.join(' '),
        onclick: router.node(d),
        href: '#'
      }, d.nodeinfo.hostname));

      if (helper.hasLocation(d)) {
        td0Content.push(V.h('span', { className: 'icon ion-location' }));
      }

      var td0 = V.h('td', td0Content);
      var td1 = V.h('td', td1Content);
      var td2 = V.h('td', showUptime(d.uptime));
      var td3 = V.h('td', d.meshlinks.toString());
      var td4 = V.h('td', Number('clients' in d.statistics ? d.statistics.clients : 0).toFixed(0));

      return V.h('tr', [td0, td1, td2, td3, td4]);
    }

    var table = new SortTable(headings, 1, renderRow);
    table.el.classList.add('node-list');

    this.render = function render(d) {
      var h2 = document.createElement('h2');
      h2.textContent = 'Alle Knoten';
      d.appendChild(h2);

      d.appendChild(table.el);
    };

    this.setData = function setData(d) {
      var data = d.nodes.all.map(function (e) {
        var n = Object.create(e);
        n.uptime = getUptime(d.now, e);
        n.meshlinks = e.meshlinks || 0;
        return n;
      });

      table.setData(data);
    };
  };
});
