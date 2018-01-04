define(['moment', 'snabbdom', 'helper'], function (moment, V, helper) {
  'use strict';
  V = V.default;

  return function (nodes, field, title) {
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
          V.h('td', moment(d[field]).from(data.now))
        ]);
      });

      var tbodyNew = V.h('tbody', items);
      tbody = V.patch(tbody, tbodyNew);
    };

    return self;
  };
});
