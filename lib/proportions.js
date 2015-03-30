define(["chartjs", "chroma-js"], function (ChartJS, Chroma) {
  return function () {
    var self = this
    var fwTable, hwTable, autoTable
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
      var max = 0
      data.forEach(function (d) {
        if (d[1] > max)
          max = d[1]
      })

      data.forEach(function (d) {
        var v = d[1] / max
        var row = document.createElement("tr")
        var th = document.createElement("th")
        var td = document.createElement("td")
        var span = document.createElement("span")
        th.textContent = d[0]
        span.style.width = Math.round(v * 100) + "%"
        span.style.backgroundColor = scale(v).hex()
        var c1 = Chroma.contrast(scale(v), "white")
        var c2 = Chroma.contrast(scale(v), "black")
        span.style.color = c1 > c2 ? "white" : "black"
        span.textContent = d[1]
        td.appendChild(span)
        row.appendChild(th)
        row.appendChild(td)
        table.appendChild(row)
      })
    }

    self.setData = function (data) {
      var nodes = data.nodes.all.filter(online).concat(data.nodes.lost)

      var fwDict = count(nodes, ["nodeinfo", "software", "firmware", "release"], "n/a")
      var hwDict = count(nodes, ["nodeinfo", "hardware", "model"], "n/a")
      var autoDict = count(nodes, ["nodeinfo", "software", "autoupdater"], "deaktiviert", function (d) {
        if (d === null || !d.enabled)
          return null
        else
          return d.branch
      })

      fillTable(fwTable, fwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable(hwTable, hwDict.sort(function (a, b) { return b[1] - a[1] }))
      fillTable(autoTable, autoDict.sort(function (a, b) { return b[1] - a[1] }))
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
    }

    return self
  }
})
