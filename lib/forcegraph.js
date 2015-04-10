define(["d3"], function (d3) {
   return function (config, linkScale, sidebar, router) {
    var self = this
    var svg, canvas, ctx
    var svgNodes, svgLinks
    var nodesDict, linksDict
    var zoomBehavior
    var force
    var el
    var doAnimation = false
    var intNodes = []
    var intLinks = []
    var highlight
    var highlightedNodes = []
    var highlightedLinks = []

    var LINK_DISTANCE = 70

    function graphDiameter(nodes) {
      return Math.sqrt(nodes.length / Math.PI) * LINK_DISTANCE * 1.41
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

    var draggableNode = d3.behavior.drag()
                          .on("dragstart", dragstart)
                          .on("drag", dragmove)
                          .on("dragend", dragend)

    function animatePanzoom(translate, scale) {
      var translateP = zoomBehavior.translate()
      var scaleP = zoomBehavior.scale()

      if (!doAnimation) {
        zoomBehavior.translate(translate)
        zoomBehavior.scale(scale)
        panzoom()
      } else {
        var start = {x: translateP[0], y: translateP[1], scale: scaleP}
        var end = {x: translate[0], y: translate[1], scale: scale}

        var interpolate = d3.interpolateObject(start, end)
        var duration = 500

        var ease = d3.ease("cubic-in-out")

        d3.timer(function (t) {
          if (t >= duration)
            return true

          var v = interpolate(ease(t / duration))
          zoomBehavior.translate([v.x, v.y])
          zoomBehavior.scale(v.scale)
          panzoom()

          return false
        })
      }
    }

    function panzoom() {
      var translate = zoomBehavior.translate()
      var scale = zoomBehavior.scale()

      panzoomReal(translate, scale)
    }

    function panzoomReal(translate, scale) {
      svg.attr("transform", "translate(" + translate + ") " +
                            "scale(" + scale + ")")

      redraw()
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
      highlightedNodes = []
      highlightedLinks = []

      if (highlight !== undefined)
        if (highlight.type === "node") {
          var n = nodesDict[highlight.o.nodeinfo.node_id]

          if (n) {
            highlightedNodes = [n]

            if (!nopanzoom)
              panzoomTo([n.x, n.y], [n.x, n.y])
          }

          return
        } else if (highlight.type === "link") {
          var l = linksDict[highlight.o.id]

          if (l) {
            highlightedLinks = [l]

            if (!nopanzoom) {
              var x = d3.extent([l.source, l.target], function (d) { return d.x })
              var y = d3.extent([l.source, l.target], function (d) { return d.y })
              panzoomTo([x[0], y[0]], [x[1], y[1]])
            }
          }

          return
        }

      if (!nopanzoom)
        panzoomTo([0, 0], force.size())
    }

    function updateLinks(vis, data) {
      var link = vis.selectAll("line")
                    .data(data, function (d) { return d.o.id })

      link.exit().remove()

      link.enter().append("line")
                  .on("click", function (d) {
                    if (!d3.event.defaultPrevented)
                      router.link(d.o)()
                  })

      return link
    }

    function updateNodes(vis, data) {
      var node = vis.selectAll("circle")
                    .data(data, function(d) { return d.o.id })

      node.exit().remove()

      node.enter().append("circle")
          .attr("r", 12)
          .on("click", function (d) {
            if (!d3.event.defaultPrevented)
              router.node(d.o.node)()
          })
          .call(draggableNode)

      return node
    }

    function drawLabel(d) {
      var sum = d.neighbours.reduce(function (a, b) {
        return [a[0] + b.x, a[1] + b.y]
      }, [0, 0])

      var sumCos = sum[0] - d.x * d.neighbours.length
      var sumSin = sum[1] - d.y * d.neighbours.length

      var angle = Math.PI / 2

      if (d.neighbours.length > 0)
        angle = Math.PI + Math.atan2(sumSin, sumCos)

      var cos = Math.cos(angle)
      var sin = Math.sin(angle)

      var x = d.x + d.labelA * Math.pow(Math.abs(cos), 2 / 5) * Math.sign(cos)
      var y = d.y + d.labelB * Math.pow(Math.abs(sin), 2 / 5) * Math.sign(sin)

      ctx.fillText(d.label, x, y)
    }

    function redraw() {
      var translate = zoomBehavior.translate()
      var scale = zoomBehavior.scale()
      var nodes = intNodes.filter(function (d) { return d.o.node })
      var unknownNodes = intNodes.filter(function (d) { return !d.o.node })
      var links = intLinks
      ctx.save()
      ctx.font = "11px Roboto"
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.translate(translate[0], translate[1])
      ctx.scale(scale, scale)

      if (highlightedLinks.length) {
        ctx.save()
        ctx.lineWidth = 16
        ctx.strokeStyle = "#FFD486"

        highlightedLinks.forEach(function (d) {
          ctx.beginPath()
          ctx.moveTo(d.source.x, d.source.y)
          ctx.lineTo(d.target.x, d.target.y)
          ctx.stroke()
        })

        ctx.restore()
      }

      ctx.lineWidth = 2.5

      links.forEach(function (d) {
        ctx.beginPath()
        ctx.moveTo(d.source.x, d.source.y)
        ctx.lineTo(d.target.x, d.target.y)
        ctx.strokeStyle = d.color
        ctx.stroke()
      })

      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"

      intNodes.forEach(drawLabel)

      ctx.beginPath()
      unknownNodes.forEach(function (d) {
        ctx.moveTo(d.x + 8, d.y)
        ctx.arc(d.x, d.y, 8, 0, 2 * Math.PI)
      })

      ctx.strokeStyle = "#d00000"
      ctx.fillStyle = "#ffffff"

      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      nodes.forEach(function (d) {
        ctx.moveTo(d.x + 8, d.y)
        ctx.arc(d.x, d.y, 8, 0, 2 * Math.PI)
      })

      ctx.strokeStyle = "#AEC7E8"
      ctx.fillStyle = "#ffffff"

      ctx.fill()
      ctx.stroke()

      if (highlightedNodes.length) {
        ctx.save()
        ctx.strokeStyle = "#FFD486"
        ctx.fillStyle = "orange"
        ctx.lineWidth = 6

        highlightedNodes.forEach(function (d) {
          ctx.beginPath()
          ctx.moveTo(d.x + 8, d.y)
          ctx.arc(d.x, d.y, 8, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        })

        ctx.restore()
      }

      ctx.restore()
    }

    function tickEvent() {
      redraw()

      svgLinks.attr("x1", function(d) { return d.source.x })
              .attr("y1", function(d) { return d.source.y })
              .attr("x2", function(d) { return d.target.x })
              .attr("y2", function(d) { return d.target.y })

      svgNodes.attr("cx", function (d) { return d.x })
              .attr("cy", function (d) { return d.y })
    }

    function resizeCanvas() {
      canvas.width = el.offsetWidth
      canvas.height = el.offsetHeight
      redraw()
    }

    el = document.createElement("div")
    el.classList.add("graph")
    self.div = el

    zoomBehavior = d3.behavior.zoom()
                     .scaleExtent([1 / 3, 3])
                     .on("zoom", panzoom)
                     .translate([sidebar.getWidth(), 0])

    canvas = d3.select(el).append("canvas").node()

    svg = d3.select(el).append("svg")
            .attr("pointer-events", "all")
            .call(zoomBehavior)
            .append("g")

    var visLinks = svg.append("g")
    var visNodes = svg.append("g")

    ctx = canvas.getContext("2d")

    force = d3.layout.force()
              .charge(-80)
              .gravity(0.01)
              .chargeDistance(8 * LINK_DISTANCE)
              .linkDistance(LINK_DISTANCE)
              .linkStrength(function (d) {
                return Math.max(0.5, 1 / d.o.tq)
              })
              .on("tick", tickEvent)
              .on("end", savePositions)

    window.addEventListener("resize", resizeCanvas)

    panzoom()

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
        e.color = linkScale(d.tq).hex()

        return e
      })

      linksDict = {}
      nodesDict = {}

      intNodes.forEach(function (d) {
        d.neighbours = {}

        if (d.o.node)
          nodesDict[d.o.node.nodeinfo.node_id] = d

        d.label = nodeName(d)

        ctx.font = "11px Roboto"
        var offset = 10
        var width = ctx.measureText(d.label).width

        d.labelA = offset + width / 2
        d.labelB = offset + 11 / 2
      })

      intLinks.forEach(function (d) {
        d.source.neighbours[d.target.o.id] = d.target
        d.target.neighbours[d.source.o.id] = d.source

        if (d.o.source.node && d.o.target.node)
          linksDict[d.o.id] = d
      })

      intNodes.forEach(function (d) {
        d.neighbours = Object.keys(d.neighbours).map(function (k) {
          return d.neighbours[k]
        })
      })

      svgLinks = updateLinks(visLinks, intLinks)
      svgNodes = updateNodes(visNodes, intNodes)

      if (localStorageTest()) {
        var save = JSON.parse(localStorage.getItem("graph/nodeposition"))

        if (save) {
          var nodePositions = {}
          save.forEach( function (d) {
            nodePositions[d.id] = d
          })

          intNodes.forEach( function (d) {
            if (nodePositions[d.o.id] && (d.x === undefined || d.y === undefined)) {
              d.x = nodePositions[d.o.id].x
              d.y = nodePositions[d.o.id].y
            }
          })
        }
      }

      var diameter = graphDiameter(intNodes)

      force.nodes(intNodes)
           .links(intLinks)
           .size([diameter, diameter])

      updateHighlight(true)

      force.start()
      resizeCanvas()
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
      canvas.remove()
      force = null
      svg = null
    }

    return self
  }
})