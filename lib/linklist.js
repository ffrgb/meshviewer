define(["sorttable", "virtual-dom", "helper"], function (SortTable, V, helper) {
  "use strict";

  function linkName(d) {
    return (d.source.node ? d.source.node.nodeinfo.hostname : d.source.id) + " – " + d.target.node.nodeinfo.hostname;
  }

  var headings = [{
    name: "node.nodes",
    sort: function (a, b) {
      return linkName(a).localeCompare(linkName(b));
    },
    reverse: false
  },
    {
      name: "node.tq",
      sort: function (a, b) {
        return a.tq - b.tq;
      },
      reverse: true
    },
    {
      name: "node.distance",
      sort: function (a, b) {
        return (a.distance === undefined ? -1 : a.distance) -
          (b.distance === undefined ? -1 : b.distance);
      },
      reverse: true
    }];

  return function (linkScale, router) {
    var table = new SortTable(headings, 2, renderRow);
    table.el.classList.add("link-list");

    function renderRow(d) {
      var td1Content = [V.h("a", {href: "#", onclick: router.link(d)}, linkName(d))];

      var td1 = V.h("td", td1Content);
      var td2 = V.h("td", {style: {color: linkScale(d.tq).hex()}}, helper.showTq(d));
      var td3 = V.h("td", helper.showDistance(d));

      return V.h("tr", [td1, td2, td3]);
    }

    this.render = function (d) {
      var h2 = document.createElement("h2");
      h2.textContent = _.t("node.links");
      d.appendChild(h2);

      d.appendChild(table.el);
    };

    this.setData = function (d) {
      table.setData(d.graph.links);
    };
  };
});
