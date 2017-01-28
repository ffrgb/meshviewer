define(["helper"], function (helper) {
  "use strict";

  function showStatImg(o, source, target, time) {
    var subst = {};
    subst["{SOURCE}"] = source;
    subst["{TARGET}"] = target;
    subst["{TIME}"] = time;
    subst["{LOCALE}"] = _.locale();
    return helper.showStat(o, subst);
  }

  return function (config, el, router, d) {
    var unknown = !d.source.node;
    var h2 = document.createElement("h2");
    var a1;
    if (!unknown) {
      a1 = document.createElement("a");
      a1.href = "#";
      a1.onclick = router.node(d.source.node);
    } else {
      a1 = document.createElement("span");
    }
    a1.textContent = unknown ? d.source.id : d.source.node.nodeinfo.hostname;
    h2.appendChild(a1);

    var arrow = document.createElement("spam");
    arrow.classList.add("ion-ios-arrow-thin-right");
    h2.appendChild(arrow);

    var a2 = document.createElement("a");
    a2.href = "#";
    a2.onclick = router.node(d.target.node);
    a2.textContent = d.target.node.nodeinfo.hostname;
    h2.appendChild(a2);
    el.appendChild(h2);

    var attributes = document.createElement("table");
    attributes.classList.add("attributes");

    helper.attributeEntry(attributes, "TQ", helper.showTq(d));
    helper.attributeEntry(attributes, "Entfernung", helper.showDistance(d));
    var hw1 = unknown ? null : helper.dictGet(d.source.node.nodeinfo, ["hardware", "model"]);
    var hw2 = helper.dictGet(d.target.node.nodeinfo, ["hardware", "model"]);
    helper.attributeEntry(attributes, "Hardware", (hw1 != null ? hw1 : "unbekannt") + " – " + (hw2 != null ? hw2 : "unbekannt"));
    el.appendChild(attributes);

    if (config.linkInfos) {
      var source = d.source.node_id;
      var target = d.target.node_id;
      var time = d.target.node.lastseen.format("DDMMYYYYHmmss");
      config.linkInfos.forEach(function (linkInfo) {
        var h4 = document.createElement("h4");
        h4.textContent = linkInfo.name;
        el.appendChild(h4);
        el.appendChild(showStatImg(linkInfo, source, target, time));
      });
    }
  };
});
