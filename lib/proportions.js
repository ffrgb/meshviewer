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

    function showStatGlobal(o) {
      var content, caption

      if (o.thumbnail) {
        content = document.createElement("img")
        content.src = o.thumbnail
      }

      if (o.caption) {
        caption = o.caption

        if (!content)
          content = document.createTextNode(caption)
      }

      var p = document.createElement("p")

      if (o.href) {
        var link = document.createElement("a")
        link.target = "_blank"
        link.href = o.href
        link.appendChild(content)

        if (caption && o.thumbnail)
          link.title = caption

        p.appendChild(link)
      } else
        p.appendChild(content)

      return p
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
        return d ? "ja" : "nein"
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

      fillTable("Status", statusTable, statusDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Firmware", fwTable, fwDict.sort(function (a, b) { return vercomp(b[0], a[0]) }))
      fillTable("Hardware", hwTable, hwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Koordinaten", geoTable, geoDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Autom. Updates", autoTable, autoDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable("Uplink", uplinkTable, uplinkDict.sort(function (a, b) { return b[1] - a[1] }))
    }

    self.render = function (el) {
      var h2
      h2 = document.createElement("h2")
      h2.textContent = "Status"
      el.appendChild(h2)
      el.appendChild(statusTable)

      h2 = document.createElement("h2")
      h2.textContent = "Firmwareversionen"
      el.appendChild(h2)
      el.appendChild(fwTable)

      h2 = document.createElement("h2")
      h2.textContent = "Hardwaremodelle"
      el.appendChild(h2)
      el.appendChild(hwTable)

      h2 = document.createElement("h2")
      h2.textContent = "Auf der Karte sichtbar"
      el.appendChild(h2)
      el.appendChild(geoTable)

      h2 = document.createElement("h2")
      h2.textContent = "Autoupdater"
      el.appendChild(h2)
      el.appendChild(autoTable)

      h2 = document.createElement("h2")
      h2.textContent = "Uplink"
      el.appendChild(h2)
      el.appendChild(uplinkTable)

      if (config.globalInfos)
          config.globalInfos.forEach( function (globalInfo) {
            h2 = document.createElement("h2")
            h2.textContent = globalInfo.name
            el.appendChild(h2)

            el.appendChild(showStatGlobal(globalInfo))
          })
    }

    return self
  }
})
