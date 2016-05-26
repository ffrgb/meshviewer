define(["helper"], function (helper) {
  return function (config) {
    var self = this;
    var stats, timestamp;

    self.setData = function (d) {
      var totalNodes = helper.sum(d.nodes.all.map(helper.one));
      var totalOnlineNodes = helper.sum(d.nodes.all.filter(helper.online).map(helper.one));
      var totalNewNodes = helper.sum(d.nodes.new.map(helper.one));
      var totalLostNodes = helper.sum(d.nodes.lost.map(helper.one));
      var totalClients = helper.sum(d.nodes.all.filter(helper.online).map(function (d) {
        return d.statistics.clients ? d.statistics.clients : 0;
      }));
      var totalGateways = helper.sum(d.nodes.all.filter(helper.online).filter(function (d) {
        return d.flags.gateway;
      }).map(helper.one));

      var nodetext = [{count: totalOnlineNodes, label: "online"},
        {count: totalNewNodes, label: "neu"},
        {count: totalLostNodes, label: "verschwunden"}
      ].filter(function (d) {
        return d.count > 0;
      })
        .map(function (d) {
          return [d.count, d.label].join(" ");
        })
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
