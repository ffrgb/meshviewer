define(function () {
  return function (config, el, gotoAnything, d) {
    var h2 = document.createElement("h2")
    a1 = document.createElement("a")
    a1.href = "#"
    a1.onclick = gotoAnything.node(d.source.node)
    a1.textContent = d.source.node.nodeinfo.hostname
    h2.appendChild(a1)
    h2.appendChild(document.createTextNode(" – "))
    a2 = document.createElement("a")
    a2.href = "#"
    a2.onclick = gotoAnything.node(d.target.node)
    a2.textContent = d.target.node.nodeinfo.hostname
    h2.appendChild(a2)
    el.appendChild(h2)

    var attributes = document.createElement("table")
    attributes.classList.add("attributes")

    attributeEntry(attributes, "TQ", showTq(d))
    attributeEntry(attributes, "Entfernung", showDistance(d))
    attributeEntry(attributes, "VPN", d.vpn ? "ja" : "nein")

    el.appendChild(attributes)
  }
})
