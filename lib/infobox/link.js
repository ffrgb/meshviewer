define(function () {
  function showStatImg(o, source, target) {
    var subst = {};
    subst["{SOURCE}"] = source;
    subst["{TARGET}"] = target;
    return showStat(o, subst);
  }

  return function (config, el, router, d) {
    var unknown = !(d.source.node);
    var h2 = document.createElement("h2");
    var a1 = document.createElement("a");
    if (!unknown) {
      a1.href = "#";
      a1.onclick = router.node(d.source.node);
    }
    a1.textContent = unknown ? d.source.id : d.source.node.nodeinfo.hostname;
    h2.appendChild(a1);
    h2.appendChild(document.createTextNode(" → "));
    var a2 = document.createElement("a");
    a2.href = "#";
    a2.onclick = router.node(d.target.node);
    a2.textContent = d.target.node.nodeinfo.hostname;
    h2.appendChild(a2);
    el.appendChild(h2);

    var attributes = document.createElement("table");
    attributes.classList.add("attributes");

    attributeEntry(attributes, "TQ", showTq(d));
    attributeEntry(attributes, "Entfernung", showDistance(d));
    attributeEntry(attributes, "Typ", d.type);
    var hw1 = unknown ? null : dictGet(d.source.node.nodeinfo, ["hardware", "model"]);
    var hw2 = dictGet(d.target.node.nodeinfo, ["hardware", "model"]);
    attributeEntry(attributes, "Hardware", (hw1 != null ? hw1 : "unbekannt") + " – " + (hw2 != null ? hw2 : "unbekannt"));
    el.appendChild(attributes);

    if (config.linkInfos) {
      var source = d.source.node_id;
      var target = d.target.node_id;
      config.linkInfos.forEach(function (linkInfo) {
        var h4 = document.createElement("h4");
        h4.textContent = linkInfo.name;
        el.appendChild(h4);
        el.appendChild(showStatImg(linkInfo, source, target));
      });
    }
  };
});
