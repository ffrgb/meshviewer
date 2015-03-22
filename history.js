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
      if (d.node_id in graphnodes && "location" in graphnodes[d.node_id].nodeinfo)
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

    graph = graph.links.filter( function (d) {
      var ok = d.source !== undefined && d.target !== undefined
      return ok
    })

    graph.forEach( function (d) {
      d.latlngs = []
      d.latlngs.push(L.latLng(d.source.node.nodeinfo.location.latitude, d.source.node.nodeinfo.location.longitude))
      d.latlngs.push(L.latLng(d.target.node.nodeinfo.location.latitude, d.target.node.nodeinfo.location.longitude))

      d.distance = d.latlngs[0].distanceTo(d.latlngs[1])
    })

    longlinks = graph.slice().sort( function (a, b) {
      return a.distance - b.distance
    }).reverse().slice(0, Math.ceil(config.longLinkPercentile * graph.length))


    var gotoAnything = gotoBuilder(config, showNodeinfo, showLinkinfo)

    var markers = mkmap(map, newnodes, lostnodes, onlinenodes, graph, gotoAnything)

    gotoAnything.addMarkers(markers)

    addToList(document.getElementById("newnodes"), config.showContact, "firstseen", gotoAnything.node, newnodes)
    addToList(document.getElementById("lostnodes"), config.showContact, "lastseen", gotoAnything.node, lostnodes)
    addToLongLinksList(document.getElementById("longlinks"), gotoAnything.link, longlinks)

    showMeshstats(document.getElementById("meshstats"), nodes)
  }
}

function showDistance(d) {
  return (new Intl.NumberFormat("de-DE", {maximumFractionDigits: 0}).format(d.distance)) + " m"
}

function showTq(d) {
  var opts = { maximumFractionDigits: 2,
               minimumFractionDigits: 2
             }

  return (new Intl.NumberFormat("de-DE", opts).format(d.tq)) + " TQ"
}

function linkId(d) {
  return d.source.node.nodeinfo.node_id + "-" + d.target.node.nodeinfo.node_id
}

function mkmap(map, newnodes, lostnodes, onlinenodes, graph, gotoAnything) {
  L.control.zoom({ position: "topright" }).addTo(map)

  L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: "1234",
    type: "osm",
    attribution: "Map data Tiles &copy; <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
    maxZoom: 18
  }).addTo(map)

  var markersDict = addLinksToMap(map, graph, gotoAnything)

  var nodes = newnodes.concat(lostnodes).filter( function (d) {
    return "location" in d.nodeinfo
  })

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
    var opt = { color: "#76B22D",
                fillColor: "#76B22D",
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

  var scale = chroma.scale(['green', 'orange', 'red']).domain([1, 10])

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

function addToLongLinksList(el, gotoProxy, links) {
  links.forEach( function (d) {
    var row = document.createElement("tr")
    var td1 = document.createElement("td")
    var a = document.createElement("a")
    a.textContent = d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname
    a.href = "#"
    a.onclick = gotoProxy(d)
    td1.appendChild(a)
    row.appendChild(td1)

    var td2 = document.createElement("td")
    td2.textContent = showTq(d)
    row.appendChild(td2)

    var td3 = document.createElement("td")
    td3.textContent = showDistance(d)
    row.appendChild(td3)

    el.appendChild(row)
  })
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

    if ("location" in d.nodeinfo) {
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

function showNodeinfo(config, d) {
  var el = document.getElementById("nodeinfo")

  destroy()
  el.classList.remove("hidden")
  el.scrollIntoView(false)

  var closeButton = document.createElement("button")
  closeButton.classList.add("close")
  closeButton.onclick = destroy
  el.appendChild(closeButton)

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
  attributeEntry(attributes, "In der Karte", "location" in d.nodeinfo ? "ja" : "nein")

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


  function destroy() {
    el.classList.add("hidden")
    while (el.hasChildNodes())
      el.removeChild(el.childNodes[0])
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

function showLinkinfo(config, d) {
  console.log(d)
}

function gotoBuilder(config, nodes, links) {
  var markers = {}

  function gotoNode(d, showMap) {
    showMap = showMap === undefined ? true : false

    if (showMap && d.nodeinfo.node_id in markers)
      markers[d.nodeinfo.node_id]()

    nodes(config, d)

    return false
  }

  function gotoLink(d, showMap) {
    showMap = showMap === undefined ? true : false

    if (showMap && linkId(d) in markers)
      markers[linkId(d)]()

    links(config, d)

    return false
  }

  function addMarkers(d) {
    markers = d
  }

  return { node: function (d, m) { return function () { return gotoNode(d, m) }},
           link: function (d, m) { return function () { return gotoLink(d, m) }},
           addMarkers: addMarkers
         }
}

function dictGet(dict, key) {
  var k = key.shift()

  if (!(k in dict))
    return null

  if (key.length == 0)
    return dict[k]

  return dictGet(dict[k], key)
}
