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


  var urls = [ 'https://map.luebeck.freifunk.net/data/nodes.json',
               'https://map.luebeck.freifunk.net/data/graph.json'
             ]

  var p = Promise.all(urls.map(getJSON))
  p.then(handle_data(map))
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

function handle_data(map) {
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

    addToList(document.getElementById("newnodes"), "firstseen", newnodes)
    addToList(document.getElementById("lostnodes"), "lastseen", lostnodes)

    mkmap(map, newnodes, lostnodes, onlinenodes)
  }
}

function mkmap(map, newnodes, lostnodes, onlinenodes) {
  L.control.zoom({ position: "topright" }).addTo(map)

  L.tileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: "1234",
    type: "osm",
    attribution: "Map data Tiles &copy; <a href=\"http://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"http://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
    maxZoom: 18
  }).addTo(map)

  var nodes = newnodes.concat(lostnodes).filter( function (d) {
    return "location" in d.nodeinfo
  })

  var markers = nodes.map( function (d) {
    var icon = L.MakiMarkers.icon({ color: d.flags.online ? "#0A905D" : "#E42426" })

    var opt = { icon: icon }

    var m = L.marker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], opt)
    
    m.bindPopup(d.nodeinfo.hostname)

    return m
  })

  var onlinemarkers = onlinenodes.map( function (d) {
    var opt = { color: "#0A905D",
                fillColor: "#0A905D",
                radius: 5
              }

    var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], opt)

    m.bindPopup(d.nodeinfo.hostname)

    return m
  })

  var group = L.featureGroup(markers).addTo(map)
  var group_online = L.featureGroup(onlinemarkers).addTo(map)

  map.fitBounds(group.getBounds())
}

function addToList(el, tf, list) {
  list.forEach( function (d) {
    var time = moment(d[tf]).fromNow()

    var row = document.createElement("tr")
    var td1 = document.createElement("td")
    var span = document.createElement("span")
    span.classList.add("hostname")
    span.classList.add(d.flags.online ? "online" : "offline")
    span.textContent = d.nodeinfo.hostname
    td1.appendChild(span)

    if ("owner" in d.nodeinfo) {
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
