define(["chroma-js", "virtual-dom", "numeral-intl", "filters/genericnode", "vercomp" ],
  function (Chroma, V, numeral, Filter, vercomp) {

  return function (config, filterManager) {
    var self = this
    var scale = Chroma.scale("YlGnBu").mode("lab")

    var statusTable = document.createElement("table")
    statusTable.classList.add("proportion")

    var fwTable = document.createElement("table")
    fwTable.classList.add("proportion")

    var hwTable = document.createElement("table")
    hwTable.classList.add("proportion")

    var geoTable = document.createElement("table")
    geoTable.classList.add("proportion")

    var autoTable = document.createElement("table")
    autoTable.classList.add("proportion")

    var uplinkTable = document.createElement("table")
    uplinkTable.classList.add("proportion")

    var  gwNodesTable = document.createElement("table")
    gwNodesTable.classList.add("proportion")

    var gwClientsTable = document.createElement("table")
    gwClientsTable.classList.add("proportion")

    var siteTable = document.createElement("table")
    siteTable.classList.add("proportion")

    function showStatGlobal(o) {
      return showStat(o)
    }

    function count(nodes, key, f) {
      var dict = {}

      nodes.forEach( function (d) {
        var v = dictGet(d, key.slice(0))

        if (f !== undefined)
          v = f(v)

        if (v === null)
          return

        dict[v] = 1 + (v in dict ? dict[v] : 0)
      })

      return Object.keys(dict).map(function (d) { return [d, dict[d], key, f] })
    }

    function countClients(nodes, key, f) {
      var dict = {}

      nodes.forEach( function (d) {
        var v = dictGet(d, key.slice(0))

        if (f !== undefined)
          v = f(v)

        if (v === null)
          return

        dict[v] = d.statistics.clients + (v in dict ? dict[v] : 0)
      })

      return Object.keys(dict).map(function (d) { return [d, dict[d], key, f] })
    }


    function addFilter(filter) {
      return function () {
        filterManager.addFilter(filter)

        return false
      }
    }

    function fillTable(name, table, data) {
      if (!table.last)
        table.last = V.h("table")

      var max = 0
      data.forEach(function (d) {
        if (d[1] > max)
          max = d[1]
      })

      var items = data.map(function (d) {
        var v = d[1] / max
        var c1 = Chroma.contrast(scale(v), "white")
        var c2 = Chroma.contrast(scale(v), "black")

        var filter = new Filter(name, d[2], d[0], d[3])

        var a = V.h("a", { href: "#", onclick: addFilter(filter) }, d[0])

        var th = V.h("th", a)
        var td = V.h("td", V.h("span", {style: {
                                         width: Math.round(v * 100) + "%",
                                         backgroundColor: scale(v).hex(),
                                         color: c1 > c2 ? "white" : "black"
                                       }}, numeral(d[1]).format("0,0")))

        return V.h("tr", [th, td])
      })

      var tableNew = V.h("table", items)
      table = V.patch(table, V.diff(table.last, tableNew))
      table.last = tableNew
    }

    self.setData = function (data) {
      var onlineNodes = data.nodes.all.filter(online)
      var nodes = onlineNodes.concat(data.nodes.lost)
      var nodeDict = {}

      data.nodes.all.forEach(function (d) {
        nodeDict[d.nodeinfo.node_id] = d
      })

      var statusDict = count(nodes, ["flags", "online"], function (d) {
        return d ? "online" : "offline"
      })
      var fwDict = count(nodes, ["nodeinfo", "software", "firmware", "release"])
      var hwDict = count(nodes, ["nodeinfo", "hardware", "model"])
      var geoDict = count(nodes, ["nodeinfo", "location"], function (d) {
        return d && d.longitude && d.latitude ? "ja" : "nein"
      })

      var autoDict = count(nodes, ["nodeinfo", "software", "autoupdater"], function (d) {
        if (d === null)
          return null
        else if (d.enabled)
          return d.branch
        else
          return "(deaktiviert)"
      })

      var uplinkDict = count(nodes, ["flags", "uplink"], function (d) {
        return d ? "ja" : "nein"
      })

      var gwNodesDict = count(nodes, ["statistics", "gateway"], function (d) {
        if (d === null)
          return null

        if (d in nodeDict)
          return nodeDict[d].nodeinfo.hostname

        return d
      })

      var gwClientsDict = countClients(onlineNodes, ["statistics", "gateway"], function (d) {
        if (d === null)
          return null

        if (d in nodeDict)
          return nodeDict[d].nodeinfo.hostname

        return d
      })

      var siteDict = count(onlineNodes, ["nodeinfo", "system", "site_code"], function (d) {
        var rt = d
        if (config.siteNames)
          config.siteNames.forEach( function (t) {
            if(d === t.site)
              rt = t.name
          })
        return rt
      })

      fillTable("Status", statusTable, statusDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Firmware", fwTable, fwDict.sort(function (a, b) { return vercomp(b[0], a[0]) }))
      fillTable("Hardware", hwTable, hwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Koordinaten", geoTable, geoDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Uplink", uplinkTable, uplinkDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Autom. Updates", autoTable, autoDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Nodes an Gateway", gwNodesTable, gwNodesDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Clients an Gateway", gwClientsTable, gwClientsDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Site", siteTable, siteDict.sort(function (a, b) { return b[1] - a[1] }))
    }


    self.render = function (el) {
      var h2
      self.renderSingle(el, "Status", statusTable)
      self.renderSingle(el, "Nodes an Gateway", gwNodesTable)
      self.renderSingle(el, "Clients an Gateway", gwClientsTable)
      self.renderSingle(el, "Firmwareversionen", fwTable)
      self.renderSingle(el, "Uplink", uplinkTable)
      self.renderSingle(el, "Hardwaremodelle", hwTable)
      self.renderSingle(el, "Auf der Karte sichtbar", geoTable)
      self.renderSingle(el, "Autoupdater", autoTable)
      self.renderSingle(el, "Site", siteTable)

      if (config.globalInfos)
        config.globalInfos.forEach(function (globalInfo) {
          h2 = document.createElement("h2")
          h2.textContent = globalInfo.name
          el.appendChild(h2)
          el.appendChild(showStatGlobal(globalInfo))
        })
      }

    self.renderSingle = function (el, heading, table) {
       var h2
       h2 = document.createElement("h2")
       h2.textContent = heading
       h2.onclick = function () {
         table.classList.toggle("hidden")
       }
       el.appendChild(h2)
       el.appendChild(table)
     }
     return self
  }
})
