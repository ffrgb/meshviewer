define(['virtual-dom', 'filters/genericnode', 'helper', 'utils/constance'],
  function (V, Filter, helper, constance) {
    'use strict';

    return function (config, filterManager) {
      var self = this;

      var statusTable = document.createElement('table');
      statusTable.classList.add('proportion');
      var fwTable = statusTable.cloneNode(false);
      var hwTable = statusTable.cloneNode(false);
      var geoTable = statusTable.cloneNode(false);
      var autoTable = statusTable.cloneNode(false);
      var siteTable = statusTable.cloneNode(false);

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
        if (!table.last) {
          table.last = V.h('table');
        }

        var max = Math.max.apply(Math, data.map(function (o) {
          return o[1];
        }));

        var items = data.map(function (d) {
          var v = d[1] / max;

          var filter = new Filter(_.t(name), d[2], d[0], d[3]);

          var a = V.h('a', { href: '#', onclick: addFilter(filter) }, d[0]);

          var th = V.h('th', a);
          var td = V.h('td', V.h('span', {
            style: {
              width: Math.round(v * 100) + '%',
              backgroundColor: constance.backgroundScale(v),
              color: 'white'
            }
          }, d[1].toFixed(0)));

          return V.h('tr', [th, td]);
        });

        var tableNew = V.h('table', items);
        table = V.patch(table, V.diff(table.last, tableNew));
        table.last = tableNew;
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

        var siteDict = count(nodes, ['nodeinfo', 'system', 'site_code'], function (d) {
          var rt = d;
          if (config.siteNames) {
            config.siteNames.forEach(function (t) {
              if (d === t.site) {
                rt = t.name;
              }
            });
          }
          return rt;
        });

        fillTable('node.status', statusTable, statusDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fillTable('node.firmware', fwTable, fwDict.sort(function (a, b) {
          if (b[0] < a[0]) {
            return -1;
          }
          if (b[0] > a[0]) {
            return 1;
          }
          return 0;
        }));
        fillTable('node.hardware', hwTable, hwDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fillTable('node.visible', geoTable, geoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fillTable('node.update', autoTable, autoDict.sort(function (a, b) {
          return b[1] - a[1];
        }));
        fillTable('node.site', siteTable, siteDict.sort(function (a, b) {
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
        var h2 = document.createElement('h2');
        h2.classList.add('proportion-header');
        h2.textContent = _.t(heading);
        h2.onclick = function onclick() {
          table.classList.toggle('hide');
        };
        el.appendChild(h2);
        el.appendChild(table);
      };
      return self;
    };
  });
