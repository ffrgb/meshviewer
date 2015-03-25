require(["map", "infobox/main"], function (Map, Infobox) {
  main()

  function main() {
    getJSON("config.json").then( function (config) {
      moment.locale("de")

      var linkScale = chroma.scale(chroma.interpolate.bezier(['green', 'yellow', 'red'])).domain([1, 5])

      var sidebar = mkSidebar(document.body)

      var gotoAnything = new gotoBuilder(config)

      var infobox = new Infobox(config, sidebar, gotoAnything)
      gotoAnything.addTarget(infobox)

      var map = new Map(sidebar, gotoAnything)
      document.body.insertBefore(map.div, document.body.firstChild)
      gotoAnything.addTarget(map)


      var urls = [ config.dataPath + 'nodes.json',
                   config.dataPath + 'graph.json'
                 ]

      var p = Promise.all(urls.map(getJSON))
      p.then(handle_data(config, linkScale, sidebar, infobox, map, gotoAnything))
    })
  }

  function handle_data(config, linkScale, sidebar, infobox, map, gotoAnything) {
    return function (data) {
      var nodedict = data[0]
      var nodes = Object.keys(nodedict.nodes).map(function (key) { return nodedict.nodes[key] })

      nodes = nodes.filter( function (d) {
        return "firstseen" in d && "lastseen" in d
      })

      nodes.forEach( function(node) {
        node.firstseen = moment.utc(node.firstseen)
        node.lastseen = moment.utc(node.lastseen)
      })

      var now = moment()
      var age = moment(now).subtract(14, 'days')

      var newnodes = limit("firstseen", age, sortByKey("firstseen", nodes).filter(online))
      var lostnodes = limit("lastseen", age, sortByKey("lastseen", nodes).filter(offline))

      var onlinenodes = nodes.filter(online)

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

      map.setData(linkScale, sidebar, now, newnodes, lostnodes, onlinenodes, links)

      showMeshstats(sidebar, nodes)
      mkNodesList(sidebar, config.showContact, "firstseen", gotoAnything.node, "Neue Knoten", newnodes)
      mkNodesList(sidebar, config.showContact, "lastseen", gotoAnything.node, "Verschwundene Knoten", lostnodes)
      mkLinkList(sidebar, linkScale, gotoAnything.link, links)

      var historyDict = { nodes: {}, links: {} }

      nodes.forEach( function (d) {
        historyDict.nodes[d.nodeinfo.node_id] = d
      })

      links.forEach( function (d) {
        historyDict.links[linkId(d)] = d
      })

      gotoAnything.reset()

      gotoHistory(gotoAnything, historyDict, window.location.hash)

      window.onpopstate = function (d) {
        gotoHistory(gotoAnything, historyDict, d.state)
      }
    }
  }

  function mkSidebar(el) {
    var sidebar = document.createElement("div")
    sidebar.classList.add("sidebar")
    el.appendChild(sidebar)

    var button = document.createElement("button")
    sidebar.appendChild(button)

    button.classList.add("sidebarhandle")
    button.onclick = function () {
      sidebar.classList.toggle("hidden")
    }

    var container = document.createElement("div")
    container.classList.add("container")
    sidebar.appendChild(container)

    container.getWidth = function () {
      var small = window.matchMedia("(max-width: 60em)");
      return small.matches ? 0 : sidebar.offsetWidth
    }

    return container
  }

  function mkLinkList(el, linkScale, gotoProxy, links) {
    if (links.length == 0)
      return

    var h2 = document.createElement("h2")
    h2.textContent = "Verbindungen"
    el.appendChild(h2)

    var table = document.createElement("table")
    var thead = document.createElement("thead")

    var tr = document.createElement("tr")
    var th1 = document.createElement("th")
    th1.textContent = "Knoten"
    tr.appendChild(th1)

    var th2 = document.createElement("th")
    th2.textContent = "TQ"
    tr.appendChild(th2)

    var th3 = document.createElement("th")
    th3.textContent = "Entfernung"
    th3.classList.add("sort-default")
    tr.appendChild(th3)

    thead.appendChild(tr)

    table.appendChild(thead)

    var tbody = document.createElement("tbody")

    links.forEach( function (d) {
      var row = document.createElement("tr")
      var td1 = document.createElement("td")
      var a = document.createElement("a")
      a.textContent = d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname
      a.href = "#"
      a.onclick = gotoProxy(d)
      td1.appendChild(a)
      row.appendChild(td1)

      if (d.vpn)
        td1.appendChild(document.createTextNode(" (VPN)"))

      var td2 = document.createElement("td")
      td2.textContent = showTq(d)
      td2.style.color = linkScale(d.tq)
      row.appendChild(td2)

      var td3 = document.createElement("td")
      td3.textContent = showDistance(d)
      td3.setAttribute("data-sort", d.distance !== undefined ? -d.distance : 1)
      row.appendChild(td3)

      tbody.appendChild(row)
    })

    table.appendChild(tbody)

    new Tablesort(table)

    el.appendChild(table)
  }

  function mkNodesList(el, showContact, tf, gotoProxy, title, list) {
    if (list.length == 0)
      return

    var h2 = document.createElement("h2")
    h2.textContent = title
    el.appendChild(h2)
    var table = document.createElement("table")
    el.appendChild(table)

    var tbody = document.createElement("tbody")

    list.forEach( function (d) {
      var time = moment(d[tf]).fromNow()

      var row = document.createElement("tr")
      var td1 = document.createElement("td")
      var a = document.createElement("a")
      a.classList.add("hostname")
      a.classList.add(d.flags.online ? "online" : "offline")
      a.textContent = d.nodeinfo.hostname
      a.href = "#"
      a.onclick = gotoProxy(d)
      td1.appendChild(a)

      if (has_location(d)) {
        var span = document.createElement("span")
        span.classList.add("icon")
        span.classList.add("ion-location")
        td1.appendChild(span)
      }

      if ("owner" in d.nodeinfo && showContact) {
        var contact = d.nodeinfo.owner.contact
        td1.appendChild(document.createTextNode(" – " + contact + ""))
      }

      var td2 = document.createElement("td")
      td2.textContent = time

      row.appendChild(td1)
      row.appendChild(td2)
      tbody.appendChild(row)
    })

    table.appendChild(tbody)
    el.appendChild(table)
  }

  function showMeshstats(el, nodes) {
    var h2 = document.createElement("h2")
    h2.textContent = "Übersicht"
    el.appendChild(h2)

    var p = document.createElement("p")

    var totalNodes = sum(nodes.filter(online).map(one))
    var totalClients = sum(nodes.filter(online).map( function (d) {
      return d.statistics.clients
    }))
    var totalGateways = sum(nodes.filter(online).filter( function (d) {
      return d.flags.gateway
    }).map(one))

    p.textContent = totalNodes + " Knoten (online), " +
                    totalClients + " Clients, " +
                    totalGateways + " Gateways"

    p.appendChild(document.createElement("br"))
    p.appendChild(document.createTextNode("Diese Daten sind " + moment.utc(nodes.timestamp).fromNow(true) + " alt."))
    el.appendChild(p)
  }

  function pushHistory(d) {
    var s = "#!"

    if (d) {
      if ("node" in d)
        s += "n:" + d.node.nodeinfo.node_id

      if ("link" in d)
        s += "l:" + linkId(d.link)
    }

    window.history.pushState(s, undefined, s)
  }

  function gotoHistory(gotoAnything, dict, s) {
    if (!s.startsWith("#!"))
      return

    s = s.slice(2)

    var args = s.split(":")

    if (args[0] === "n") {
      var id = args[1]

      if (id in dict.nodes)
        gotoAnything.node(dict.nodes[id], true, false)()
    }

    if (args[0] === "l") {
      var id = args[1]

      if (id in dict.links)
        gotoAnything.link(dict.links[id], true, false)()
    }
  }

  function gotoBuilder(config, nodes) {
    var targets = []
    var self = this

    var infobox

    function resetView() {
      targets.forEach( function (t) {
        t.resetView()
      })

      pushHistory()
    }

    function gotoNode(d, showMap, push) {
      showMap = trueDefault(showMap)
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.gotoNode(d)
      })

      if (push)
        pushHistory( { node: d })

      return false
    }

    function gotoLink(d, showMap, push) {
      showMap = trueDefault(showMap)
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.gotoLink(d)
      })

      if (push)
        pushHistory( { link: d })

      return false
    }

    self.node = function (d, m, p) { return function () { return gotoNode(d, m, p) }}
    self.link = function (d, m, p) { return function () { return gotoLink(d, m, p) }}
    self.reset = resetView
    self.addMarkers = function (d) {
                        markers = d
                      }
    self.addTarget = function (d) { targets.push(d) }

    return self
  }
})
