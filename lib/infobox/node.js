define(['sorttable', 'snabbdom', 'd3-interpolate', 'moment', 'helper'],
  function (SortTable, V, d3Interpolate, moment, helper) {
    'use strict';
    V = V.default;

    function showGeoURI(d) {
      if (!helper.hasLocation(d)) {
        return undefined;
      }

      return V.h('td',
        V.h('a',
          { props: { href: 'geo:' + d.location.latitude + ',' + d.location.longitude } },
          Number(d.location.latitude.toFixed(6)) + ', ' + Number(d.location.longitude.toFixed(6))
        )
      );
    }

    function showStatus(d) {
      return V.h('td',
        { props: { className: d.is_unseen ? 'unseen' : (d.is_online ? 'online' : 'offline') } },
        _.t((d.is_online ? 'node.lastOnline' : 'node.lastOffline'), {
          time: d.lastseen.fromNow(),
          date: d.lastseen.format('DD.MM.YYYY, H:mm:ss')
        }));
    }

    function showFirmware(d) {
      return [
        helper.dictGet(d, ['firmware', 'release']),
        helper.dictGet(d, ['firmware', 'base'])
      ].filter(function (n) {
        return n !== null;
      }).join(' / ') || undefined;
    }

    function showSite(d, config) {
      var site = helper.dictGet(d, ['site_code']);
      var rt = site;
      if (config.siteNames) {
        config.siteNames.forEach(function (t) {
          if (site === t.site) {
            rt = t.name;
          }
        });
      }
      return rt || undefined;
    }

    function showUptime(d) {
      if (!('uptime' in d)) {
        return undefined;
      }

      return moment.utc(d.uptime).local().fromNow(true);
    }

    function showFirstseen(d) {
      if (!('firstseen' in d)) {
        return undefined;
      }

      return d.firstseen.fromNow(true);
    }

    function showClients(d) {
      if (!d.is_online) {
        return undefined;
      }

      var clients = [
        V.h('span', [
          d.clients > 0 ? d.clients : _.t('none'),
          V.h('br'),
          V.h('i', { props: { className: 'ion-people', title: _.t('node.clients') } })
        ]),
        V.h('span',
          { props: { className: 'legend-24ghz'}},
          [
            d.clients_wifi24,
            V.h('br'),
            V.h('span', { props: { className: 'symbol', title: '2,4 Ghz'}})
          ]),
        V.h('span',
          { props: { className: 'legend-5ghz'}},
          [
            d.clients_wifi5,
            V.h('br'),
            V.h('span', { props: { className: 'symbol', title: '5 Ghz'}})
          ]),
        V.h('span',
          { props: { className: 'legend-others'}},
          [
            d.clients_other,
            V.h('br'),
            V.h('span', { props: { className: 'symbol', title: _.t('others')}})
          ])
      ];

      return V.h('td', { props: { className: 'clients' } }, clients);
    }

    function showIPs(d) {
      var ips = helper.dictGet(d, ['network', 'addresses']);
      if (ips === null) {
        return undefined;
      }

      ips.sort();

      var string = [];
      ips.forEach(function (ip, i) {
        var link = !ip.startsWith('fe80:');

        if (i > 0) {
          string.push(V.h('br'));
        }

        if (link) {
          string.push(V.h('a', { props: { href: 'http://[' + ip + ']/', target: '_blank' } }, ip));
        } else {
          string.push(ip);
        }
      });
      return V.h('td', string);
    }

    function showBar(v, width, warning) {
      return V.h('span',
        { props: { className: 'bar' + (warning ? ' warning' : '') } },
        [
          V.h('span',
            {
              style: { width: (width * 100) + '%' }
            }),
          V.h('label', v)
        ]
      );
    }

    function showLoad(d) {
      if (!('loadavg' in d)) {
        return undefined;
      }

      var value = d.loadavg.toFixed(2);
      var width = d.loadavg % 1;
      var warning = false;
      if (d.loadavg >= d.nproc) {
        warning = true;
      }
      return showBar(value, width, warning);
    }

    function showRAM(d) {
      if (!('memory_usage' in d)) {
        return undefined;
      }

      var value = Math.round(d.memory_usage * 100) + ' %';
      var width = d.memory_usage;
      var warning = false;
      if (d.memory_usage >= 0.8) {
        warning = true;
      }
      return showBar(value, width, warning);
    }

    function showAutoupdate(d) {
      var au = helper.dictGet(d, ['autoupdater']);
      if (!au) {
        return undefined;
      }

      return au.enabled ? _.t('node.activated', { branch: au.branch }) : _.t('node.deactivated');
    }

    function showStatImg(o, d) {
      var subst = {};
      subst['{NODE_ID}'] = d.node_id;
      subst['{NODE_NAME}'] = d.hostname.replace(/[^a-z0-9\-]/ig, '_');
      subst['{TIME}'] = d.lastseen.format('DDMMYYYYHmmss');
      subst['{LOCALE}'] = _.locale();
      return helper.showStat(V, o, subst);
    }

    return function (config, el, router, d, linkScale, gateways) {
      function renderNeighbourRow(n) {
        var icons = [];
        icons.push(V.h('span', { props: { className: n.incoming ? 'ion-arrow-left-c' : 'ion-arrow-right-c' } }));
        if (helper.hasLocation(n.node)) {
          icons.push(V.h('span', { props: { className: 'ion-location' } }));
        }

        var name = V.h('a', {
          props: {
            className: 'online',
            href: router.generateLink({ node: n.node.node_id })
          }, on: {
            click: function (e) {
              router.fullUrl({ node: n.node.node_id }, e);
            }
          }
        }, n.node.hostname);

        var td1 = V.h('td', icons);
        var td2 = V.h('td', name);
        var td3 = V.h('td', (n.node.clients ? n.node.clients.toString() : '0'));
        var td4 = V.h('td', { style: { color: linkScale((n.link.source_tq + n.link.target_tq) / 2) } }, helper.showTq(n.link.source_tq) + ' - ' + helper.showTq(n.link.target_tq));
        var td5 = V.h('td', helper.showDistance(n.link));

        return V.h('tr', [td1, td2, td3, td4, td5]);
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
          return ('clients' in a.node ? a.node.clients : -1) -
            ('clients' in b.node ? b.node.clients : -1);
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

        children.push(helper.attributeEntry(V, 'node.status', showStatus(d)));
        children.push(helper.attributeEntry(V, 'node.gateway', d.is_gateway ? 'ja' : null));
        children.push(helper.attributeEntry(V, 'node.coordinates', showGeoURI(d)));

        if (config.nodeInfobox && config.nodeInfobox.contact) {
          children.push(helper.attributeEntry(V, 'node.contact', helper.dictGet(d, ['owner', 'contact'])));
        }

        children.push(helper.attributeEntry(V, 'node.hardware', helper.dictGet(d, ['model'])));
        children.push(helper.attributeEntry(V, 'node.primaryMac', helper.dictGet(d, ['network', 'mac'])));
        children.push(helper.attributeEntry(V, 'node.firmware', showFirmware(d)));
        children.push(helper.attributeEntry(V, 'node.site', showSite(d, config)));
        children.push(helper.attributeEntry(V, 'node.uptime', showUptime(d)));
        children.push(helper.attributeEntry(V, 'node.firstSeen', showFirstseen(d)));
        if (config.nodeInfobox && config.nodeInfobox.hardwareUsage) {
          children.push(helper.attributeEntry(V, 'node.systemLoad', showLoad(d)));
          children.push(helper.attributeEntry(V, 'node.ram', showRAM(d)));
        }
        children.push(helper.attributeEntry(V, 'node.ipAddresses', showIPs(d)));
        children.push(helper.attributeEntry(V, 'node.selectedGateway', gateways[helper.dictGet(d, ['gateway'])]));
        children.push(helper.attributeEntry(V, 'node.update', showAutoupdate(d)));
        children.push(helper.attributeEntry(V, 'node.clients', showClients(d)));

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
        d = data.nodes.all.find(function (a) {
          return a.node_id === d.node_id;
        });
        self.render();
      };
      return self;
    };
  });
