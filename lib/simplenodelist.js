define(["moment", "virtual-dom", "moment.de"], function (moment, V) {
  return function (nodes, field, router, title) {
    var self = this;
    var el, tbody;

    self.render = function (d) {
      el = document.createElement("div");
      d.appendChild(el);
    };

    self.setData = function (data) {
      var list = data.nodes[nodes];

      if (list.length === 0) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }

        tbody = null;

        return;
      }

      if (!tbody) {
        var h2 = document.createElement("h2");
        h2.textContent = title;
        el.appendChild(h2);

        var table = document.createElement("table");
        el.appendChild(table);

        tbody = document.createElement("tbody");
        tbody.last = V.h("tbody");
        table.appendChild(tbody);
      }

      var items = list.map(function (d) {
        var time = moment(d[field]).from(data.now);
        var td1Content = [];

        var aClass = ["hostname", d.flags.online ? "online" : "offline"];

        td1Content.push(V.h("a", {
          className: aClass.join(" "),
          onclick: router.node(d),
          href: "#"
        }, d.nodeinfo.hostname));

        if (has_location(d)) {
          td1Content.push(V.h("span", {className: "icon ion-location"}));
        }

        var td1 = V.h("td", td1Content);
        var td2 = V.h("td", time);

        return V.h("tr", [td1, td2]);
      });

      var tbodyNew = V.h("tbody", items);
      tbody = V.patch(tbody, V.diff(tbody.last, tbodyNew));
      tbody.last = tbodyNew;
    };

    return self;
  };
});
