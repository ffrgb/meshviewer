define(['sorttable', 'snabbdom', 'd3-interpolate', 'moment', 'helper'],
  function (SortTable, V, d3Interpolate, moment, helper) {
    'use strict';
    V = V.default;

    function showGeoURI(d) {
      if (!helper.hasLocation(d)) {
        return undefined;
      }

      return function (el) {
        var a = document.createElement('a');
        a.textContent = Number(d.nodeinfo.location.latitude.toFixed(6)) + ', ' + Number(d.nodeinfo.location.longitude.toFixed(6));
        a.href = 'geo:' + d.nodeinfo.location.latitude + ',' + d.nodeinfo.location.longitude;
        el.appendChild(a);
      };
    }

    function showStatus(d) {
      return function (el) {
        el.classList.add(d.flags.unseen ? 'unseen' : (d.flags.online ? 'online' : 'offline'));
        el.textContent = _.t((d.flags.online ? 'node.lastOnline' : 'node.lastOffline'), {
          time: d.lastseen.fromNow(),
          date: d.lastseen.format('DD.MM.YYYY, H:mm:ss')
        });
      };
    }

    function showFirmware(d) {
      return [
        helper.dictGet(d.nodeinfo, ['software', 'firmware', 'release']),
        helper.dictGet(d.nodeinfo, ['software', 'firmware', 'base'])
      ].filter(function (n) {
        return n !== null;
      }).join(' / ') || undefined;
    }

    function showSite(d, config) {
      var site = helper.dictGet(d.nodeinfo, ['system', 'site_code']);
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
      if (!('uptime' in d.statistics)) {
        return undefined;
      }

      return moment.duration(d.statistics.uptime, 'seconds').humanize();
    }

    function showFirstseen(d) {
      if (!('firstseen' in d)) {
        return undefined;
      }

      return d.firstseen.fromNow(true);
    }

    function showWifiChannel(d, band) {
      if (!(d.nodeinfo.wireless) || !(band in d.nodeinfo.wireless)) {
        return undefined;
      }

      var channel = d.nodeinfo.wireless[band];
      var alias = wifiChannelAlias(channel);

      return d.nodeinfo.wireless[band] + ' (' + alias + ')';
    }

    function wifiChannelAlias(ch) {
      var chlist = {
        '1': '2412 MHz',
        '2': '2417 MHz',
        '3': '2422 MHz',
        '4': '2427 MHz',
        '5': '2432 MHz',
        '6': '2437 MHz',
        '7': '2442 MHz',
        '8': '2447 MHz',
        '9': '2452 MHz',
        '10': '2457 MHz',
        '11': '2462 MHz',
        '12': '2467 MHz',
        '13': '2472 MHz',
        '36': '5180 MHz (Indoors)',
        '40': '5200 MHz (Indoors)',
        '44': '5220 MHz (Indoors)',
        '48': '5240 MHz (Indoors)',
        '52': '5260 MHz (Indoors/DFS/TPC)',
        '56': '5280 MHz (Indoors/DFS/TPC)',
        '60': '5300 MHz (Indoors/DFS/TPC)',
        '64': '5320 MHz (Indoors/DFS/TPC)',
        '100': '5500 MHz (DFS) !!',
        '104': '5520 MHz (DFS) !!',
        '108': '5540 MHz (DFS) !!',
        '112': '5560 MHz (DFS) !!',
        '116': '5580 MHz (DFS) !!',
        '120': '5600 MHz (DFS) !!',
        '124': '5620 MHz (DFS) !!',
        '128': '5640 MHz (DFS) !!',
        '132': '5660 MHz (DFS) !!',
        '136': '5680 MHz (DFS) !!',
        '140': '5700 MHz (DFS) !!'
      };
      if (!(ch in chlist)) {
        return '';
      }
      return chlist[ch];
    }

    function showWifiAirtime(d, band) {
      if (!(d.statistics.wireless) || !(band in d.statistics.wireless)) {
        return undefined;
      }

      return function (el) {
        var value = Math.round(d.statistics.wireless[band] * 100) + ' %';
        var width = d.statistics.wireless[band];
        var warning = false;
        el.appendChild(showBar(value, width, warning));
      };
    }

    function showClients(d) {
      if (!d.flags.online) {
        return undefined;
      }

      var meshclients = getMeshClients(d);
      resetMeshClients(d);
      var before = '     (';
      var after = ' ' + _.t('clients_in_cloud') + ')';


      return function (el) {
        el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : _.t('none')));
        if (meshclients > 0) {
          el.appendChild(document.createTextNode(before));
          el.appendChild(document.createTextNode(meshclients > 0 ? meshclients : _.t('none')));
          el.appendChild(document.createTextNode(after));
        }
        el.appendChild(document.createElement('br'));

        var span = document.createElement('span');
        span.classList.add('clients');
        span.innerHTML = '<i class="ion-person"></i>'.repeat(d.statistics.clients);
        el.appendChild(span);

        var spanmesh = document.createElement('span');
        spanmesh.classList.add('clientsMesh');
        spanmesh.innerHTML = '<i class="ion-person" style="opacity: .25;"></i>'.repeat(meshclients - d.statistics.clients);
        el.appendChild(spanmesh);
      };
    }

    function showIPs(d) {
      var ips = helper.dictGet(d.nodeinfo, ['network', 'addresses']);
      if (ips === null) {
        return undefined;
      }

      ips.sort();

      return function (el) {
        ips.forEach(function (ip, i) {
          var link = !ip.startsWith('fe80:');

          if (i > 0) {
            el.appendChild(document.createElement('br'));
          }

          if (link) {
            var a = document.createElement('a');
            a.href = 'http://[' + ip + ']/';
            a.textContent = ip;
            el.appendChild(a);
          } else {
            el.appendChild(document.createTextNode(ip));
          }
        });
      };
    }

    function showBar(v, width, warning) {
      var span = document.createElement('span');
      span.classList.add('bar');

      var bar = document.createElement('span');
      bar.style.width = (width * 100) + '%';
      if (warning) {
        span.classList.add('warning');
      }
      span.appendChild(bar);

      var label = document.createElement('label');
      label.textContent = v;
      span.appendChild(label);

      return span;
    }

    function showLoad(d) {
      if (!('loadavg' in d.statistics)) {
        return undefined;
      }

      return function (el) {
        var value = d.statistics.loadavg.toFixed(2);
        var width = d.statistics.loadavg % 1;
        var warning = false;
        if (d.statistics.loadavg >= d.nodeinfo.hardware.nproc) {
          warning = true;
        }
        el.appendChild(showBar(value, width, warning));
      };
    }

    function showRAM(d) {
      if (!('memory_usage' in d.statistics)) {
        return undefined;
      }

      return function (el) {
        var value = Math.round(d.statistics.memory_usage * 100) + ' %';
        var width = d.statistics.memory_usage;
        var warning = false;
        if (d.statistics.memory_usage >= 0.8) {
          warning = true;
        }
        el.appendChild(showBar(value, width, warning));
      };
    }

    function showAutoupdate(d) {
      var au = helper.dictGet(d.nodeinfo, ['software', 'autoupdater']);
      if (!au) {
        return undefined;
      }

      return au.enabled ? _.t('node.activated', { branch: au.branch }) : _.t('node.deactivated');
    }

    function showUplink(d) {
      if (d.nodeinfo.vpn) {
        return undefined;
      }
      var hasUplink = d.flags.uplink ? d.flags.uplink : false;
      return hasUplink ? _.t('yes') : _.t('no');
    }

    function showStatImg(o, d) {
      var subst = {};
      subst['{NODE_ID}'] = d.nodeinfo.node_id;
      subst['{NODE_NAME}'] = d.nodeinfo.hostname.replace(/[^a-z0-9\-]/ig, '_');
      subst['{TIME}'] = d.lastseen.format('DDMMYYYYHmmss');
      subst['{LOCALE}'] = _.locale();
      return helper.showStat(o, subst);
    }

    function getMeshClients(node) {
      var meshclients = 0;
      if (node.statistics && !isNaN(node.statistics.clients)) {
        meshclients = node.statistics.clients;
      }

      if (!node) {
        return 0;
      }

      if (node.parsed) {
        return 0;
      }

      node.parsed = 1;
      node.neighbours.forEach(function (neighbour) {
        if (!neighbour.link.isVPN && neighbour.node) {
          meshclients += getMeshClients(neighbour.node);
        }
      });

      return meshclients;
    }

    function resetMeshClients(node) {
      if (!node.parsed) {
        return;
      }

      node.parsed = 0;

      node.neighbours.forEach(function (neighbour) {
        if (!neighbour.link.isVPN && neighbour.node) {
          resetMeshClients(neighbour.node);
        }
      });

      return;
    }

    function createLink(target, router) {
      if (!target) {
        return document.createTextNode(_.t('unkown'));
      }

      var text = target.nodeinfo ? target.nodeinfo.hostname : target;
      if (target.nodeinfo) {
        var link = document.createElement('a');
        link.classList.add('hostname-lin');
        link.href = router.generateLink({ node: target.nodeinfo.node_id });
        link.onclick = function (e) {
          router.fullUrl({ node: target.nodeinfo.node_id }, e);
        };
        link.textContent = text;
        return link;
      }
      return document.createTextNode(text);
    }

    function lookupNode(d, nodeDict) {
      if (!d) {
        return null;
      }

      var node = nodeDict[d.substr(0, 17)];
      if (!node) {
        return d;
      }
      return node;
    }

    function showGateway(d, router, nodeDict) {
      var nh = null;
      if (helper.dictGet(d.statistics, ['nexthop'])) {
        nh = helper.dictGet(d.statistics, ['nexthop']);
      }
      if (helper.dictGet(d.statistics, ['gateway_nexthop'])) {
        nh = helper.dictGet(d.statistics, ['gateway_nexthop']);
      }
      var gw = helper.dictGet(d.statistics, ['gateway']);

      if (!gw) {
        return null;
      }
      return function (el) {
        if (nh) {
          el.appendChild(createLink(lookupNode(nh, nodeDict), router));
          if (nh.substr(0, 17) !== gw.substr(0, 17)) {
            el.appendChild(document.createTextNode(' -> ... -> '));
          }
        }
        if (!nh || nh.substr(0, 17) !== gw.substr(0, 17)) {
          el.appendChild(createLink(lookupNode(gw, nodeDict), router));
        }
      };
    }

    return function (config, el, router, d, gateways) {
      var linkScale = d3Interpolate.interpolate('#F02311', '#04C714');

      function renderNeighbourRow(n) {
        var icons = [];
        icons.push(V.h('span', { props: { className: n.incoming ? 'ion-arrow-left-c' : 'ion-arrow-right-c' } }));
        if (helper.hasLocation(n.node)) {
          icons.push(V.h('span', { props: { className: 'ion-location' } }));
        }

        var name = V.h('a', {
          props: {
            className: 'online',
            href: router.generateLink({ node: n.node.nodeinfo.node_id })
          }, on: {
            click: function (e) {
              router.fullUrl({ node: n.node.nodeinfo.node_id }, e);
            }
          }
        }, n.node.nodeinfo.hostname);

        var td1 = V.h('td', icons);
        var td2 = V.h('td', name);
        var td3 = V.h('td', (n.node.statistics.clients ? n.node.statistics.clients.toString() : '0'));
        var td4 = V.h('td', { style: { color: linkScale(1 / n.link.tq) } }, helper.showTq(n.link));
        var td5 = V.h('td', helper.showDistance(n.link));

        return V.h('tr', [td1, td2, td3, td4, td5]);
      }

      var h2 = document.createElement('h2');
      h2.textContent = d.nodeinfo.hostname;
      el.appendChild(h2);

      var attributes = document.createElement('table');
      attributes.classList.add('attributes');

      helper.attributeEntry(attributes, 'node.status', showStatus(d));
      helper.attributeEntry(attributes, 'node.gateway', d.flags.gateway ? 'ja' : null);
      helper.attributeEntry(attributes, 'node.coordinates', showGeoURI(d));

      if (config.nodeInfobox && config.nodeInfobox.contact) {
        helper.attributeEntry(attributes, 'node.contact', helper.dictGet(d.nodeinfo, ['owner', 'contact']));
      }

      helper.attributeEntry(attributes, 'node.hardware', helper.dictGet(d.nodeinfo, ['hardware', 'model']));
      helper.attributeEntry(attributes, 'node.primaryMac', helper.dictGet(d.nodeinfo, ['network', 'mac']));
      helper.attributeEntry(attributes, 'node.id', helper.dictGet(d.nodeinfo, ['node_id']));
      helper.attributeEntry(attributes, 'node.firmware', showFirmware(d));
      helper.attributeEntry(attributes, 'node.site', showSite(d, config));
      helper.attributeEntry(attributes, 'node.uptime', showUptime(d));
      helper.attributeEntry(attributes, 'node.firstSeen', showFirstseen(d));

      helper.attributeEntry(attributes, 'node.wifi_channel_2', showWifiChannel(d, 'chan2'));
      helper.attributeEntry(attributes, 'node.wifi_channel_5', showWifiChannel(d, 'chan5'));
      helper.attributeEntry(attributes, 'node.wifi_airtime_2', showWifiAirtime(d, 'airtime2'));
      helper.attributeEntry(attributes, 'node.wifi_airtime_5', showWifiAirtime(d, 'airtime5'));


      if (config.nodeInfobox && config.nodeInfobox.hardwareUsage) {
        helper.attributeEntry(attributes, 'node.systemLoad', showLoad(d));
        helper.attributeEntry(attributes, 'node.ram', showRAM(d));
      }
      helper.attributeEntry(attributes, 'node.ipAddresses', showIPs(d));
      // helper.attributeEntry(attributes, 'node.selectedGateway', gateways[helper.dictGet(d.statistics, ['gateway'])]);
      helper.attributeEntry(attributes, 'node.selectedGateway', showGateway(d, router, gateways));
      helper.attributeEntry(attributes, 'node.update', showAutoupdate(d));
      helper.attributeEntry(attributes, 'node.uplink', showUplink(d));
      helper.attributeEntry(attributes, 'node.clients', showClients(d));

      el.appendChild(attributes);

      if (d.neighbours.length > 0) {
        var h3 = document.createElement('h3');
        h3.textContent = _.t('node.link', d.neighbours.length) + ' (' + d.neighbours.length + ')';
        el.appendChild(h3);

        var headings = [{
          name: ''
        }, {
          name: 'node.nodes',
          sort: function (a, b) {
            return a.node.nodeinfo.hostname.localeCompare(b.node.nodeinfo.hostname);
          },
          reverse: false
        }, {
          name: 'node.clients',
          class: 'ion-people',
          sort: function (a, b) {
            return ('clients' in a.node.statistics ? a.node.statistics.clients : -1) -
              ('clients' in b.node.statistics ? b.node.statistics.clients : -1);
          },
          reverse: true
        }, {
          name: 'node.tq',
          class: 'ion-connection-bars',
          sort: function (a, b) {
            return a.link.tq - b.link.tq;
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

        var table = new SortTable(headings, 1, renderNeighbourRow);
        table.setData(d.neighbours);
        table.el.elm.classList.add('node-links');
        el.appendChild(table.el.elm);
      }

      if (config.nodeInfos) {
        config.nodeInfos.forEach(function (nodeInfo) {
          var h4 = document.createElement('h4');
          h4.textContent = nodeInfo.name;
          el.appendChild(h4);
          el.appendChild(showStatImg(nodeInfo, d));
        });
      }
    };
  });
