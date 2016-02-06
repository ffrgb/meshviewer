define(["moment", "numeral", "tablesort", "tablesort.numeric"],
  function (moment, numeral, Tablesort) {
  function showGeoURI(d) {
    function showLatitude(d) {
      var suffix = Math.sign(d) > -1 ? "' N" : "' S"
      d = Math.abs(d)
      var a = Math.floor(d)
      var min = (d * 60) % 60
      a = (a < 10 ? "0" : "") + a

      return a + "° " + numeral(min).format("0.000") + suffix
    }

    function showLongitude(d) {
      var suffix = Math.sign(d) > -1 ? "' E" : "' W"
      d = Math.abs(d)
      var a = Math.floor(d)
      var min = (d * 60) % 60
      a = (a < 100 ? "0" + (a < 10 ? "0" : "") : "") + a

      return a + "° " + numeral(min).format("0.000") + suffix
    }

    if (!has_location(d))
      return undefined

    return function (el) {
      var latitude = d.nodeinfo.location.latitude
      var longitude = d.nodeinfo.location.longitude
      var a = document.createElement("a")
      a.textContent = showLatitude(latitude) + " " +
                      showLongitude(longitude)

      a.href = "geo:" + latitude + "," + longitude
      el.appendChild(a)
    }
  }

  function showStatus(d) {
    return function (el) {
      el.classList.add(d.flags.online ? "online" : "offline")
      el.textContent = d.flags.online ? "online" : "offline, " + d.lastseen.fromNow(true)
    }
  }

  function showFirmware(d) {
    var release = dictGet(d.nodeinfo, ["software", "firmware", "release"])
    var base = dictGet(d.nodeinfo, ["software", "firmware", "base"])

    if (release === null || base === null)
      return undefined

    return release + " / " + base
  }

  function showSite(d, config) {
    var site = dictGet(d.nodeinfo, ["system", "site_code"])
    var rt = site
    if (config.siteNames)
      config.siteNames.forEach( function (t) {
        if(site === t.site)
          rt = t.name
      })
    return rt
  }

  function showUptime(d) {
    if (!("uptime" in d.statistics))
      return undefined

    return moment.duration(d.statistics.uptime, "seconds").humanize()
  }

  function showFirstseen(d) {
    if (!("firstseen" in d))
      return undefined

    return d.firstseen.fromNow(true)
  }

  function showClients(d) {
    if (!d.flags.online)
      return undefined

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
      return undefined

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

  function showRAM(d) {
    if (!("memory_usage" in d.statistics))
      return undefined

    return function (el) {
      el.appendChild(showBar("memory-usage", d.statistics.memory_usage))
    }
  }

  function showAutoupdate(d) {
    var au = dictGet(d.nodeinfo, ["software", "autoupdater"])
    if (!au)
      return undefined

    return au.enabled ? "aktiviert (" + au.branch + ")" : "deaktiviert"
  }

  function showStatImg(o, nodeId) {
    var content, caption

    if (o.thumbnail) {
      content = document.createElement("img")
      content.src = o.thumbnail.replace("{NODE_ID}", nodeId)
    }

    if (o.caption) {
      caption = o.caption.replace("{NODE_ID}", nodeId)

      if (!content)
        content = document.createTextNode(caption)
    }

    var p = document.createElement("p")

    if (o.href) {
      var link = document.createElement("a")
      link.target = "_blank"
      link.href = o.href.replace("{NODE_ID}", nodeId)
      link.appendChild(content)

      if (caption && o.thumbnail)
        link.title = caption

      p.appendChild(link)
    } else
      p.appendChild(content)

    return p
  }

  return function(config, el, router, d) {
    var h2 = document.createElement("h2")
    h2.textContent = d.nodeinfo.hostname
    el.appendChild(h2)

    var attributes = document.createElement("table")
    attributes.classList.add("attributes")

    attributeEntry(attributes, "Status", showStatus(d))
    attributeEntry(attributes, "Gateway", d.flags.gateway ? "ja" : null)
    attributeEntry(attributes, "Koordinaten", showGeoURI(d))

    if (config.showContact)
      attributeEntry(attributes, "Kontakt", dictGet(d.nodeinfo, ["owner", "contact"]))

    attributeEntry(attributes, "Hardware",  dictGet(d.nodeinfo, ["hardware", "model"]))
    attributeEntry(attributes, "Primäre MAC", dictGet(d.nodeinfo, ["network", "mac"]))
    attributeEntry(attributes, "Node ID", dictGet(d.nodeinfo, ["node_id"]))
    attributeEntry(attributes, "Firmware", showFirmware(d))
    attributeEntry(attributes, "Site", showSite(d, config))
    attributeEntry(attributes, "Uptime", showUptime(d))
    attributeEntry(attributes, "Teil des Netzes", showFirstseen(d))
    attributeEntry(attributes, "Arbeitsspeicher", showRAM(d))
    attributeEntry(attributes, "IP Adressen", showIPs(d))
    attributeEntry(attributes, "Autom. Updates", showAutoupdate(d))
    attributeEntry(attributes, "Clients", showClients(d))

    el.appendChild(attributes)


    if (config.nodeInfos)
      config.nodeInfos.forEach( function (nodeInfo) {
        var h4 = document.createElement("h4")
        h4.textContent = nodeInfo.name
        el.appendChild(h4)
        el.appendChild(showStatImg(nodeInfo, d.nodeinfo.node_id))
      })

    if (d.neighbours.length > 0) {
      var h3 = document.createElement("h3")
      h3.textContent = "Links (" + d.neighbours.length + ")"
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
  }
})
