define(function () {
  return function(config, el, router, d) {
    var h2 = document.createElement("h2")
    h2.textContent = d.nodeinfo.hostname
    var span = document.createElement("span")
    span.classList.add(d.flags.online ? "online" : "offline")
    span.textContent = " (" + (d.flags.online ? "online" : "offline, " + d.lastseen.fromNow(true)) + ")"
    h2.appendChild(span)
    el.appendChild(h2)

    var attributes = document.createElement("table")
    attributes.classList.add("attributes")

    attributeEntry(attributes, "Gateway", d.flags.gateway ? "ja" : null)
    attributeEntry(attributes, "In der Karte", has_location(d) ? "ja" : "nein")

    if (config.showContact)
      attributeEntry(attributes, "Kontakt", dictGet(d.nodeinfo, ["owner", "contact"]))

    attributeEntry(attributes, "Hardware",  dictGet(d.nodeinfo, ["hardware", "model"]))
    attributeEntry(attributes, "Primäre MAC", dictGet(d.nodeinfo, ["network", "mac"]))
    attributeEntry(attributes, "Firmware", showFirmware(d))
    attributeEntry(attributes, "Uptime", showUptime(d))
    attributeEntry(attributes, "Teil des Netzes", showFirstseen(d))
    attributeEntry(attributes, "Arbeitsspeicher", showRAM(d))
    attributeEntry(attributes, "IP Adressen", showIPs(d))
    attributeEntry(attributes, "Autom. Updates", showAutoupdate(d))
    attributeEntry(attributes, "Clients", showClients(d))
    el.appendChild(attributes)

    if (d.neighbours.length > 0) {
      var h3 = document.createElement("h3")
      h3.textContent = "Nachbarknoten (" + d.neighbours.length + ")"
      el.appendChild(h3)

      var table = document.createElement("table")
      var thead = document.createElement("thead")

      var tr = document.createElement("tr")
      var th1 = document.createElement("th")
      th1.textContent = "Knoten"
      th1.classList.add("sort-default")
      tr.appendChild(th1)

      var th2 = document.createElement("th")
      th2.textContent = "TQ"
      tr.appendChild(th2)

      var th3 = document.createElement("th")
      th3.textContent = "Entfernung"
      tr.appendChild(th3)

      thead.appendChild(tr)
      table.appendChild(thead)

      var tbody = document.createElement("tbody")

      d.neighbours.forEach( function (d) {
        var tr = document.createElement("tr")

        var td1 = document.createElement("td")
        var a1 = document.createElement("a")
        a1.classList.add("hostname")
        a1.textContent = d.node.nodeinfo.hostname
        a1.href = "#"
        a1.onclick = router.node(d.node)
        td1.appendChild(a1)

        if (d.link.vpn)
          td1.appendChild(document.createTextNode(" (VPN)"))

        if (has_location(d.node)) {
          var span = document.createElement("span")
          span.classList.add("icon")
          span.classList.add("ion-location")
          td1.appendChild(span)
        }

        tr.appendChild(td1)

        var td2 = document.createElement("td")
        var a2 = document.createElement("a")
        a2.href = "#"
        a2.textContent = showTq(d.link)
        a2.onclick = router.link(d.link)
        td2.appendChild(a2)
        tr.appendChild(td2)

        var td3 = document.createElement("td")
        var a3 = document.createElement("a")
        a3.href = "#"
        a3.textContent = showDistance(d.link)
        a3.onclick = router.link(d.link)
        td3.appendChild(a3)
        td3.setAttribute("data-sort", d.link.distance !== undefined ? -d.link.distance : 1)
        tr.appendChild(td3)

        tbody.appendChild(tr)
      })

      table.appendChild(tbody)

      new Tablesort(table)

      el.appendChild(table)
    }

    function showFirmware(d) {
      var release = dictGet(d.nodeinfo, ["software", "firmware", "release"])
      var base = dictGet(d.nodeinfo, ["software", "firmware", "base"])

      if (release === null || base === null)
        return

      return release + " / " + base
    }

    function showUptime(d) {
      if (!("uptime" in d.statistics))
        return

      return moment.duration(d.statistics.uptime, "seconds").humanize()
    }

    function showFirstseen(d) {
      if (!("firstseen" in d))
        return

      return d.firstseen.fromNow(true)
    }

    function showClients(d) {
      if (!d.flags.online)
        return

      return function (el) {
        el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : "keine"))
        el.appendChild(document.createElement("br"))

        var span = document.createElement("span")
        span.classList.add("clients")
        span.textContent = " ".repeat(d.statistics.clients)
        el.appendChild(span)
      }
    }

    function showIPs(d) {
      var ips = dictGet(d.nodeinfo, ["network", "addresses"])
      if (ips === null)
        return

      ips.sort()

      return function (el) {
        ips.forEach( function (ip, i) {
          var link = !ip.startsWith("fe80:")

          if (i > 0)
            el.appendChild(document.createElement("br"))

          if (link) {
            var a = document.createElement("a")
            a.href = "http://[" + ip + "]/"
            a.textContent = ip
            el.appendChild(a)
          } else
            el.appendChild(document.createTextNode(ip))
        })
      }
    }

    function showRAM(d) {
      if (!("memory_usage" in d.statistics))
        return

      return function (el) {
        el.appendChild(showBar("memory-usage", d.statistics.memory_usage))
      }
    }

    function showBar(className, v) {
      var span = document.createElement("span")
      span.classList.add("bar")
      span.classList.add(className)

      var bar = document.createElement("span")
      bar.style.width = (v * 100) + "%"
      span.appendChild(bar)

      var label = document.createElement("label")
      label.textContent = (Math.round(v * 100)) + " %"
      span.appendChild(label)

      return span
    }

    function showAutoupdate(d) {
      var au = dictGet(d.nodeinfo, ["software", "autoupdater"])
      if (!au)
        return

      return au.enabled ? "aktiviert (" + au.branch + ")" : "deaktiviert"
    }
  }
})
