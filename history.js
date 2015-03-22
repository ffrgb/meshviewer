L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion'

document.addEventListener('DOMContentLoaded', main)

function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse)
}

function main() {
  getJSON("config.json").then( function (config) {
    moment.locale("de")

    var options = { worldCopyJump: true,
                    zoomControl: false
                  }

    var map = L.map(document.getElementById("map"), options)

    var sh = document.getElementById("sidebarhandle")
    sh.onclick = function () {
      var sb = document.getElementById("sidebar")

      if (sb.classList.contains("hidden"))
        sb.classList.remove("hidden")
      else
        sb.classList.add("hidden")
    }

    var urls = [ config.dataPath + 'nodes.json',
                 config.dataPath + 'graph.json'
               ]

    var p = Promise.all(urls.map(getJSON))
    p.then(handle_data(config, map))
  })
}

function sort(key, d) {
  return d.slice().sort( function (a, b) {
    return a[key] - b[key]
  }).reverse()
}

function limit(key, m, d) {
  return d.filter( function (d) {
    return d[key].isAfter(m)
  })
}

function offline(d) {
  return !d.flags.online
}

function online(d) {
  return d.flags.online
}

function has_location(d) {
  return "location" in d.nodeinfo
}

function subtract(a, b) {
  var ids = {}

  b.forEach( function (d) {
    ids[d.nodeinfo.node_id] = true
  })

  return a.filter( function (d) {
    return !(d.nodeinfo.node_id in ids)
  })
}

function handle_data(config, map) {
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

    var age = moment().subtract(14, 'days')

    var newnodes = limit("firstseen", age, sort("firstseen", nodes).filter(online))
    var lostnodes = limit("lastseen", age, sort("lastseen", nodes).filter(offline))

    var onlinenodes = subtract(nodes.filter(online).filter(has_location), newnodes)

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

    var gotoAnything = new gotoBuilder(config, showNodeinfo, showLinkinfo)

    var markers = mkmap(map, newnodes, lostnodes, onlinenodes, links, gotoAnything)

    gotoAnything.addMarkers(markers)

    addToList(document.getElementById("newnodes"), config.showContact, "firstseen", gotoAnything.node, newnodes)
    addToList(document.getElementById("lostnodes"), config.showContact, "lastseen", gotoAnything.node, lostnodes)
    addToLinksList(document.getElementById("links"), gotoAnything.link, links)

    showMeshstats(document.getElementById("meshstats"), nodes)

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

function showDistance(d) {
  if (isNaN(d.distance))
    return

  return (new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0}).format(d.distance)) + " m"
}

function showTq(d) {
  var opts = { maximumFractionDigits: 0 }

  return (new Intl.NumberFormat("de-DE", opts).format(100/d.tq)) + "%"
}

function linkId(d) {
  var ids = [d.source.node.nodeinfo.node_id, d.target.node.nodeinfo.node_id]

  return ids.sort().join("-")
}

function mkmap(map, newnodes, lostnodes, onlinenodes, graph, gotoAnything) {
  L.control.zoom({ position: "topright" }).addTo(map)

  L.tileLayer("https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: "1234",
    type: "osm",
    attribution: "Map data Tiles &copy; <a href=\"https://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"https://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
    maxZoom: 18
  }).addTo(map)

  var markersDict = addLinksToMap(map, graph, gotoAnything)

  var nodes = newnodes.concat(lostnodes).filter(has_location)

  var markers = nodes.map( function (d) {
    var icon = L.AwesomeMarkers.icon({ markerColor: d.flags.online ? "green" : "red",
                                       icon: d.flags.online ? "lightbulb" : "bug" })

    var opt = { icon: icon,
                title: d.nodeinfo.hostname
              }

    var m = L.marker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], opt)

    m.on('click', gotoAnything.node(d, false))
    m.bindPopup(d.nodeinfo.hostname)

    markersDict[d.nodeinfo.node_id] = m

    return m
  })

  var onlinemarkers = onlinenodes.map( function (d) {
    var opt = { color: "#1566A9",
                fillColor: "#1566A9",
                radius: 5,
                opacity: 0.7,
                fillOpacity: 0.5
              }

    var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], opt)

    m.on('click', gotoAnything.node(d, false))
    m.bindPopup(d.nodeinfo.hostname)

    markersDict[d.nodeinfo.node_id] = m

    return m
  })

  var group = L.featureGroup(markers).addTo(map)
  var group_online = L.featureGroup(onlinemarkers).addTo(map)

  var bounds = group.getBounds()

  if (!bounds.isValid())
    bounds = group_online.getBounds()

  if (bounds.isValid())
    map.fitBounds(bounds, {paddingTopLeft: [getSidebarWidth(), 0]})

  var funcDict = {}

  Object.keys(markersDict).map( function(k) {
       funcDict[k] = function (d) {
         var m = markersDict[k]
         var bounds
         if ("getBounds" in m) {
           bounds = m.getBounds()
         } else {
           bounds = L.latLngBounds([m.getLatLng()])
         }

         map.fitBounds(bounds, {paddingTopLeft: [getSidebarWidth(), 0]})
         m.openPopup(bounds.getCenter())
       }
  });

  return funcDict
}

