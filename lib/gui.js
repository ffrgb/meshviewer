define([ "chroma-js", "map", "sidebar", "tabs", "container", "meshstats",
         "linklist", "nodelist", "simplenodelist", "infobox/main" ],
function (chroma, Map, Sidebar, Tabs, Container, Meshstats, Linklist,
          Nodelist, SimpleNodelist, Infobox) {
  return function (config, router) {
    var self = this
    var dataTargets = []

    var linkScale = chroma.scale(chroma.interpolate.bezier(["green", "yellow", "red"])).domain([1, 5])
    var sidebar = new Sidebar(document.body)
    var infobox = new Infobox(config, sidebar, router)
    var tabs = new Tabs()
    var overview = new Container()

    var map = new Map(linkScale, sidebar, router)
    document.body.insertBefore(map.div, document.body.firstChild)

    var meshstats = new Meshstats()
    var newnodeslist = new SimpleNodelist(config, "new", "firstseen", router, "Neue Knoten")
    var lostnodeslist = new SimpleNodelist(config, "lost", "lastseen", router, "Verschwundene Knoten")
    var nodelist = new Nodelist(router)
    var linklist = new Linklist(linkScale, router)

    dataTargets.push(map)
    dataTargets.push(meshstats)
    dataTargets.push(newnodeslist)
    dataTargets.push(lostnodeslist)
    dataTargets.push(nodelist)
    dataTargets.push(linklist)

    overview.add(meshstats)
    overview.add(newnodeslist)
    overview.add(lostnodeslist)

    sidebar.add(tabs)
    tabs.add("Übersicht", overview)
    tabs.add("Alle Knoten", nodelist)
    tabs.add("Verbindungen", linklist)

    router.addTarget(infobox)
    router.addTarget(map)

    self.setData = function (data) {
      dataTargets.forEach(function (d) {
        d.setData(data)
      })
    }

    return self
  }
})
