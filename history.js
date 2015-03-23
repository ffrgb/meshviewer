document.addEventListener('DOMContentLoaded', main)

function main() {
  getJSON("config.json").then( function (config) {
    moment.locale("de")

    var options = { worldCopyJump: true,
                    zoomControl: false
                  }

    var linkScale = chroma.scale(chroma.interpolate.bezier(['green', 'yellow', 'red'])).domain([1, 5])

    var mapDiv = document.createElement("div")
    mapDiv.classList.add("map")
    document.body.insertBefore(mapDiv, document.body.firstChild)

    var map = L.map(mapDiv, options)
    var sidebar = mkSidebar(document.body)
    var infobox = new Infobox(sidebar)
    var gotoAnything = new gotoBuilder(config, infobox, showNodeinfo, showLinkinfo)

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

    var markers = mkmap(map, linkScale, sidebar, now, newnodes, lostnodes, onlinenodes, links, gotoAnything)

    gotoAnything.addMarkers(markers)

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

function mkmap(map, linkScale, sidebar, now, newnodes, lostnodes, onlinenodes, graph, gotoAnything) {
  function mkMarker(dict, iconFunc) {
    return function (d) {
      var opt = { icon: iconFunc(d),
                  title: d.nodeinfo.hostname
                }

      var m = L.marker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], opt)

      m.on('click', gotoAnything.node(d, false))
      m.bindPopup(d.nodeinfo.hostname)

      dict[d.nodeinfo.node_id] = m

      return m
    }
  }

  var iconBase = { iconUrl: 'img/circlemarker.png',
                   iconRetinaUrl: 'img/circlemarker@2x.png',
                   iconSize: [17, 17],
                   iconAnchor: [8, 8],
                   popupAnchor: [0, -3]
                 }

  var iconOnline = Object.assign({}, iconBase)
  iconOnline.className = "node-online"
  iconOnline = L.icon(iconOnline)

  var iconOffline = Object.assign({}, iconBase)
  iconOffline.className = "node-offline"
  iconOffline = L.icon(iconOffline)

  var iconNew = Object.assign({}, iconBase)
  iconNew.className = "node-new"
  iconNew = L.icon(iconNew)

  var iconOfflineAlert = Object.assign({}, iconBase)
  iconOfflineAlert.className = "node-offline node-alert"
  iconOfflineAlert = L.icon(iconOfflineAlert)

  L.control.zoom({ position: "topright" }).addTo(map)

  L.tileLayer("https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: "1234",
    type: "osm",
    attribution: "Map data Tiles &copy; <a href=\"https://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"https://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
    maxZoom: 18
  }).addTo(map)

  var markersDict = addLinksToMap(linkScale, map, graph, gotoAnything)

  var nodes = newnodes.concat(lostnodes).filter(has_location)

  var markers = nodes.map(mkMarker(markersDict, function (d) {
    if (d.flags.online)
      return iconNew

    if (d.lastseen.isAfter(moment(now).subtract(1, 'days')))
      return iconOfflineAlert
    else
      return iconOffline
  }))

  var onlinemarkers = subtract(onlinenodes.filter(has_location), newnodes)
                      .map(mkMarker(markersDict, function (d) { return iconOnline } ))

  var groupOnline = L.featureGroup(onlinemarkers).addTo(map)
  var group = L.featureGroup(markers).addTo(map)

  var bounds = group.getBounds()

  if (!bounds.isValid())
    bounds = groupOnline.getBounds()

  if (bounds.isValid())
    map.fitBounds(bounds, {paddingTopLeft: [sidebar.getWidth(), 0]})

  var funcDict = {}

  Object.keys(markersDict).map( function(k) {
       funcDict[k] = function (d) {
         var m = markersDict[k]
         var bounds

         if ("getBounds" in m)
           bounds = m.getBounds()
         else
           bounds = L.latLngBounds([m.getLatLng()])

         map.fitBounds(bounds, {paddingTopLeft: [sidebar.getWidth(), 0]})
         m.openPopup(bounds.getCenter())
       }
  })

  return funcDict
}

