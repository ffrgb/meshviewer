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

      map.invalidateSize()
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
      node.firstseen = moment(node.firstseen)
      node.lastseen = moment(node.lastseen)
    })

    var age = moment().subtract(14, 'days')

    var newnodes = limit("firstseen", age, sort("firstseen", nodes).filter(online))
    var lostnodes = limit("lastseen", age, sort("lastseen", nodes).filter(offline))

    var onlinenodes = subtract(nodes.filter(online).filter(has_location), newnodes)

    addToList(document.getElementById("newnodes"), config.showContact, "firstseen", newnodes)
    addToList(document.getElementById("lostnodes"), config.showContact, "lastseen", lostnodes)

    var graph = data[1].batadv
    var nodes = data[0].nodes

    graph.nodes.forEach( function (d) {
      if (d.node_id in nodes && "location" in nodes[d.node_id].nodeinfo)
        d.node = nodes[d.node_id]
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

    addToLongLinksList(document.getElementById("longlinks"), longlinks)

    mkmap(map, newnodes, lostnodes, onlinenodes, graph)
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

function mkmap(map, newnodes, lostnodes, onlinenodes, graph) {
  L.control.zoom({ position: "topright" }).addTo(map)

  L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: "1234",
    type: "osm",
    attribution: "Map data Tiles &copy; <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
    maxZoom: 18
  }).addTo(map)

  addLinksToMap(map, graph)

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
    
    m.bindPopup(d.nodeinfo.hostname)

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

    m.bindPopup(d.nodeinfo.hostname)

    return m
  })

  var group = L.featureGroup(markers).addTo(map)
  var group_online = L.featureGroup(onlinemarkers).addTo(map)

  map.fitBounds(group.getBounds())
}

function addLinksToMap(map, graph) {
  var scale = chroma.scale(['green', 'orange', 'red']).domain([1, 10])

  var lines = graph.map( function (d) {
    var opts = { color: scale(d.tq).hex(),
                 weight: 4
               }

    var line = L.polyline(d.latlngs, opts)

    line.bindPopup(d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname + "<br><strong>" + showDistance(d) + "</strong>")

    return line
  })

  var group = L.featureGroup(lines).addTo(map)
}

function addToLongLinksList(el, links) {
  links.forEach( function (d) {
    var row = document.createElement("tr")
    var td1 = document.createElement("td")
    td1.textContent = d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname
    row.appendChild(td1)

    var td2 = document.createElement("td")
    td2.textContent = showDistance(d)
    row.appendChild(td2)

    var td3 = document.createElement("td")
    td3.textContent = showTq(d)
    row.appendChild(td3)

    el.appendChild(row)
  })
}

function addToList(el, showContact, tf, list) {
  list.forEach( function (d) {
    var time = moment(d[tf]).fromNow()

    var row = document.createElement("tr")
    var td1 = document.createElement("td")
    var span = document.createElement("span")
    span.classList.add("hostname")
    span.classList.add(d.flags.online ? "online" : "offline")
    span.textContent = d.nodeinfo.hostname
    td1.appendChild(span)

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
