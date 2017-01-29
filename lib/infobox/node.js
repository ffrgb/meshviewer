define(['chroma-js', 'moment/moment', 'tablesort', 'helper', 'moment/locale/de'],
  function (chroma, moment, tablesort, helper) {
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
        if (d.flags.online) {
          el.textContent = 'online, letzte Nachricht ' + d.lastseen.fromNow() + ' (' + d.lastseen.format('DD.MM.YYYY,  H:mm:ss') + ')';
        } else {
          el.textContent = 'offline, letzte Nachricht ' + d.lastseen.fromNow() + ' (' + d.lastseen.format('DD.MM.YYYY,  H:mm:ss') + ')';
        }
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
        el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : 'keine'));
        el.appendChild(document.createElement('br'));

        var span = document.createElement('span');
        span.classList.add('clients');
        span.innerHTML = '<i class="ion-ios-person"></i>'.repeat(d.statistics.clients);
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

    function showBar(v) {
      var span = document.createElement('span');
      span.classList.add('bar');

      var bar = document.createElement('span');
      bar.style.width = (v * 100) + '%';
      span.appendChild(bar);

      var label = document.createElement('label');
      label.textContent = (Math.round(v * 100)) + ' %';
      span.appendChild(label);

      return span;
    }

    function showLoadBar(v, p) {
      var span = document.createElement('span');
      span.classList.add('bar');

      var bar = document.createElement('span');
      bar.style.width = ((v * 100) % 100) + '%';
      if (v >= p) {
        span.classList.add('warning');
      }
      span.appendChild(bar);

      var label = document.createElement('label');
      label.textContent = (v);
      span.appendChild(label);

      return span;
    }

    function showLoad(d) {
      if (!('loadavg' in d.statistics)) {
        return undefined;
      }

      return function (el) {
        el.appendChild(showLoadBar(d.statistics.loadavg.toFixed(2), d.nodeinfo.hardware.nproc));
      };
    }

    function showRAM(d) {
      if (!('memory_usage' in d.statistics)) {
        return undefined;
      }

      return function (el) {
        el.appendChild(showBar(d.statistics.memory_usage));
      };
    }

    function showAutoupdate(d) {
      var au = helper.dictGet(d.nodeinfo, ['software', 'autoupdater']);
      if (!au) {
        return undefined;
      }

      return au.enabled ? 'aktiviert (' + au.branch + ')' : 'deaktiviert';
    }

    function showStatImg(o, d) {
      var subst = {};
      subst['{NODE_ID}'] = d.nodeinfo.node_id ? d.nodeinfo.node_id : 'unknown';
      subst['{NODE_NAME}'] = d.nodeinfo.hostname ? d.nodeinfo.hostname.replace(/[^a-z0-9\-]/ig, '_') : 'unknown';
      subst['{TIME}'] = d.lastseen.format('DDMMYYYYHmmss');
      return helper.showStat(o, subst);
    }

    return function (config, el, router, d) {
      var linkScale = chroma.scale(chroma.bezier(['#04C714', '#FF5500', '#F02311'])).domain([1, 5]);
      var h2 = document.createElement('h2');
      h2.textContent = d.nodeinfo.hostname;
      el.appendChild(h2);

      var attributes = document.createElement('table');
      attributes.classList.add('attributes');

      helper.attributeEntry(attributes, 'Status', showStatus(d));
      helper.attributeEntry(attributes, 'Gateway', d.flags.gateway ? 'ja' : null);
      helper.attributeEntry(attributes, 'Koordinaten', showGeoURI(d));

      if (config.nodeInfobox && config.nodeInfobox.contact) {
        helper.attributeEntry(attributes, 'Kontakt', helper.dictGet(d.nodeinfo, ['owner', 'contact']));
      }

      helper.attributeEntry(attributes, 'Hardware', helper.dictGet(d.nodeinfo, ['hardware', 'model']));
      helper.attributeEntry(attributes, 'Primäre MAC', helper.dictGet(d.nodeinfo, ['network', 'mac']));
      helper.attributeEntry(attributes, 'Node ID', helper.dictGet(d.nodeinfo, ['node_id']));
      helper.attributeEntry(attributes, 'Firmware', showFirmware(d));
      helper.attributeEntry(attributes, 'Site', showSite(d, config));
      helper.attributeEntry(attributes, 'Uptime', showUptime(d));
      helper.attributeEntry(attributes, 'Teil des Netzes', showFirstseen(d));
      if (config.nodeInfobox && config.nodeInfobox.hardwareUsage) {
        helper.attributeEntry(attributes, 'Systemlast', showLoad(d));
        helper.attributeEntry(attributes, 'Arbeitsspeicher', showRAM(d));
      }
      helper.attributeEntry(attributes, 'IP Adressen', showIPs(d));
      helper.attributeEntry(attributes, 'Gewähltes Gateway', helper.dictGet(d.statistics, ['gateway']));
      helper.attributeEntry(attributes, 'Autom. Updates', showAutoupdate(d));
      helper.attributeEntry(attributes, 'Clients', showClients(d));

      el.appendChild(attributes);

      if (config.nodeInfos) {
        config.nodeInfos.forEach(function (nodeInfo) {
          var h4 = document.createElement('h4');
          h4.textContent = nodeInfo.name;
          el.appendChild(h4);
          el.appendChild(showStatImg(nodeInfo, d));
        });
      }

      if (d.neighbours.length > 0) {
        var h3 = document.createElement('h3');
        h3.textContent = 'Links (' + d.neighbours.length + ')';
        el.appendChild(h3);

        var table = document.createElement('table');
        var thead = document.createElement('thead');

        var tr = document.createElement('tr');
        var th1 = document.createElement('th');
        th1.textContent = ' ';
        tr.appendChild(th1);

        var th2 = document.createElement('th');
        th2.textContent = 'Knoten';
        th2.classList.add('sort-default');
        tr.appendChild(th2);

        var th3 = document.createElement('th');
        th3.textContent = 'TQ';
        tr.appendChild(th3);

        var th4 = document.createElement('th');
        th4.textContent = 'Entfernung';
        tr.appendChild(th4);

        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');

        d.neighbours.forEach(function (n) {
          var unknown = !(n.node);
          var tr1 = document.createElement('tr');

          var td1 = document.createElement('td');

          var direction = document.createElement('span');
          direction.classList.add(n.incoming ? 'ion-ios-arrow-thin-left' : 'ion-ios-arrow-thin-right');
          td1.appendChild(direction);

          if (!unknown && helper.hasLocation(n.node)) {
            var span = document.createElement('span');
            span.classList.add('ion-location');
            td1.appendChild(span);
          }

          tr1.appendChild(td1);

          var td2 = document.createElement('td');

          if (!unknown) {
            var a1 = document.createElement('a');
            a1.textContent = n.node.nodeinfo.hostname;
            a1.classList.add('online');
            a1.href = '#';
            a1.onclick = router.node(n.node);
            td2.appendChild(a1);
          } else {
            td2.textContent = n.id;
          }

          tr1.appendChild(td2);

          var td3 = document.createElement('td');
          td3.textContent = helper.showTq(n.link);
          td3.style.color = linkScale(n.link.tq).hex();
          tr1.appendChild(td3);

          var td4 = document.createElement('td');
          td4.textContent = helper.showDistance(n.link);
          td4.setAttribute('data-sort', n.link.distance !== undefined ? -n.link.distance : 1);
          tr1.appendChild(td4);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        table.classList.add('node-links');

        tablesort(table);

        el.appendChild(table);
      }
    };
  });
