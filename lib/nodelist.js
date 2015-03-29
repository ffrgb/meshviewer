define(["tablesort", "tablesort.numeric"], function (Tablesort) {
  return function(router) {
    function showUptime(el, now, d) {
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

      el.textContent = s
      el.setAttribute("data-sort", uptime !== undefined ? -uptime : 0)
    }

    var self = this
    var el

    self.render = function (d) {
      el = document.createElement("div")
      d.appendChild(el)
    }

    self.setData = function (data) {
      if (data.nodes.all.length === 0)
        return

      var h2 = document.createElement("h2")
      h2.textContent = "Alle Knoten"
      el.appendChild(h2)

      var table = document.createElement("table")
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

      var tbody = document.createElement("tbody")

      data.nodes.all.forEach( function (d) {
        var row = document.createElement("tr")

        var td1 = document.createElement("td")
        var a = document.createElement("a")
        a.textContent = d.nodeinfo.hostname
        a.href = "#"
        a.onclick = router.node(d)
        a.classList.add("hostname")
        a.classList.add(d.flags.online ? "online" : "offline")
        td1.appendChild(a)
        row.appendChild(td1)

        if (has_location(d)) {
          var span = document.createElement("span")
          span.classList.add("icon")
          span.classList.add("ion-location")
          td1.appendChild(span)
        }

        var td2 = document.createElement("td")
        showUptime(td2, data.now, d)
        row.appendChild(td2)

        var td3 = document.createElement("td")
        td3.textContent = "clients" in d.statistics ? d.statistics.clients : ""
        row.appendChild(td3)

        tbody.appendChild(row)
      })

      table.appendChild(tbody)

      new Tablesort(table)

      el.appendChild(table)
   }
  }
})
