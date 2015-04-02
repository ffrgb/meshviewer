define(["chroma-js", "virtual-dom", "numeral-intl"],
  function (Chroma, V, numeral) {

  return function () {
    var self = this
    var fwTable, hwTable, autoTable, gwTable
    var scale = Chroma.scale("YlGnBu").mode("lab")

    function count(nodes, key, def, f) {
      var dict = {}

      nodes.forEach( function (d) {
        var v = dictGet(d, key.slice(0))

        if (f !== undefined)
          v = f(v)

        if (v === null)
          v = def

        dict[v] = 1 + (v in dict ? dict[v] : 0)
      })

      return Object.keys(dict).map(function (d) { return [d, dict[d]] })
    }

    function fillTable(table, data) {
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

        var th = V.h("th", d[0])
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

      var fwDict = count(nodes, ["nodeinfo", "software", "firmware", "release"], "n/a")
      var hwDict = count(nodes, ["nodeinfo", "hardware", "model"], "n/a")
      var autoDict = count(nodes, ["nodeinfo", "software", "autoupdater"], "deaktiviert", function (d) {
        if (d === null || !d.enabled)
          return null
        else
          return d.branch
      })

      var gwDict = count(onlineNodes, ["statistics", "gateway"], "n/a", function (d) {
        if (d === null)
          return null

        if (d in nodeDict)
          return nodeDict[d].nodeinfo.hostname

        return d
      })

      fillTable(fwTable, fwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable(hwTable, hwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable(autoTable, autoDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable(gwTable, gwDict.sort(function (a, b) { return b[1] - a[1] }))
    }

    self.render = function (el) {
      var h2
      h2 = document.createElement("h2")
      h2.textContent = "Firmwareversionen"
      el.appendChild(h2)

      fwTable = document.createElement("table")
      fwTable.classList.add("proportion")
      el.appendChild(fwTable)

      h2 = document.createElement("h2")
      h2.textContent = "Hardwaremodelle"
      el.appendChild(h2)

      hwTable = document.createElement("table")
      hwTable.classList.add("proportion")
      el.appendChild(hwTable)

      h2 = document.createElement("h2")
      h2.textContent = "Autoupdater"
      el.appendChild(h2)

      autoTable = document.createElement("table")
      autoTable.classList.add("proportion")
      el.appendChild(autoTable)

      h2 = document.createElement("h2")
      h2.textContent = "Gewählter Gateway"
      el.appendChild(h2)

      gwTable = document.createElement("table")
      gwTable.classList.add("proportion")
      el.appendChild(gwTable)
    }

    return self
  }
})
