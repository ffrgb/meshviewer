define(function () {
  function showStatImg(o, source, target) {
    var content, caption

    if (o.thumbnail) {
      content = document.createElement("img")
      content.src = o.thumbnail.replace("{SOURCE}", source).replace("{TARGET}", target)
    }

    if (o.caption) {
      caption = o.caption.replace("{SOURCE}", source).replace("{TARGET}", target)

      if (!content)
        content = document.createTextNode(caption)
    }

    var p = document.createElement("p")

    if (o.href) {
      var link = document.createElement("a")
      link.target = "_blank"
      link.href = o.href.replace("{SOURCE}", source).replace("{TARGET}", target)
      link.appendChild(content)

      if (caption && o.thumbnail)
        link.title = caption

      p.appendChild(link)
    } else
      p.appendChild(content)

    return p
  }

  return function (config, el, router, d) {
    var unknown = !(d.source.node)
    var h2 = document.createElement("h2")
    var a1 = document.createElement("a")
    if (!unknown) {
      a1.href = "#"
      a1.onclick = router.node(d.source.node)
    }
    a1.textContent = unknown ? d.source.id : d.source.node.nodeinfo.hostname
    h2.appendChild(a1)
    h2.appendChild(document.createTextNode(" → "))
    var a2 = document.createElement("a")
    a2.href = "#"
    a2.onclick = router.node(d.target.node)
    a2.textContent = d.target.node.nodeinfo.hostname
    h2.appendChild(a2)
    el.appendChild(h2)

    var attributes = document.createElement("table")
    attributes.classList.add("attributes")

    attributeEntry(attributes, "TQ", showTq(d))
    attributeEntry(attributes, "Entfernung", showDistance(d))
    attributeEntry(attributes, "Typ", d.type)
    var hw1 = unknown ? null : dictGet(d.source.node.nodeinfo, ["hardware", "model"])
    var hw2 = dictGet(d.target.node.nodeinfo, ["hardware", "model"])
    attributeEntry(attributes, "Hardware", (hw1 != null ? hw1 : "unbekannt") + " – " + (hw2 != null ? hw2 : "unbekannt"))
    el.appendChild(attributes)

    if (config.linkInfos) {
      var source = d.source.node_id
      var target = d.target.node_id
      config.linkInfos.forEach( function (linkInfo) {
        var h4 = document.createElement("h4")
        h4.textContent = linkInfo.name
        el.appendChild(h4)
        el.appendChild(showStatImg(linkInfo, source, target))
      })
    }
  }
})
