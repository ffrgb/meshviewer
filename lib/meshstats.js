define(function () {
  return function () {
    var self = this
    var stats, timestamp

    self.setData = function (d) {
      var totalNodes = sum(d.nodes.all.filter(online).map(one))
      var totalClients = sum(d.nodes.all.filter(online).map( function (d) {
        return d.statistics.clients
      }))
      var totalGateways = sum(d.nodes.all.filter(online).filter( function (d) {
        return d.flags.gateway
      }).map(one))

      stats.textContent = totalNodes + " Knoten (online), " +
                          totalClients + " Clients, " +
                          totalGateways + " Gateways"

      timestamp.textContent = "Diese Daten sind von " + d.timestamp.format("LLLL") + "."
    }

    self.render = function (el) {
      var h2 = document.createElement("h2")
      h2.textContent = "Übersicht"
      el.appendChild(h2)

      var p = document.createElement("p")
      el.appendChild(p)
      stats = document.createTextNode("")
      p.appendChild(stats)
      p.appendChild(document.createElement("br"))
      timestamp = document.createTextNode("")
      p.appendChild(timestamp)
    }

    return self
  }
})
