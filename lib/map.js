define(function () {
  var options = { worldCopyJump: true,
                  zoomControl: false
                }
   function mkMarker(dict, iconFunc, gotoAnything) {
     return function (d) {
       var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], iconFunc(d))

       m.resetStyle = function () {
         m.setStyle(iconFunc(d))
       }

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
                    weight: 4,
                    opacity: 0.5,
                    dashArray: "none"
                  }

       var line = L.polyline(d.latlngs, opts)

       line.resetStyle = function () {
         line.setStyle(opts)
       }

       line.bindLabel(d.source.node.nodeinfo.hostname + " – " + d.target.node.nodeinfo.hostname + "<br><strong>" + showDistance(d) + " / " + showTq(d) + "</strong>")
       line.on('click', gotoAnything.link(d, false))

       dict[linkId(d)] = line

       return line
     })

     return lines
   }

   var iconOnline  = { color: "#1566A9", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first" }
   var iconOffline = { color: "#D43E2A", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first" }
   var iconNew     = { color: "#558020", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first" }

   var groupOnline, group

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
      groupOnline = L.featureGroup(onlinemarkers).addTo(map)
      group = L.featureGroup(markers).addTo(map)
      resetView()
    }

    function resetView() {
      resetMarkerStyles(nodeDict, linkDict)

      var bounds = group.getBounds()

      if (!bounds.isValid())
        bounds = groupOnline.getBounds()

      if (bounds.isValid())
        setView(bounds)
    }

    function setView(bounds) {
      map.fitBounds(bounds, {paddingTopLeft: [sidebar.getWidth(), 0]})
    }

    function resetMarkerStyles(nodes, links) {
      Object.keys(nodes).forEach( function (d) {
        nodes[d].resetStyle()
      })

      Object.keys(links).forEach( function (d) {
        links[d].resetStyle()
      })
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

      return m
    }

    self.resetView = resetView

    self.gotoNode = function (d) {
      resetMarkerStyles(nodeDict, linkDict)

      var m = goto(nodeDict, d.nodeinfo.node_id)

      if (m)
        m.setStyle({ fillColor: m.options.color, color: "orange", weight: 20, fillOpacity: 1, opacity: 0.7 })
      else
        resetView()
    }

    self.gotoLink = function (d) {
      resetMarkerStyles(nodeDict, linkDict)

      var m = goto(linkDict, linkId(d))

      if (m)
        m.setStyle({ weight: 7, opacity: 1, dashArray: "10, 10" })
      else
        resetView()
    }

    return self
  }
})
