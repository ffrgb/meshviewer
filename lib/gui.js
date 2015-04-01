define([ "chroma-js", "map", "sidebar", "tabs", "container", "meshstats",
         "linklist", "nodelist", "simplenodelist", "infobox/main",
         "proportions", "forcegraph" ],
function (chroma, Map, Sidebar, Tabs, Container, Meshstats, Linklist,
          Nodelist, SimpleNodelist, Infobox, Proportions, ForceGraph) {
  return function (config, router) {
    var self = this
    var dataTargets = []
    var latestData
    var content

    var linkScale = chroma.scale(chroma.interpolate.bezier(["green", "yellow", "red"])).domain([1, 5])
    var sidebar = new Sidebar(document.body)

    function removeContent() {
      if (!content)
        return

      router.removeTarget(content)
      content.destroy()
      document.body.removeChild(content.div)
      content = null
    }

    function addContent(K) {
      removeContent()

      content = new K(linkScale, sidebar, router)
      document.body.insertBefore(content.div, document.body.firstChild)

      if (latestData)
        content.setData(latestData)

      dataTargets.push(content)
      router.addTarget(content)
      router.reload()
    }

    var buttonToggle = document.createElement("button")
    buttonToggle.classList.add("contenttoggle")
    buttonToggle.classList.add("next-graph")
    buttonToggle.onclick = function () {
      if (content.constructor === Map) {
        buttonToggle.classList.remove("next-graph")
        buttonToggle.classList.add("next-map")
        addContent(ForceGraph)
      } else {
        buttonToggle.classList.remove("next-map")
        buttonToggle.classList.add("next-graph")
        addContent(Map)
      }
    }
    document.body.appendChild(buttonToggle)

    var infobox = new Infobox(config, sidebar, router)
    var tabs = new Tabs()
    var overview = new Container()
    var meshstats = new Meshstats()
    var newnodeslist = new SimpleNodelist(config, "new", "firstseen", router, "Neue Knoten")
    var lostnodeslist = new SimpleNodelist(config, "lost", "lastseen", router, "Verschwundene Knoten")
    var nodelist = new Nodelist(router)
    var linklist = new Linklist(linkScale, router)
    var statistics = new Proportions()

    dataTargets.push(meshstats)
    dataTargets.push(newnodeslist)
    dataTargets.push(lostnodeslist)
    dataTargets.push(nodelist)
    dataTargets.push(linklist)
    dataTargets.push(statistics)

    overview.add(meshstats)
    overview.add(newnodeslist)
    overview.add(lostnodeslist)

    sidebar.add(tabs)
    tabs.add("Übersicht", overview)
    tabs.add("Alle Knoten", nodelist)
    tabs.add("Verbindungen", linklist)
    tabs.add("Statistiken", statistics)

    router.addTarget(infobox)

    addContent(Map)

    self.setData = function (data) {
      latestData = data

      dataTargets.forEach(function (d) {
        d.setData(data)
      })
    }

    return self
  }
})
