define(function () {
  var options = { worldCopyJump: true,
                  zoomControl: false
                }
   function mkMarker(dict, iconFunc, gotoAnything) {
     return function (d) {
       var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], iconFunc(d))

       m.on('click', gotoAnything.node(d, false))
       m.bindLabel(d.nodeinfo.hostname)

       dict[d.nodeinfo.node_id] = m

       return m
     }
   }

   function addLinksToMap(dict, linkScale, graph, gotoAnything) {
     graph = graph.filter( function (d) {
       return "distance" in d
     })

     var lines = graph.map( function (d) {
       var opts = { color: linkScale(d.tq).hex(),
                    weight: 4
                  }

       var line = L.polyline(d.latlngs, opts)

       line.bindLabel(d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname + "<br><strong>" + showDistance(d) + " / " + showTq(d) + "</strong>")
       line.on('click', gotoAnything.link(d, false))

       dict[linkId(d)] = line

       return line
     })

     return lines
   }

   var iconOnline  = { color: "#1566A9", radius: 6, fillOpacity: 0.5 }
   var iconOffline = { color: "#D43E2A", radius: 6, fillOpacity: 0.5 }
   var iconNew     = { color: "#558020", radius: 6, fillOpacity: 0.5 }

   return function (sidebar) {
    var self = this

    var el = document.createElement("div")
    el.classList.add("map") 
    self.div = el

    var map = L.map(el, options)

    L.control.zoom({ position: "topright" }).addTo(map)

    L.tileLayer("https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
      subdomains: "1234",
      type: "osm",
      attribution: "Map data Tiles &copy; <a href=\"https://www.mapquest.com/\" target=\"_blank\">MapQuest</a> <img src=\"https://developer.mapquest.com/content/osm/mq_logo.png\" />, Map data © OpenStreetMap contributors, CC-BY-SA",
      maxZoom: 18
    }).addTo(map)

    var nodeDict = {}
    var linkDict = {}

    self.setData = function (linkScale, sidebar, now, newnodes, lostnodes, onlinenodes, links, gotoAnything) {
      nodeDict = {}
      linkDict = {}

      var lines = addLinksToMap(linkDict, linkScale, links, gotoAnything)

      var nodes = newnodes.concat(lostnodes).filter(has_location)

      var markers = nodes.map(mkMarker(nodeDict, function (d) {
        if (d.flags.online)
          return iconNew

        return iconOffline
      }, gotoAnything))

      var onlinemarkers = subtract(onlinenodes.filter(has_location), newnodes)
                          .map(mkMarker(nodeDict, function (d) { return iconOnline }, gotoAnything))

      var groupLines = L.featureGroup(lines).addTo(map)
      var groupOnline = L.featureGroup(onlinemarkers).addTo(map)
      var group = L.featureGroup(markers).addTo(map)

      var bounds = group.getBounds()

      if (!bounds.isValid())
        bounds = groupOnline.getBounds()

      if (bounds.isValid())
        setView(bounds)
    }

    function setView(bounds) {
      map.fitBounds(bounds, {paddingTopLeft: [sidebar.getWidth(), 0]})
    }

    function goto(dict, id) {
      var m = dict[id]
      if (m === undefined)
        return

      var bounds

      if ("getBounds" in m)
        bounds = m.getBounds()
      else
        bounds = L.latLngBounds([m.getLatLng()])

      setView(bounds)
      m.openPopup(bounds.getCenter())
    }

    self.gotoNode = function (d) {
      goto(nodeDict, d.nodeinfo.node_id)
    }

    self.gotoLink = function (d) {
      goto(linkDict, linkId(d))
    }

    return self
  }
})
