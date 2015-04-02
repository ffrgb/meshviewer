define(["d3", "leaflet", "moment", "leaflet.label"], function (d3, L, moment) {
  var options = { worldCopyJump: true,
                  zoomControl: false
                }
   function mkMarker(dict, iconFunc, router) {
     return function (d) {
       var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], iconFunc(d))

       m.resetStyle = function () {
         m.setStyle(iconFunc(d))
       }

       m.on("click", router.node(d))
       m.bindLabel(d.nodeinfo.hostname)

       dict[d.nodeinfo.node_id] = m

       return m
     }
   }

   function addLinksToMap(dict, linkScale, graph, router) {
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
       line.on("click", router.link(d))

       dict[d.id] = line

       return line
     })

     return lines
   }

   var iconOnline  = { color: "#1566A9", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first" }
   var iconOffline = { color: "#D43E2A", radius: 3, fillOpacity: 0.5, weight: 1, className: "stroke-first" }
   var iconLost    = { color: "#D43E2A", radius: 6, fillOpacity: 0.5, weight: 1, className: "stroke-first" }
   var iconAlert   = { color: "#D43E2A", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first node-alert" }
   var iconNew     = { color: "#558020", radius: 6, fillOpacity: 0.5, weight: 2, className: "stroke-first" }

   return function (config, linkScale, sidebar, router) {
    var self = this
    var barycenter
    var groupOnline, groupOffline, groupNew, groupLost, groupLines

    var el = document.createElement("div")
    el.classList.add("map")
    self.div = el

    var map = L.map(el, options)

    L.tileLayer("https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
      subdomains: "1234",
      type: "osm",
      attribution: "Tiles &copy; <a href=\"https://www.mapquest.com/\" target=\"_blank\">MapQuest</a>, Data CC-BY-SA OpenStreetMap",
      maxZoom: 18
    }).addTo(map)

    var nodeDict = {}
    var linkDict = {}

    function calcBarycenter(nodes) {
      nodes = nodes.map(function (d) { return d.nodeinfo.location })
      var lats = nodes.map(function (d) { return d.latitude })
      var lngs = nodes.map(function (d) { return d.longitude })

      var barycenter = L.latLng(d3.median(lats), d3.median(lngs))
      var barycenterDev = [d3.deviation(lats), d3.deviation(lngs)]

      var barycenterCircle = L.latLng(barycenter.lat + barycenterDev[0],
                                      barycenter.lng + barycenterDev[1])

      var r = barycenter.distanceTo(barycenterCircle)

      return L.circle(barycenter, r * config.mapSigmaScale)
    }

    self.setData = function (data) {
      nodeDict = {}
      linkDict = {}

      if (groupOffline)
        groupOffline.clearLayers()

      if (groupOnline)
        groupOnline.clearLayers()

      if (groupNew)
        groupNew.clearLayers()

      if (groupLost)
        groupLost.clearLayers()

      if (groupLines)
        groupLines.clearLayers()

      var lines = addLinksToMap(linkDict, linkScale, data.graph.links, router)
      groupLines = L.featureGroup(lines).addTo(map)

      barycenter = calcBarycenter(data.nodes.all.filter(has_location))

      var nodesOnline = subtract(data.nodes.all.filter(online), data.nodes.new)
      var nodesOffline = subtract(data.nodes.all.filter(offline), data.nodes.lost)

      var markersOnline = nodesOnline.filter(has_location)
        .map(mkMarker(nodeDict, function () { return iconOnline }, router))

      var markersOffline = nodesOffline.filter(has_location)
        .map(mkMarker(nodeDict, function () { return iconOffline }, router))

      var markersNew = data.nodes.new.filter(has_location)
        .map(mkMarker(nodeDict, function () { return iconNew }, router))

      var markersLost = data.nodes.lost.filter(has_location)
        .map(mkMarker(nodeDict, function (d) {
          if (d.lastseen.isAfter(moment(data.now).subtract(3, "days")))
            return iconAlert

          return iconLost
        }, router))

      L.featureGroup(markersOffline).addTo(map)
      L.featureGroup(markersOnline).addTo(map)
      L.featureGroup(markersNew).addTo(map)
      L.featureGroup(markersLost).addTo(map)
    }

    function resetMarkerStyles(nodes, links) {
      Object.keys(nodes).forEach( function (d) {
        nodes[d].resetStyle()
      })

      Object.keys(links).forEach( function (d) {
        links[d].resetStyle()
      })
    }

    function setView(bounds) {
      map.fitBounds(bounds, {paddingTopLeft: [sidebar.getWidth(), 0]})
    }

    function resetView() {
      resetMarkerStyles(nodeDict, linkDict)

      setView(barycenter.getBounds())
    }

    function goto(dict, id) {
      var m = dict[id]
      if (m === undefined)
        return undefined

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

      var m = goto(linkDict, d.id)

      if (m)
        m.setStyle({ weight: 7, opacity: 1, dashArray: "10, 10" })
      else
        resetView()
    }

    self.destroy = function () {
      map.remove()
    }

    return self
  }
})