function addLinksToMap(linkScale, map, graph, gotoAnything) {
  var markersDict = {}

  graph = graph.filter( function (d) {
    return "distance" in d
  })

  var lines = graph.map( function (d) {
    var opts = { color: linkScale(d.tq).hex(),
                 weight: 4
               }

    var line = L.polyline(d.latlngs, opts)

    line.bindPopup(d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname + "<br><strong>" + showDistance(d) + " / " + showTq(d) + "</strong>")
    line.on('click', gotoAnything.link(d, false))

    markersDict[linkId(d)] = line

    return line
  })

  var group = L.featureGroup(lines).addTo(map)

  return markersDict
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

function Infobox(sidebar) {
  var self = this
  el = undefined

  function close() {
    destroy()
    pushHistory()
  }

  function destroy() {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
      el = undefined
    }
  }

  self.create = function () {
    destroy()

    el = document.createElement("div")
    sidebar.insertBefore(el, sidebar.firstChild)

    el.scrollIntoView(false)
    el.classList.add("infobox")
    el.close = close
    el.destroy = destroy

    var closeButton = document.createElement("button")
    closeButton.classList.add("close")
    closeButton.onclick = close
    el.appendChild(closeButton)

    return el
  }

  return self
}

function showNodeinfo(config, infobox, gotoAnything, d) {
  var el = infobox.create()

  var h2 = document.createElement("h2")
  h2.textContent = d.nodeinfo.hostname
  var span = document.createElement("span")
  span.classList.add(d.flags.online ? "online" : "offline")
  span.textContent = " (" + (d.flags.online ? "online" : "offline, " + d.lastseen.fromNow(true)) + ")"
  h2.appendChild(span)
  el.appendChild(h2)

  var attributes = document.createElement("table")
  attributes.classList.add("attributes")

  attributeEntry(attributes, "Gateway", d.flags.gateway ? "ja" : null)
  attributeEntry(attributes, "In der Karte", has_location(d) ? "ja" : "nein")

  if (config.showContact)
    attributeEntry(attributes, "Kontakt", dictGet(d.nodeinfo, ["owner", "contact"]))

  attributeEntry(attributes, "Hardware",  dictGet(d.nodeinfo, ["hardware", "model"]))
  attributeEntry(attributes, "Primäre MAC", dictGet(d.nodeinfo, ["network", "mac"]))
  attributeEntry(attributes, "Firmware", showFirmware(d))
  attributeEntry(attributes, "Uptime", showUptime(d))
  attributeEntry(attributes, "Teil des Netzes", showFirstseen(d))
  attributeEntry(attributes, "Arbeitsspeicher", showRAM(d))
  attributeEntry(attributes, "IP Adressen", showIPs(d))
  attributeEntry(attributes, "Clients", showClients(d))
  el.appendChild(attributes)

  if (d.neighbours.length > 0) {
    var h3 = document.createElement("h3")
    h3.textContent = "Nachbarknoten (" + d.neighbours.length + ")"
    el.appendChild(h3)

    var table = document.createElement("table")
    var thead = document.createElement("thead")

    var tr = document.createElement("tr")
    var th1 = document.createElement("th")
    th1.textContent = "Knoten"
    th1.classList.add("sort-default")
    tr.appendChild(th1)

    var th2 = document.createElement("th")
    th2.textContent = "TQ"
    tr.appendChild(th2)

    var th3 = document.createElement("th")
    th3.textContent = "Entfernung"
    tr.appendChild(th3)

    thead.appendChild(tr)
    table.appendChild(thead)

    var tbody = document.createElement("tbody")

    d.neighbours.forEach( function (d) {
      var tr = document.createElement("tr")

      var td1 = document.createElement("td")
      var a1 = document.createElement("a")
      a1.classList.add("hostname")
      a1.textContent = d.node.nodeinfo.hostname
      a1.href = "#"
      a1.onclick = gotoAnything.node(d.node)
      td1.appendChild(a1)

      if (d.link.vpn)
        td1.appendChild(document.createTextNode(" (VPN)"))

      if (has_location(d.node)) {
        var span = document.createElement("span")
        span.classList.add("icon")
        span.classList.add("ion-location")
        td1.appendChild(span)
      }

      tr.appendChild(td1)

      var td2 = document.createElement("td")
      var a2 = document.createElement("a")
      a2.href = "#"
      a2.textContent = showTq(d.link)
      a2.onclick = gotoAnything.link(d.link)
      td2.appendChild(a2)
      tr.appendChild(td2)

      var td3 = document.createElement("td")
      var a3 = document.createElement("a")
      a3.href = "#"
      a3.textContent = showDistance(d.link)
      a3.onclick = gotoAnything.link(d.link)
      td3.appendChild(a3)
      td3.setAttribute("data-sort", d.link.distance !== undefined ? -d.link.distance : 1)
      tr.appendChild(td3)

      tbody.appendChild(tr)
    })

    table.appendChild(tbody)

    new Tablesort(table)

    el.appendChild(table)
  }

  function showFirmware(d) {
    var release = dictGet(d.nodeinfo, ["software", "firmware", "release"])
    var base = dictGet(d.nodeinfo, ["software", "firmware", "base"])

    if (release === null || base === null)
      return

    return release + " / " + base
  }

  function showUptime(d) {
    if (!("uptime" in d.statistics))
      return

    return moment.duration(d.statistics.uptime, "seconds").humanize()
  }

  function showFirstseen(d) {
    if (!("firstseen" in d))
      return

    return d.firstseen.fromNow(true)
  }

  function showClients(d) {
    if (!d.flags.online)
      return

    return function (el) {
      el.appendChild(document.createTextNode(d.statistics.clients > 0 ? d.statistics.clients : "keine"))
      el.appendChild(document.createElement("br"))

      var span = document.createElement("span")
      span.classList.add("clients")
      span.textContent = " ".repeat(d.statistics.clients)
      el.appendChild(span)
    }
  }

  function showIPs(d) {
    var ips = dictGet(d.nodeinfo, ["network", "addresses"])
    if (ips === null)
      return

    ips.sort()

    return function (el) {
      ips.forEach( function (ip, i) {
        var link = !ip.startsWith("fe80:")

        if (i > 0)
          el.appendChild(document.createElement("br"))

        if (link) {
          var a = document.createElement("a")
          a.href = "http://[" + ip + "]/"
          a.textContent = ip
          el.appendChild(a)
        } else
          el.appendChild(document.createTextNode(ip))
      })
    }
  }

  function showRAM(d) {
    if (!("memory_usage" in d.statistics))
      return

    return function (el) {
      el.appendChild(showBar("memory-usage", d.statistics.memory_usage))
    }
  }
}

