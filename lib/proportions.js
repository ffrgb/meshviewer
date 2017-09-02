define(['d3-interpolate', 'snabbdom', 'filters/genericnode', 'helper'],
  function (d3Interpolate, V, Filter, helper) {
    'use strict';

    return function (config, filterManager) {
      var self = this;
      var scale = d3Interpolate.interpolate('#770038', '#dc0067');
      V = V.default;

      var statusTable;
      var fwTable;
      var hwTable;
      var geoTable;
      var autoTable;
      var gatewayTable;
      var siteTable;


      function showStatGlobal(o) {
        return helper.showStat(o);
      }

      function count(nodes, key, f) {
        var dict = {};

        nodes.forEach(function (d) {
          var v = helper.dictGet(d, key.slice(0));

          if (f !== undefined) {
            v = f(v);
          }

          if (v === null) {
            return;
          }

          dict[v] = 1 + (v in dict ? dict[v] : 0);
        });

        return Object.keys(dict).map(function (d) {
          return [d, dict[d], key, f];
        });
      }

      function addFilter(filter) {
        return function () {
          filterManager.addFilter(filter);
          return false;
        };
      }

      function fillTable(name, table, data) {
        if (!table) {
          table = document.createElement('table');
        }

        var max = Math.max.apply(Math, data.map(function (o) {
          return o[1];
        }));

        var items = data.map(function (d) {
          var v = d[1] / max;

          var filter = new Filter(_.t(name), d[2], d[0], d[3]);

          var a = V.h('a', { props: { href: '#' }, on: { click: addFilter(filter) } }, d[0]);

          var th = V.h('th', a);
          var td = V.h('td', V.h('span', {
            style: {
              width: Math.round(v * 100) + '%',
              backgroundColor: scale(v),
              color: 'white'
            }
          }, d[1].toFixed(0)));

          return V.h('tr', [th, td]);
        });
        var tableNew = V.h('table', { props: { className: 'proportion' } }, items);
        return V.patch(table, tableNew);
      }

      self.setData = function setData(data) {
        var onlineNodes = data.nodes.all.filter(helper.online);
        var nodes = onlineNodes.concat(data.nodes.lost);
        var nodeDict = {};

        data.nodes.all.forEach(function (d) {
          nodeDict[d.nodeinfo.node_id] = d;
        });

        var statusDict = count(nodes, ['flags', 'online'], function (d) {
          return d ? 'online' : 'offline';
        });
        var fwDict = count(nodes, ['nodeinfo', 'software', 'firmware', 'release']);
        var hwDict = count(nodes, ['nodeinfo', 'hardware', 'model']);
        var geoDict = count(nodes, ['nodeinfo', 'location'], function (d) {
          return d && d.longitude && d.latitude ? _.t('yes') : _.t('no');
        });

        var autoDict = count(nodes, ['nodeinfo', 'software', 'autoupdater'], function (d) {
          if (d === null) {
            return null;
          } else if (d.enabled) {
            return d.branch;
          }
          return _.t('node.deactivated');
        });

        var gatewayDict = count(nodes, ['statistics', 'gateway'], function (d) {
          for (var mac in data.gateways) {
            if (data.gateways.hasOwnProperty(mac) && mac === d) {
              d = data.gateways[mac];
              return d;
            }
          }
          return null;
        });

        var siteDict = count(nodes, ['nodeinfo', 'system', 'site_code'], function (d) {
          if (config.siteNames) {
            config.siteNames.forEach(function (t) {
              if (d === t.site) {
                d = t.name;
              }
            });
          }
          return d;
        });

        statusTable = fillTable('node.status', statusTable, statusDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fwTable = fillTable('node.firmware', fwTable, fwDict.sort(function (a, b) {
          if (b[0] < a[0]) {
            return -1;
          }
          if (b[0] > a[0]) {
            return 1;
          }
          return 0;
        }));
        hwTable = fillTable('node.hardware', hwTable, hwDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        geoTable = fillTable('node.visible', geoTable, geoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        autoTable = fillTable('node.update', autoTable, autoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        gatewayTable = fillTable('node.gateway', gatewayTable, gatewayDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        siteTable = fillTable('node.site', siteTable, siteDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
      };

      self.render = function render(el) {
        var h2;
        self.renderSingle(el, 'node.status', statusTable);
        self.renderSingle(el, 'node.firmware', fwTable);
        self.renderSingle(el, 'node.hardware', hwTable);
        self.renderSingle(el, 'node.visible', geoTable);
        self.renderSingle(el, 'node.update', autoTable);
        self.renderSingle(el, 'node.gateway', gatewayTable);
        self.renderSingle(el, 'node.site', siteTable);

        if (config.globalInfos) {
          config.globalInfos.forEach(function (globalInfo) {
            h2 = document.createElement('h2');
            h2.textContent = globalInfo.name;
            el.appendChild(h2);
            el.appendChild(showStatGlobal(globalInfo));
          });
        }
      };

      self.renderSingle = function renderSingle(el, heading, table) {
        if (table.children.length > 0) {
          var h2 = document.createElement('h2');
          h2.classList.add('proportion-header');
          h2.textContent = _.t(heading);
          h2.onclick = function onclick() {
            table.elm.classList.toggle('hide');
          };
          el.appendChild(h2);
          el.appendChild(table.elm);
        }
      };
      return self;
    };
  });
