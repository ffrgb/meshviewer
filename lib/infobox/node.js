define(['sorttable', 'virtual-dom', 'd3-interpolate', 'moment', 'helper'],
  function (SortTable, V, d3Interpolate, moment, helper) {
    'use strict';

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
      var release = helper.dictGet(d.nodeinfo, ['software', 'firmware', 'release']);
      var base = helper.dictGet(d.nodeinfo, ['software', 'firmware', 'base']);

      if (release === null || base === null) {
        return undefined;
      }

      return release + ' / ' + base;
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
      return rt;
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

    function showClients(d) {
      if (!d.flags.online) {
        return undefined;
      }

      return function (el) {
        el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : _.t('none')));
        el.appendChild(document.createElement('br'));

        var span = document.createElement('span');
        span.classList.add('clients');
        span.innerHTML = '<i class="ion-person"></i>'.repeat(d.statistics.clients);
        el.appendChild(span);
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

    function showStatImg(o, d) {
      var subst = {};
      subst['{NODE_ID}'] = d.nodeinfo.node_id ? d.nodeinfo.node_id : _.t('unknown');
      subst['{NODE_NAME}'] = d.nodeinfo.hostname ? d.nodeinfo.hostname.replace(/[^a-z0-9\-]/ig, '_') : _.t('unknown');
      subst['{TIME}'] = d.lastseen.format('DDMMYYYYHmmss');
      subst['{LOCALE}'] = _.locale();
      return helper.showStat(o, subst);
    }

    return function (config, el, router, d) {
      var linkScale = d3Interpolate.interpolate('#F02311', '#04C714');

      function renderNeighbourRow(n) {
        var icons = [];
        var name = [];
        var unknown = !(n.node);

        icons.push(V.h('span', { className: n.incoming ? 'ion-arrow-left-c' : 'ion-arrow-right-c' }));
        if (!unknown && helper.hasLocation(n.node)) {
          icons.push(V.h('span', { className: 'ion-location' }));
        }

        if (!unknown) {
          name.push(V.h('a', { href: router.getUrl({ n: n.node.nodeinfo.node_id }), onclick: router.node(n.node), className: 'online' }, n.node.nodeinfo.hostname));
        } else {
          name.push(n.link.id);
        }

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
      if (config.nodeInfobox && config.nodeInfobox.hardwareUsage) {
        helper.attributeEntry(attributes, 'node.systemLoad', showLoad(d));
        helper.attributeEntry(attributes, 'node.ram', showRAM(d));
      }
      helper.attributeEntry(attributes, 'node.ipAddresses', showIPs(d));
      helper.attributeEntry(attributes, 'node.selectedGateway', helper.dictGet(d.statistics, ['gateway']));
      helper.attributeEntry(attributes, 'node.update', showAutoupdate(d));
      helper.attributeEntry(attributes, 'node.clients', showClients(d));

      el.appendChild(attributes);

      if (d.neighbours.length > 0) {
        var h3 = document.createElement('h3');
        h3.textContent = _.t('node.link', d.neighbours.length) + '(' + d.neighbours.length + ')';
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
        table.el.classList.add('node-links');
        table.setData(d.neighbours);

        el.appendChild(table.el);
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
