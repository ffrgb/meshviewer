define([ "chroma-js", "map", "sidebar", "tabs", "container", "meshstats",
         "linklist", "nodelist", "simplenodelist", "infobox/main",
         "proportions", "forcegraph", "title", "about" ],
function (chroma, Map, Sidebar, Tabs, Container, Meshstats, Linklist,
          Nodelist, SimpleNodelist, Infobox, Proportions, ForceGraph,
          Title, About) {
  return function (config, router) {
    var self = this
    var dataTargets = []
    var latestData
    var content
    var contentDiv

    var linkScale = chroma.scale(chroma.interpolate.bezier(["green", "yellow", "red"])).domain([1, 5])
    var sidebar

    function dataTargetRemove(d) {
      dataTargets = dataTargets.filter( function (e) { return d !== e })
    }

    function removeContent() {
      if (!content)
        return

      router.removeTarget(content)
      dataTargetRemove(content)
      content.destroy()
      contentDiv.removeChild(content.div)
      content = null
    }

    function addContent(K) {
      removeContent()

      content = new K(config, linkScale, sidebar, router)
      contentDiv.appendChild(content.div)

      if (latestData)
        content.setData(latestData)

      dataTargets.push(content)
      router.addTarget(content)
      router.reload()
    }

    contentDiv = document.createElement("div")
    contentDiv.classList.add("content")
    document.body.appendChild(contentDiv)

    sidebar = new Sidebar(document.body)

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
    contentDiv.appendChild(buttonToggle)

    var title = new Title(config)
    var infobox = new Infobox(config, sidebar, router)
    var tabs = new Tabs()
    var overview = new Container()
    var meshstats = new Meshstats()
    var newnodeslist = new SimpleNodelist("new", "firstseen", router, "Neue Knoten")
    var lostnodeslist = new SimpleNodelist("lost", "lastseen", router, "Verschwundene Knoten")
    var nodelist = new Nodelist(router)
    var linklist = new Linklist(linkScale, router)
    var statistics = new Proportions(config)
    var about = new About()

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
    tabs.add("Knoten", nodelist)
    tabs.add("Verbindungen", linklist)
    tabs.add("Statistiken", statistics)
    tabs.add("Über", about)

    router.addTarget(title)
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
