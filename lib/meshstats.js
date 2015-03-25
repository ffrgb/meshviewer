define(function () {
  return function () {
    var self = this
    var p

    self.setData = function (nodes) {
      var totalNodes = sum(nodes.filter(online).map(one))
      var totalClients = sum(nodes.filter(online).map( function (d) {
        return d.statistics.clients
      }))
      var totalGateways = sum(nodes.filter(online).filter( function (d) {
        return d.flags.gateway
      }).map(one))

      p.textContent = totalNodes + " Knoten (online), " +
                      totalClients + " Clients, " +
                      totalGateways + " Gateways"

      p.appendChild(document.createElement("br"))
      p.appendChild(document.createTextNode("Diese Daten sind " + moment.utc(nodes.timestamp).fromNow(true) + " alt."))
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
