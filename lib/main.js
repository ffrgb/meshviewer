define(["config", "moment", "chroma-js", "router", "map", "sidebar", "tabs", "container", "meshstats", "linklist", "nodelist", "simplenodelist", "infobox/main", "leaflet"],
function (config, moment, chroma, Router, Map, Sidebar, Tabs, Container, Meshstats, Linklist, Nodelist, SimpleNodelist, Infobox, L) {
  return function () {
    var dataTargets = []
    var router

    function createGUI() {
      moment.locale("de")

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
    }

    function handleData(data) {
      var nodes = Object.keys(data[0].nodes).map(function (key) { return data[0].nodes[key] })

      nodes = nodes.filter( function (d) {
        return "firstseen" in d && "lastseen" in d
      })

      nodes.forEach( function(node) {
        node.firstseen = moment.utc(node.firstseen).local()
        node.lastseen = moment.utc(node.lastseen).local()
      })

      var now = moment()
      var age = moment(now).subtract(14, "days")

      var newnodes = limit("firstseen", age, sortByKey("firstseen", nodes).filter(online))
      var lostnodes = limit("lastseen", age, sortByKey("lastseen", nodes).filter(offline))

      var graph = data[1].batadv
      var graphnodes = data[0].nodes

      graph.nodes.forEach( function (d) {
        if (d.node_id in graphnodes)
          d.node = graphnodes[d.node_id]
      })

      graph.links.forEach( function (d) {
        if (graph.nodes[d.source].node)
          d.source = graph.nodes[d.source]
        else
          d.source = undefined

        if (graph.nodes[d.target].node)
          d.target = graph.nodes[d.target]
        else
          d.target = undefined
      })

      var links = graph.links.filter( function (d) {
        return d.source !== undefined && d.target !== undefined
      })

      links.forEach( function (d) {
        if (!("location" in d.source.node.nodeinfo && "location" in d.target.node.nodeinfo))
          return

        d.latlngs = []
        d.latlngs.push(L.latLng(d.source.node.nodeinfo.location.latitude, d.source.node.nodeinfo.location.longitude))
        d.latlngs.push(L.latLng(d.target.node.nodeinfo.location.latitude, d.target.node.nodeinfo.location.longitude))

        d.distance = d.latlngs[0].distanceTo(d.latlngs[1])
      })

      nodes.forEach( function (d) {
        d.neighbours = []
      })

      links.forEach( function (d) {
        d.source.node.neighbours.push({ node: d.target.node, link: d })
        d.target.node.neighbours.push({ node: d.source.node, link: d })
      })

      return { now: now,
               timestamp: moment.utc(data[0].timestamp).local(),
               nodes: {
                 all: nodes,
                 new: newnodes,
                 lost: lostnodes
               },
               links: links
             }
    }

    router = new Router()
    dataTargets.push(router)

    var urls = [ config.dataPath + "nodes.json",
                 config.dataPath + "graph.json"
               ]

    Promise.all(urls.map(getJSON))
      .then(function (d) {
        createGUI()
        return d
      })
      .then(handleData)
      .then(function (d) {
        dataTargets.forEach(function (t) {
          t.setData(d)
        })
      })
      .then(function () { router.start() })

  }
})
