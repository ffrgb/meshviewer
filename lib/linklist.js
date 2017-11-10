define(['sorttable', 'snabbdom', 'helper'], function (SortTable, V, helper) {
  'use strict';
  V = V.default;

  function linkName(d) {
    return (d.source ? d.source.hostname : d.source.id) + ' – ' + d.target.hostname;
  }

  var headings = [{
    name: 'node.nodes',
    sort: function (a, b) {
      return linkName(a).localeCompare(linkName(b));
    },
    reverse: false
  }, {
    name: 'node.tq',
    class: 'ion-connection-bars',
    sort: function (a, b) {
      return (a.source_tq + a.target_tq) / 2 - (b.source_tq + b.target_tq) / 2;
    },
    reverse: true
  }, {
    name: 'node.connectionType',
    class: 'ion-layer',
    sort: function (a, b) {
      return a.type.localeCompare(b.type);
    },
    reverse: true
  }, {
    name: 'node.distance',
    class: 'ion-arrow-resize',
    sort: function (a, b) {
      return (a.distance === undefined ? -1 : a.distance) -
        (b.distance === undefined ? -1 : b.distance);
    },
    reverse: true
  }];

  return function (linkScale) {
    var table = new SortTable(headings, 2, renderRow);

    function renderRow(d) {
      var td1Content = [V.h('a', {
        props: {
          href: router.generateLink({ link: d.id })
        }, on: {
          click: function (e) {
            router.fullUrl({ link: d.id }, e);
          }
        }
      }, linkName(d))];

      return V.h('tr', [
        V.h('td', td1Content),
        V.h('td', { style: { color: linkScale((d.source_tq + d.target_tq) / 2) } }, helper.showTq(d.source_tq) + ' - ' + helper.showTq(d.target_tq)),
        V.h('td', d.type),
        V.h('td', helper.showDistance(d))
      ]);
    }

    this.render = function render(d) {
      var h2 = document.createElement('h2');
      h2.textContent = _.t('node.links');
      d.appendChild(h2);
      table.el.elm.classList.add('link-list');
      d.appendChild(table.el.elm);
    };

    this.setData = function setData(d) {
      table.setData(d.links);
    };
  };
});
