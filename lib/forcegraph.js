define(["d3"], function (d3) {
   return function (config, linkScale, sidebar, router) {
    var self = this
    var svg, vis, link, node
    var nodesDict, linksDict
    var zoomBehavior
    var force
    var el
    var doAnimation = false
    var intNodes = []
    var intLinks = []
    var highlight

    var LINK_DISTANCE = 70

    function graphDiameter(nodes) {
      return Math.sqrt(nodes.length / Math.PI) * LINK_DISTANCE
    }

    function savePositions() {
      if (!localStorageTest())
        return

      var save = intNodes.map( function (d) {
        return { id: d.o.id, x: d.x, y: d.y }
      })

      localStorage.setItem("graph/nodeposition", JSON.stringify(save))
    }

    function nodeName(d) {
      if (d.o.node && d.o.node.nodeinfo)
        return d.o.node.nodeinfo.hostname
      else
        return d.o.id
    }

    function dragstart(d) {
      d3.event.sourceEvent.stopPropagation()
      d.fixed |= 2
    }

    function dragmove(d) {
      d.px = d3.event.x
      d.py = d3.event.y
      force.resume()
    }

    function dragend(d) {
      d3.event.sourceEvent.stopPropagation()
      d.fixed &= 1
    }

    function animatePanzoom(translate, scale) {
      zoomBehavior.scale(scale)
      zoomBehavior.translate(translate)

      var el = vis

      if (doAnimation)
        el = el.transition().duration(500)

      el.attr("transform", "translate(" + translate + ") " +
                           "scale(" + scale + ")")
    }

    function panzoom() {
      var translate = zoomBehavior.translate()
      var scale = zoomBehavior.scale()
      vis.attr("transform", "translate(" + translate + ") " +
                            "scale(" + scale + ")")
    }

    function getSize() {
      var sidebarWidth = sidebar.getWidth()
      var width = el.offsetWidth - sidebarWidth
      var height = el.offsetHeight

      return [width, height]
    }

    function panzoomTo(a, b) {
      var sidebarWidth = sidebar.getWidth()
      var size = getSize()

      var targetWidth = Math.max(1, b[0] - a[0])
      var targetHeight = Math.max(1, b[1] - a[1])

      var scaleX = size[0] / targetWidth
      var scaleY = size[1] / targetHeight
      var scaleMax = zoomBehavior.scaleExtent()[1]
      var scale = 0.5 * Math.min(scaleMax, Math.min(scaleX, scaleY))

      var centroid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      var x = -centroid[0] * scale + size[0] / 2
      var y = -centroid[1] * scale + size[1] / 2
      var translate = [x + sidebarWidth, y]

      animatePanzoom(translate, scale)
    }

    function updateHighlight(nopanzoom) {
      if (highlight !== undefined)
        if (highlight.type === "node") {
          var n = nodesDict[highlight.o.nodeinfo.node_id]

          if (n) {
            link.classed("highlight", false)
            node.classed("highlight", function (e) {
              return e.o.node === n.o.node && n.o.node !== undefined
            })

            if (!nopanzoom)
              panzoomTo([n.x, n.y], [n.x, n.y])
          }

          return
        } else if (highlight.type === "link") {
          var l = linksDict[highlight.o.id]

          if (l) {
            node.classed("highlight", false)
            link.classed("highlight", function (e) {
              return e.o === l.o && l.o !== undefined
            })

            if (!nopanzoom) {
              var x = d3.extent([l.source, l.target], function (d) { return d.x })
              var y = d3.extent([l.source, l.target], function (d) { return d.y })
              panzoomTo([x[0], y[0]], [x[1], y[1]])
            }
          }

          return
        }

      node.classed("highlight", false)
      link.classed("highlight", false)

      if (!nopanzoom)
        panzoomTo([0, 0], force.size())
    }

    function tickEvent() {
      link.selectAll("line")
          .attr("x1", function(d) { return d.source.x })
          .attr("y1", function(d) { return d.source.y })
          .attr("x2", function(d) { return d.target.x })
          .attr("y2", function(d) { return d.target.y })

      node
         .attr("cx", function(d) { return d.x })
         .attr("cy", function(d) { return d.y })
    }

    el = document.createElement("div")
    el.classList.add("graph")
    self.div = el

    zoomBehavior = d3.behavior.zoom()
                     .scaleExtent([1 / 3, 3])
                     .on("zoom", panzoom)
                     .translate([sidebar.getWidth(), 0])

    svg = d3.select(el).append("svg")
            .attr("pointer-events", "all")
            .call(zoomBehavior)

    vis = svg.append("g")

    vis.append("g").attr("class", "links")
    vis.append("g").attr("class", "nodes")

    force = d3.layout.force()
              .charge(-70)
              .gravity(0.05)
              .linkDistance(LINK_DISTANCE)
              .linkStrength(function (d) {
                return 1 / d.o.tq
              })
              .on("tick", tickEvent)
              .on("end", savePositions)

    panzoom()

    var draggableNode = d3.behavior.drag()
                          .on("dragstart", dragstart)
                          .on("drag", dragmove)
                          .on("dragend", dragend)

    self.setData = function (data) {
      var oldNodes = {}

      intNodes.forEach( function (d) {
        oldNodes[d.o.id] = d
      })

      intNodes = data.graph.nodes.map( function (d) {
        var e
        if (d.id in oldNodes)
          e = oldNodes[d.id]
        else
          e = {}

        e.o = d

        return e
      })

      var newNodesDict = {}

      intNodes.forEach( function (d) {
        newNodesDict[d.o.id] = d
      })

      var oldLinks = {}

      intLinks.forEach( function (d) {
        oldLinks[d.o.id] = d
      })

      intLinks = data.graph.links.filter( function (d) {
        return !d.vpn
      }).map( function (d) {
        var e
        if (d.id in oldLinks)
          e = oldLinks[d.id]
        else
          e = {}

        e.o = d
        e.source = newNodesDict[d.source.id]
        e.target = newNodesDict[d.target.id]

        return e
      })

      link = vis.select("g.links")
                .selectAll("g.link")
                .data(intLinks, function (d) { return d.o.id })

      link.exit().remove()

      var linkEnter = link.enter().append("g")
                          .attr("class", "link")
                          .on("click", function (d) {
                            if (!d3.event.defaultPrevented)
                              router.link(d.o)()
                          })

      linkEnter.append("line")
               .append("title")

      link.selectAll("line")
          .style("stroke", function (d) { return linkScale(d.o.tq).hex() })

      link.selectAll("title").text(function (d) { return showTq(d.o) })

      linksDict = {}

      link.each( function (d) {
        if (d.o.source.node && d.o.target.node)
          linksDict[d.o.id] = d
      })

      node = vis.select("g.nodes")
                .selectAll(".node")
                .data(intNodes, function(d) { return d.o.id })

      node.exit().remove()

      var nodeEnter = node.enter().append("circle")
                          .attr("r", 8)
                          .on("click", function (d) {
                            if (!d3.event.defaultPrevented)
                              router.node(d.o.node)()
                          })
                          .call(draggableNode)

      node.attr("class", function (d) {
        var s = ["node"]
        if (!d.o.node)
          s.push("unknown")

        return s.join(" ")
      })

      nodesDict = {}

      node.each( function (d) {
        if (d.o.node)
          nodesDict[d.o.node.nodeinfo.node_id] = d
      })

      nodeEnter.append("title")

      if (localStorageTest()) {
        var save = JSON.parse(localStorage.getItem("graph/nodeposition"))

        if (save) {
          var nodePositions = {}
          save.forEach( function (d) {
            nodePositions[d.id] = d
          })

          nodeEnter.each( function (d) {
            if (nodePositions[d.o.id]) {
              d.x = nodePositions[d.o.id].x
              d.y = nodePositions[d.o.id].y
            }
          })
        }
      }

      node.selectAll("title").text(nodeName)

      var diameter = graphDiameter(intNodes)

      force.nodes(intNodes)
           .links(intLinks)
           .size([diameter, diameter])

      updateHighlight(true)

      if (node.enter().size() + link.enter().size() > 0)
        force.start()
    }

    self.resetView = function () {
      highlight = undefined
      updateHighlight()
      doAnimation = true
    }

    self.gotoNode = function (d) {
      highlight = {type: "node", o: d}
      updateHighlight()
      doAnimation = true
    }

    self.gotoLink = function (d) {
      highlight = {type: "link", o: d}
      updateHighlight()
      doAnimation = true
    }

    self.destroy = function () {
      force.stop()
      node.remove()
      link.remove()
      svg.remove()
      force = null
      svg = null
      vis = null
      link = null
      node = null
    }

    return self
  }
})
