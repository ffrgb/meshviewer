define(['d3-interpolate', 'snabbdom', 'utils/version', 'filters/genericnode', 'helper'],
  function (d3Interpolate, V, versionCompare, Filter, helper) {
    'use strict';
    V = V.default;

    return function (filterManager) {
      var self = this;
      var scale = d3Interpolate.interpolate(config.forceGraph.tqFrom, config.forceGraph.tqTo);
      var time;

      var statusTable;
      var fwTable;
      var hwTable;
      var geoTable;
      var autoTable;
      var gatewayTable;
      var gateway6Table;
      var domainTable;

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

          var a = V.h('a', { on: { click: addFilter(filter) } }, d[0]);

          var th = V.h('th', a);
          var td = V.h('td', V.h('span', {
            style: {
              width: 'calc(25px + ' + Math.round(v * 90) + '%)',
              backgroundColor: scale(v)
            }
          }, d[1].toFixed(0)));

          return V.h('tr', [th, td]);
        });
        var tableNew = V.h('table', { props: { className: 'proportion' } }, items);
        return V.patch(table, tableNew);
      }

      self.setData = function setData(data) {
        var onlineNodes = data.nodes.online;
        var nodes = onlineNodes.concat(data.nodes.lost);
        time = data.timestamp;

        function hostnameOfNodeID(nodeid) {
          var gateway = data.nodeDict[nodeid];
          if (gateway) {
            return gateway.hostname;
          }
          return null;
        }

        var gatewayDict = count(nodes, ['gateway'], hostnameOfNodeID);
        var gateway6Dict = count(nodes, ['gateway6'], hostnameOfNodeID);

        var statusDict = count(nodes, ['is_online'], function (d) {
          return d ? 'online' : 'offline';
        });
        var fwDict = count(nodes, ['firmware', 'release']);
        var replHw = ['tp-link ', 'ubiquiti nanostation ', 'ubiquiti ', 'nanostation', 'linksys '];
        var hwDict = count(nodes, ['model'], function (d) {
          if (!d) {
            return d;
          }
          for (var i in replHw) {
            var k = replHw[i];
            if (d.toLowerCase().startsWith(k)) {
              return d.slice(k.length);
            }
          }
          return d;
        });
        var geoDict = count(nodes, ['location'], function (d) {
          return d && d.longitude && d.latitude ? _.t('yes') : _.t('no');
        });

        var autoDict = count(nodes, ['autoupdater'], function (d) {
          if (d.enabled) {
            return d.branch;
          }
          return _.t('node.deactivated');
        });

        var domainDict = count(nodes, ['domain'], function (d) {
          if (config.domainNames) {
            config.domainNames.some(function (t) {
              if (d === t.domain) {
                d = t.name;
                return true;
              }
            });
          }
          return d;
        });

        statusTable = fillTable('node.status', statusTable, statusDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fwTable = fillTable('node.firmware', fwTable, fwDict.sort(versionCompare));
        hwTable = fillTable('node.hardware', hwTable, hwDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        geoTable = fillTable('node.visible', geoTable, geoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        autoTable = fillTable('node.update', autoTable, autoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        gatewayTable = fillTable('node.selectedGatewayIPv4', gatewayTable, gatewayDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        gateway6Table = fillTable('node.selectedGatewayIPv6', gateway6Table, gateway6Dict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        domainTable = fillTable('node.domain', domainTable, domainDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
      };

      self.render = function render(el) {
        self.renderSingle(el, 'node.status', statusTable);
        self.renderSingle(el, 'node.firmware', fwTable);
        self.renderSingle(el, 'node.hardware', hwTable);
        self.renderSingle(el, 'node.visible', geoTable);
        self.renderSingle(el, 'node.update', autoTable);
        self.renderSingle(el, 'node.selectedGatewayIPv4', gatewayTable);
        self.renderSingle(el, 'node.selectedGatewayIPv6', gateway6Table);
        self.renderSingle(el, 'node.domain', domainTable);

        if (config.globalInfos) {
          var images = document.createElement('div');
          el.appendChild(images);
          var img = [];
          var subst = {
            '{TIME}': time,
            '{LOCALE}': _.locale()
          };
          config.globalInfos.forEach(function (globalInfo) {
            img.push(V.h('h2', globalInfo.name));
            img.push(helper.showStat(V, globalInfo, subst));
          });
          V.patch(images, V.h('div', img));
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
