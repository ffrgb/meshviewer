define(["moment", "numeral", "tablesort", "tablesort.numeric"],
  function (moment, numeral, Tablesort) {
    function showGeoURI(d) {
      function showLatitude(d) {
        var suffix = Math.sign(d) > -1 ? "' N" : "' S";
        d = Math.abs(d);
        var a = Math.floor(d);
        var min = (d * 60) % 60;
        a = (a < 10 ? "0" : "") + a;

        return a + "° " + numeral(min).format("0.000") + suffix;
      }

      function showLongitude(d) {
        var suffix = Math.sign(d) > -1 ? "' E" : "' W";
        d = Math.abs(d);
        var a = Math.floor(d);
        var min = (d * 60) % 60;
        a = (a < 100 ? "0" + (a < 10 ? "0" : "") : "") + a;

        return a + "° " + numeral(min).format("0.000") + suffix;
      }

      if (!has_location(d)) {
        return undefined;
      }

      return function (el) {
        var latitude = d.nodeinfo.location.latitude;
        var longitude = d.nodeinfo.location.longitude;
        var a = document.createElement("a");
        a.textContent = showLatitude(latitude) + " " +
          showLongitude(longitude);

        a.href = "geo:" + latitude + "," + longitude;
        el.appendChild(a);
      };
    }

    function showStatus(d) {
      return function (el) {
        el.classList.add(d.flags.unseen ? "unseen" : (d.flags.online ? "online" : "offline"));
        if (d.flags.online) {
          el.textContent = "online, letzte Nachricht " + d.lastseen.fromNow() + " (" + d.lastseen.format("DD.MM.YYYY,  H:mm:ss") + ")";
        } else {
          el.textContent = "offline, letzte Nachricht " + d.lastseen.fromNow() + " (" + d.lastseen.format("DD.MM.YYYY,  H:mm:ss") + ")";
        }
      };
    }

    function showFirmware(d) {
      var release = dictGet(d.nodeinfo, ["software", "firmware", "release"]);
      var base = dictGet(d.nodeinfo, ["software", "firmware", "base"]);

      if (release === null || base === null) {
        return undefined;
      }

      return release + " / " + base;
    }

    function showSite(d, config) {
      var site = dictGet(d.nodeinfo, ["system", "site_code"]);
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
      if (!("uptime" in d.statistics)) {
        return undefined;
      }

      return moment.duration(d.statistics.uptime, "seconds").humanize();
    }

    function showFirstseen(d) {
      if (!("firstseen" in d)) {
        return undefined;
      }

      return d.firstseen.fromNow(true);
    }

    function showClients(d) {
      if (!d.flags.online) {
        return undefined;
      }

      return function (el) {
        el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : "keine"));
        el.appendChild(document.createElement("br"));

        var span = document.createElement("span");
        span.classList.add("clients");
        span.textContent = " ".repeat(d.statistics.clients);
        el.appendChild(span);
      };
    }

    function showIPs(d) {
      var ips = dictGet(d.nodeinfo, ["network", "addresses"]);
      if (ips === null) {
        return undefined;
      }

      ips.sort();

      return function (el) {
        ips.forEach(function (ip, i) {
          var link = !ip.startsWith("fe80:");

          if (i > 0) {
            el.appendChild(document.createElement("br"));
          }

          if (link) {
            var a = document.createElement("a");
            a.href = "http://[" + ip + "]/";
            a.textContent = ip;
            el.appendChild(a);
          } else {
            el.appendChild(document.createTextNode(ip));
          }
        });
      };
    }

    function showBar(className, v) {
      var span = document.createElement("span");
      span.classList.add("bar");
      span.classList.add(className);

      var bar = document.createElement("span");
      bar.style.width = (v * 100) + "%";
      span.appendChild(bar);

      var label = document.createElement("label");
      label.textContent = (Math.round(v * 100)) + " %";
      span.appendChild(label);

      return span;
    }

    function showLoadBar(className, v) {
      var span = document.createElement("span");
      span.classList.add("bar");
      span.classList.add(className);

      var bar = document.createElement("span");
      if (v >= 1) {
        bar.style.width = ((v * 100) % 100) + "%";
        bar.style.background = "rgba(255, 50, 50, 0.9)";
        span.style.background = "rgba(255, 50, 50, 0.6)";
        span.appendChild(bar);
      }
      else {
        bar.style.width = (v * 100) + "%";
        span.appendChild(bar);
      }

      var label = document.createElement("label");
      label.textContent = (v);
      span.appendChild(label);

      return span;
    }

    function showLoad(d) {
      if (!("loadavg" in d.statistics)) {
        return undefined;
      }

      return function (el) {
        el.appendChild(showLoadBar("load-avg", d.statistics.loadavg));
      };
    }

    function showRAM(d) {
      if (!("memory_usage" in d.statistics)) {
        return undefined;
      }

      return function (el) {
        el.appendChild(showBar("memory-usage", d.statistics.memory_usage));
      };
    }

    function showPages(d) {
      var webpages = dictGet(d.nodeinfo, ["pages"]);
      if (webpages === null) {
        return undefined;
      }

      webpages.sort();

      return function (el) {
        webpages.forEach(function (webpage, i) {
          if (i > 0) {
            el.appendChild(document.createElement("br"));
          }

          var a = document.createElement("span");
          var link = document.createElement("a");
          link.href = webpage;
          if (webpage.search(/^https:\/\//i) !== -1) {
            var lock = document.createElement("span");
            lock.className = "ion-android-lock";
            a.appendChild(lock);
            var t1 = document.createTextNode(" ");
            a.appendChild(t1);
            link.textContent = webpage.replace(/^https:\/\//i, "");
          }
          else {
            link.textContent = webpage.replace(/^http:\/\//i, "");
          }
          a.appendChild(link);
          el.appendChild(a);
        });
      };
    }

    function showAutoupdate(d) {
      var au = dictGet(d.nodeinfo, ["software", "autoupdater"]);
      if (!au) {
        return undefined;
      }

      return au.enabled ? "aktiviert (" + au.branch + ")" : "deaktiviert";
    }

    function showStatImg(o, d) {
      var subst = {};
      subst["{NODE_ID}"] = d.nodeinfo.node_id ? d.nodeinfo.node_id : "unknown";
      subst["{NODE_NAME}"] = d.nodeinfo.hostname ? d.nodeinfo.hostname : "unknown";
      return showStat(o, subst);
    }

    return function (config, el, router, d) {
      var h2 = document.createElement("h2");
      h2.textContent = d.nodeinfo.hostname;
      el.appendChild(h2);

      var attributes = document.createElement("table");
      attributes.classList.add("attributes");

      attributeEntry(attributes, "Status", showStatus(d));
      attributeEntry(attributes, "Gateway", d.flags.gateway ? "ja" : null);
      attributeEntry(attributes, "Koordinaten", showGeoURI(d));

      if (config.showContact) {
        attributeEntry(attributes, "Kontakt", dictGet(d.nodeinfo, ["owner", "contact"]));
      }

      attributeEntry(attributes, "Hardware", dictGet(d.nodeinfo, ["hardware", "model"]));
      attributeEntry(attributes, "Primäre MAC", dictGet(d.nodeinfo, ["network", "mac"]));
      attributeEntry(attributes, "Node ID", dictGet(d.nodeinfo, ["node_id"]));
      attributeEntry(attributes, "Firmware", showFirmware(d));
      attributeEntry(attributes, "Site", showSite(d, config));
      attributeEntry(attributes, "Uptime", showUptime(d));
      attributeEntry(attributes, "Teil des Netzes", showFirstseen(d));
      attributeEntry(attributes, "Systemlast", showLoad(d));
      attributeEntry(attributes, "Arbeitsspeicher", showRAM(d));
      attributeEntry(attributes, "IP Adressen", showIPs(d));
      attributeEntry(attributes, "Webseite", showPages(d));
      attributeEntry(attributes, "Gewähltes Gateway", dictGet(d.statistics, ["gateway"]));
      attributeEntry(attributes, "Autom. Updates", showAutoupdate(d));
      attributeEntry(attributes, "Clients", showClients(d));

      el.appendChild(attributes);

      if (config.nodeInfos) {
        config.nodeInfos.forEach(function (nodeInfo) {
          var h4 = document.createElement("h4");
          h4.textContent = nodeInfo.name;
          el.appendChild(h4);
          el.appendChild(showStatImg(nodeInfo, d));
        });
      }

      if (d.neighbours.length > 0) {
        var h3 = document.createElement("h3");
        h3.textContent = "Links (" + d.neighbours.length + ")";
        el.appendChild(h3);

        var table = document.createElement("table");
        var thead = document.createElement("thead");

        var tr = document.createElement("tr");
        var th1 = document.createElement("th");
        th1.textContent = " ";
        tr.appendChild(th1);

        var th2 = document.createElement("th");
        th2.textContent = "Knoten";
        th2.classList.add("sort-default");
        tr.appendChild(th2);

        var th3 = document.createElement("th");
        th3.textContent = "TQ";
        tr.appendChild(th3);

        var th4 = document.createElement("th");
        th4.textContent = "Typ";
        tr.appendChild(th4);

        var th5 = document.createElement("th");
        th5.textContent = "Entfernung";
        tr.appendChild(th5);

        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement("tbody");

        d.neighbours.forEach(function (d) {
          var unknown = !(d.node);
          var tr = document.createElement("tr");

          var td1 = document.createElement("td");
          td1.appendChild(document.createTextNode(d.incoming ? " ← " : " → "));
          tr.appendChild(td1);

          var td2 = document.createElement("td");
          var a1 = document.createElement("a");
          a1.classList.add("hostname");
          a1.textContent = unknown ? d.id : d.node.nodeinfo.hostname;
          if (!unknown) {
            a1.href = "#";
          }
          a1.onclick = router.node(d.node);
          td2.appendChild(a1);

          if (!unknown && has_location(d.node)) {
            var span = document.createElement("span");
            span.classList.add("icon");
            span.classList.add("ion-location");
            td2.appendChild(span);
          }

          tr.appendChild(td2);

          var td3 = document.createElement("td");
          var a2 = document.createElement("a");
          a2.href = "#";
          a2.textContent = showTq(d.link);
          a2.onclick = router.link(d.link);
          td3.appendChild(a2);
          tr.appendChild(td3);

          var td4 = document.createElement("td");
          var a3 = document.createElement("a");
          a3.href = "#";
          a3.textContent = d.link.type;
          a3.onclick = router.link(d.link);
          td4.appendChild(a3);
          tr.appendChild(td4);

          var td5 = document.createElement("td");
          var a4 = document.createElement("a");
          a4.href = "#";
          a4.textContent = showDistance(d.link);
          a4.onclick = router.link(d.link);
          td5.appendChild(a4);
          td5.setAttribute("data-sort", d.link.distance !== undefined ? -d.link.distance : 1);
          tr.appendChild(td5);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        table.className = "node-links";

        new Tablesort(table);

        el.appendChild(table);
      }
    };
  });
