define(function () {
  return function () {
    var self = this
    var p

    self.setData = function (d) {
      var totalNodes = sum(d.nodes.all.filter(online).map(one))
      var totalClients = sum(d.nodes.all.filter(online).map( function (d) {
        return d.statistics.clients
      }))
      var totalGateways = sum(d.nodes.all.filter(online).filter( function (d) {
        return d.flags.gateway
      }).map(one))

      p.textContent = totalNodes + " Knoten (online), " +
                      totalClients + " Clients, " +
                      totalGateways + " Gateways"

      p.appendChild(document.createElement("br"))
      p.appendChild(document.createTextNode("Diese Daten sind von " + d.timestamp.format("LLLL") + "."))
    }

    self.render = function (el) {
      var h2 = document.createElement("h2")
      h2.textContent = "Übersicht"
      el.appendChild(h2)

      p = document.createElement("p")
      el.appendChild(p)
    }

    return self
  }
})
