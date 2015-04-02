define(["tablesort", "virtual-dom", "tablesort.numeric"],
  function (Tablesort, V) {
  return function(linkScale, router) {
    var self = this
    var el, tbody, sort

    self.render = function (d)  {
      el = document.createElement("div")
      d.appendChild(el)
    }

    self.setData = function (data) {
      if (data.graph.links.length === 0)
        return

      if (!tbody) {
        var h2 = document.createElement("h2")
        h2.textContent = "Verbindungen"
        el.appendChild(h2)

        var table = document.createElement("table")
        el.appendChild(table)

        var thead = document.createElement("thead")

        var tr = document.createElement("tr")
        var th1 = document.createElement("th")
        th1.textContent = "Knoten"
        tr.appendChild(th1)

        var th2 = document.createElement("th")
        th2.textContent = "TQ"
        tr.appendChild(th2)

        var th3 = document.createElement("th")
        th3.textContent = "Entfernung"
        th3.classList.add("sort-default")
        tr.appendChild(th3)

        thead.appendChild(tr)
        table.appendChild(thead)

        tbody = document.createElement("tbody")
        tbody.last = V.h("tbody")
        table.appendChild(tbody)

        sort = new Tablesort(table)
      }

      var items = data.graph.links.map( function (d) {
        var name = d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname
        var td1Content = [V.h("a", {href: "#", onclick: router.link(d)}, name)]

        if (d.vpn)
          td1Content.push(" (VPN)")

        var td1 = V.h("td", td1Content)
        var td2 = V.h("td", {style: {color: linkScale(d.tq)}}, showTq(d))
        var td3 = V.h("td", {attributes: {
                              "data-sort": d.distance !== undefined ? -d.distance : 1
                            }}, showDistance(d))

        return V.h("tr", [td1, td2, td3])
      })

      var tbodyNew = V.h("tbody", items)
      tbody = V.patch(tbody, V.diff(tbody.last, tbodyNew))
      tbody.last = tbodyNew
      sort.refresh()
    }
  }
})
