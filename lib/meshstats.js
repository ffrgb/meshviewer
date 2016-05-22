define(function () {
  return function (config) {
    var self = this;
    var stats, timestamp;

    self.setData = function (d) {
      var totalNodes = sum(d.nodes.all.map(one));
      var totalOnlineNodes = sum(d.nodes.all.filter(online).map(one));
      var totalNewNodes = sum(d.nodes.new.map(one));
      var totalLostNodes = sum(d.nodes.lost.map(one));
      var totalClients = sum(d.nodes.all.filter(online).map( function (d) {
        return d.statistics.clients ? d.statistics.clients : 0;
      }));
      var totalGateways = sum(d.nodes.all.filter(online).filter( function (d) {
        return d.flags.gateway;
      }).map(one));

      var nodetext = [{ count: totalOnlineNodes, label: "online" },
                      { count: totalNewNodes, label: "neu" },
                      { count: totalLostNodes, label: "verschwunden" }
                     ].filter( function (d) { return d.count > 0; } )
                      .map( function (d) { return [d.count, d.label].join(" "); } )
                      .join(", ");

      stats.textContent = totalNodes + " Knoten " +
                          "(" + nodetext + "), " +
                          totalClients + " Client" + ( totalClients === 1 ? ", " : "s, " ) +
                          totalGateways + " Gateways";

      timestamp.textContent = "Diese Daten sind von " + d.timestamp.format("LLLL") + ".";
    };

    self.render = function (el) {
      var h2 = document.createElement("h2");
      h2.textContent = config.siteName;
      el.appendChild(h2);

      var p = document.createElement("p");
      el.appendChild(p);
      stats = document.createTextNode("");
      p.appendChild(stats);
      p.appendChild(document.createElement("br"));
      timestamp = document.createTextNode("");
      p.appendChild(timestamp);
    };

    return self;
  };
});
