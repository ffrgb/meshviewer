define(["tablesort", "virtual-dom", "tablesort.numeric"],
  function (Tablesort, V) {
  return function(router) {
    function showUptime(now, d) {
      var uptime
      if (d.flags.online && "uptime" in d.statistics)
        uptime = Math.round(d.statistics.uptime / 3600)
      else if (!d.flags.online && "lastseen" in d)
        uptime = Math.round(-(now - d.lastseen) / 3600000)

      var s = ""

      if (uptime !== undefined)
        if (Math.abs(uptime) >= 24)
          s = Math.round(uptime / 24) + "d"
        else
          s = uptime + "h"

      return {v: s, sort: uptime !== undefined ? -uptime : 0}
    }

    var self = this
    var el, tbody, sort

    self.render = function (d) {
      el = document.createElement("div")
      d.appendChild(el)
    }

    self.setData = function (data) {
      if (data.nodes.all.length === 0)
        return

      if (!tbody) {
        var h2 = document.createElement("h2")
        h2.textContent = "Alle Knoten"
        el.appendChild(h2)

        var table = document.createElement("table")
        el.appendChild(table)

        var thead = document.createElement("thead")

        var tr = document.createElement("tr")
        var th1 = document.createElement("th")
        th1.textContent = "Knoten"
        th1.classList.add("sort-default")
        tr.appendChild(th1)

        var th2 = document.createElement("th")
        th2.textContent = "Uptime"
        tr.appendChild(th2)

        var th3 = document.createElement("th")
        th3.textContent = "Clients"
        tr.appendChild(th3)

        thead.appendChild(tr)
        table.appendChild(thead)

        tbody = document.createElement("tbody")
        tbody.last = V.h("tbody")
        table.appendChild(tbody)

        sort = new Tablesort(table)
      }


      var items = data.nodes.all.map( function (d) {
        var td1Content = []
        var aClass = ["hostname", d.flags.online ? "online" : "offline"]

        td1Content.push(V.h("a", { className: aClass.join(" "),
                                   onclick: router.node(d),
                                   href: "#"
                                 }, d.nodeinfo.hostname))

        if (has_location(d))
          td1Content.push(V.h("span", {className: "icon ion-location"}))

        var uptime = showUptime(data.now, d)

        var td1 = V.h("td", td1Content)
        var td2 = V.h("td", {attributes: { "data-sort": uptime.sort }}, uptime.v)
        var td3 = V.h("td", "clients" in d.statistics ? d.statistics.clients : "")

        return V.h("tr", [td1, td2, td3])
      })

      var tbodyNew = V.h("tbody", items)
      tbody = V.patch(tbody, V.diff(tbody.last, tbodyNew))
      tbody.last = tbodyNew
      sort.refresh()
   }
  }
})