function attributeEntry(el, label, value) {
  if (value === null || value == undefined)
    return

  var tr = document.createElement("tr")
  var th = document.createElement("th")
  th.textContent = label
  tr.appendChild(th)

  var td = document.createElement("td")

  if (typeof value == "function")
    value(td)
  else
    td.appendChild(document.createTextNode(value))

  tr.appendChild(td)

  el.appendChild(tr)

  return td
}

function showBar(className, v) {
  var span = document.createElement("span")
  span.classList.add("bar")
  span.classList.add(className)

  var bar = document.createElement("span")
  bar.style.width = (v * 100) + "%"
  span.appendChild(bar)

  var label = document.createElement("label")
  label.textContent = (Math.round(v * 100)) + " %"
  span.appendChild(label)

  return span
}

function showLinkinfo(config, infobox, gotoAnything, d) {
  var el = infobox.create()

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

function gotoBuilder(config, infobox, nodes, links) {
  var markers = {}
  var self = this

  function gotoNode(d, showMap, push) {
    showMap = trueDefault(showMap)
    push = trueDefault(push)

    if (showMap && d.nodeinfo.node_id in markers)
      markers[d.nodeinfo.node_id]()

    nodes(config, infobox, self, d)

    if (push)
      pushHistory( { node: d })

    return false
  }

  function gotoLink(d, showMap, push) {
    showMap = trueDefault(showMap)
    push = trueDefault(push)

    if (showMap && linkId(d) in markers)
      markers[linkId(d)]()

    links(config, infobox, self, d)

    if (push)
      pushHistory( { link: d })

    return false
  }

  function addMarkers(d) {
    markers = d
  }

  this.node = function (d, m, p) { return function () { return gotoNode(d, m, p) }}
  this.link = function (d, m, p) { return function () { return gotoLink(d, m, p) }}
  this.addMarkers = function (d) {
                      markers = d
                    }

  return this
}
