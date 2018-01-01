define(['sorttable', 'snabbdom', 'd3-interpolate', 'moment', 'helper', 'utils/node'],
  function (SortTable, V, d3Interpolate, moment, helper, nodef) {
    'use strict';
    V = V.default;

    function showStatImg(o, d) {
      var subst = {
        '{NODE_ID}': d.node_id,
        '{NODE_NAME}': d.hostname.replace(/[^a-z0-9\-]/ig, '_'),
        '{TIME}': d.lastseen.format('DDMMYYYYHmmss'),
        '{LOCALE}': _.locale()
      };
      return helper.showStat(V, o, subst);
    }

    return function (el, d, linkScale, nodeDict) {
      function nodeLink(node) {
        return V.h('a', {
          props: {
            className: node.is_online ? 'online' : 'offline',
            href: router.generateLink({ node: node.node_id })
          }, on: {
            click: function (e) {
              router.fullUrl({ node: node.node_id }, e);
            }
          }
        }, node.hostname);
      }

      function nodeIdLink(nodeId) {
        if (nodeDict[nodeId]) {
          return nodeLink(nodeDict[nodeId]);
        }
        return nodeId;
      }

      function showGateway(node) {
        var gatewayCols = [
          V.h('span', [
            nodeIdLink(node.gateway_nexthop),
            V.h('br'),
            _.t('node.nexthop')
          ]),
          V.h('span', { props: { className: 'ion-arrow-right-c' } }),
          V.h('span', [
            nodeIdLink(node.gateway),
            V.h('br'),
            'IPv4'
          ])
        ];

        if (node.gateway6 !== undefined) {
          gatewayCols.push(V.h('span', [
            nodeIdLink(node.gateway6),
            V.h('br'),
            'IPv6'
          ]));
        }

        return V.h('td', { props: { className: 'gateway' } }, gatewayCols);
      }

      function renderNeighbourRow(n) {
        var icons = '';
        if (helper.hasLocation(n.node)) {
          icons = V.h('span', { props: { className: 'ion-location' } });
        }

        return V.h('tr', [
          V.h('td', icons),
          V.h('td', nodeLink(n.node)),
          V.h('td', n.node.clients),
          V.h('td', { style: { color: linkScale((n.link.source_tq + n.link.target_tq) / 2) } }, helper.showTq(n.link.source_tq) + ' - ' + helper.showTq(n.link.target_tq)),
          V.h('td', helper.showDistance(n.link))
        ]);
      }

      var self = this;
      var header = document.createElement('h2');
      var table = document.createElement('table');
      var images = document.createElement('div');
      var neighbours = document.createElement('h3');
      var headings = [{
        name: ''
      }, {
        name: 'node.nodes',
        sort: function (a, b) {
          return a.node.hostname.localeCompare(b.node.hostname);
        },
        reverse: false
      }, {
        name: 'node.clients',
        class: 'ion-people',
        sort: function (a, b) {
          return a.node.clients - b.node.clients;
        },
        reverse: true
      }, {
        name: 'node.tq',
        class: 'ion-connection-bars',
        sort: function (a, b) {
          return a.link.source_tq - b.link.source_tq;
        },
        reverse: true
      }, {
        name: 'node.distance',
        class: 'ion-arrow-resize',
        sort: function (a, b) {
          return (a.link.distance === undefined ? -1 : a.link.distance) -
            (b.link.distance === undefined ? -1 : b.link.distance);
        },
        reverse: true
      }];
      var tableNeighbour = new SortTable(headings, 1, renderNeighbourRow);

      el.appendChild(header);
      el.appendChild(table);
      el.appendChild(neighbours);
      el.appendChild(tableNeighbour.el);
      el.appendChild(images);

      self.render = function render() {
        V.patch(header, V.h('h2', d.hostname));

        var children = [];

        config.nodeAttr.forEach(function (row) {
          var field = d[row.value];
          if (typeof row.value === 'function') {
            field = row.value(d, nodeDict);
          } else if (nodef['show' + row.value] !== undefined) {
            field = nodef['show' + row.value](d);
          }

          if (field) {
            if (typeof field !== 'object') {
              field = V.h('td', field);
            }
            children.push(V.h('tr', [
              row.name !== undefined ? V.h('th', _.t(row.name)) : null,
              field
            ]));
          }
        });

        children.push(V.h('tr', [
          V.h('th', _.t('node.gateway')),
          showGateway(d)
        ]));

        var elNew = V.h('table', children);
        table = V.patch(table, elNew);
        table.elm.classList.add('attributes');

        V.patch(neighbours, V.h('h3', _.t('node.link', d.neighbours.length) + ' (' + d.neighbours.length + ')'));
        if (d.neighbours.length > 0) {
          tableNeighbour.setData(d.neighbours);
          tableNeighbour.el.elm.classList.add('node-links');
        }

        if (config.nodeInfos) {
          var img = [];
          config.nodeInfos.forEach(function (nodeInfo) {
            img.push(V.h('h4', nodeInfo.name));
            img.push(showStatImg(nodeInfo, d));
          });
          images = V.patch(images, V.h('div', img));
        }
      };

      self.setData = function setData(data) {
        if (data.nodeDict[d.node_id]) {
          d = data.nodeDict[d.node_id];
        }
        self.render();
      };
      return self;
    };
  });