function getSidebarWidth() {
  var small = window.matchMedia("(max-width: 60em)");
  var sb = document.getElementById("sidebar")
  return small.matches ? 0 : sb.offsetWidth
}

function addLinksToMap(map, graph, gotoAnything) {
  var markersDict = {}

  var scale = chroma.scale(chroma.interpolate.bezier(['green', 'yellow', 'red'])).domain([1, 5])

  graph = graph.filter( function (d) {
    return "distance" in d
  })

  var lines = graph.map( function (d) {
    var opts = { color: scale(d.tq).hex(),
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

function addToLinksList(el, gotoProxy, links) {
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

  el.appendChild(thead)

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
    row.appendChild(td2)

    var td3 = document.createElement("td")
    td3.textContent = showDistance(d)
    td3.setAttribute("data-sort", d.distance !== undefined ? -d.distance : 1)
    row.appendChild(td3)

    tbody.appendChild(row)
  })

  el.appendChild(tbody)

  new Tablesort(el)
}

function addToList(el, showContact, tf, gotoProxy, list) {
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
    el.appendChild(row)
  })
}

function sum(a) {
  return a.reduce( function (a, b) {
    return a + b
  }, 0)
}

function one() {
  return 1
}

function showMeshstats(el, nodes) {
  var totalNodes = sum(nodes.filter(online).map(one))

  var totalClients = sum(nodes.filter(online).map( function (d) {
    return d.statistics.clients
  }))

  var totalGateways = sum(nodes.filter(online).filter( function (d) {
    return d.flags.gateway
  }).map(one))

  el.textContent = totalNodes + " Knoten (online), " +
                   totalClients + " Clients, " +
                   totalGateways + " Gateways"
}

function infobox() {
  function close() {
    destroy()
    pushHistory()
  }

  function destroy() {
    el.classList.add("hidden")
    while (el.hasChildNodes())
      el.removeChild(el.childNodes[0])
  }

  var el = document.getElementById("infobox")

  destroy()
  el.classList.remove("hidden")
  el.scrollIntoView(false)

  el.close = close
  el.destroy = destroy

  var closeButton = document.createElement("button")
  closeButton.classList.add("close")
  closeButton.onclick = close
  el.appendChild(closeButton)

  return el
}

function showNodeinfo(config, gotoAnything, d) {
  var el = infobox()
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

function showLinkinfo(config, gotoAnything, d) {
  var el = infobox()

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

function trueDefault(d) {
  return d === undefined ? true : d
}

function gotoBuilder(config, nodes, links) {
  var markers = {}
  var self = this

  function gotoNode(d, showMap, push) {
    showMap = trueDefault(showMap)
    push = trueDefault(push)

    if (showMap && d.nodeinfo.node_id in markers)
      markers[d.nodeinfo.node_id]()

    nodes(config, self, d)

    if (push)
      pushHistory( { node: d })

    return false
  }

  function gotoLink(d, showMap, push) {
    showMap = trueDefault(showMap)
    push = trueDefault(push)

    if (showMap && linkId(d) in markers)
      markers[linkId(d)]()

    links(config, self, d)

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

function dictGet(dict, key) {
  var k = key.shift()

  if (!(k in dict))
    return null

  if (key.length == 0)
    return dict[k]

  return dictGet(dict[k], key)
}
