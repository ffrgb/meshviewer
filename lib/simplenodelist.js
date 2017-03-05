define(['moment', 'virtual-dom', 'helper'], function (moment, V, helper) {
  'use strict';

  return function (nodes, field, router, title) {
    var self = this;
    var el;
    var tbody;

    self.render = function render(d) {
      el = d;
    };

    self.setData = function setData(data) {
      var list = data.nodes[nodes];

      if (list.length === 0) {
        tbody = null;
        return;
      }

      if (!tbody) {
        var h2 = document.createElement('h2');
        h2.textContent = title;
        el.appendChild(h2);

        var table = document.createElement('table');
        table.classList.add('node-list');
        el.appendChild(table);

        tbody = document.createElement('tbody');
        tbody.last = V.h('tbody');
        table.appendChild(tbody);
      }

      var items = list.map(function (d) {
        var time = moment(d[field]).from(data.now);
        var td0Content = [];
        var td1Content = [];

        var aClass = ['hostname', d.flags.online ? 'online' : 'offline'];

        td1Content.push(V.h('a', {
          className: aClass.join(' '),
          href: router.generateLink({ node: d.nodeinfo.node_id }),
          onclick: function (e) {
            router.fullUrl({ node: d.nodeinfo.node_id }, e);
          }
        }, d.nodeinfo.hostname));

        if (helper.hasLocation(d)) {
          td0Content.push(V.h('span', { className: 'icon ion-location' }));
        }

        var td0 = V.h('td', td0Content);
        var td1 = V.h('td', td1Content);
        var td2 = V.h('td', time);

        return V.h('tr', [td0, td1, td2]);
      });

      var tbodyNew = V.h('tbody', items);
      tbody = V.patch(tbody, V.diff(tbody.last, tbodyNew));
      tbody.last = tbodyNew;
    };

    return self;
  };
});
