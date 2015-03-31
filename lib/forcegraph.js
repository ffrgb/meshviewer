define(["d3"], function (d3) {
   return function (linkScale, sidebar, router) {
    var self = this
    var nodes, links
    var svg, vis, link, node, label
    var nodesDict, linksDict
    var zoomBehavior
    var force
    var el
    var doAnimation = false

    var LINK_DISTANCE = 70

    function nodeName(d) {
      if (d.node && d.node.nodeinfo)
        return d.node.nodeinfo.hostname
      else
        return d.id
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

    function panzoomTo(a, b) {
      var sidebarWidth = sidebar.getWidth()
      var size = force.size()

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

    function resize() {
      var sidebarWidth = sidebar.getWidth()
      var width = el.offsetWidth - sidebarWidth
      var height = el.offsetHeight

      force.size([width, height])
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

      label.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"
      })
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
    vis.append("g").attr("class", "labels").attr("pointer-events", "none")

    force = d3.layout.force()
              .charge(-70)
              .gravity(0.05)
              .linkDistance(LINK_DISTANCE)
              .on("tick", tickEvent)

    panzoom()

    var draggableNode = d3.behavior.drag()
                          .on("dragstart", dragstart)
                          .on("drag", dragmove)
                          .on("dragend", dragend)

    window.addEventListener("resize", resize)

    self.setData = function (data) {
      links = data.graph.links.filter( function (d) {
        return !d.vpn
      })

      link = vis.select("g.links")
                .selectAll("g.link")
                .data(links, linkId)

      var linkEnter = link.enter().append("g")
                          .attr("class", "link")
                          .on("click", function (d) {
                            if (!d3.event.defaultPrevented)
                              router.link(d)()
                          })

      linkEnter.append("line")
               .append("title")

      link.selectAll("line")
          .style("stroke", function (d) { return linkScale(d.tq) })

      link.selectAll("title").text(showTq)

      linksDict = {}

      link.each( function (d) {
        if (d.source.node && d.target.node)
          linksDict[linkId(d)] = d
      })

      nodes = data.graph.nodes

      node = vis.select("g.nodes")
                .selectAll(".node")
                .data(nodes,
                  function(d) {
                    return d.id
                  }
                )

      var nodeEnter = node.enter().append("circle")
                          .attr("r", 8)
                          .on("click", function (d) {
                            if (!d3.event.defaultPrevented)
                              router.node(d.node)()
                          })
                          .call(draggableNode)

      node.attr("class", function (d) {
        var s = ["node"]
        if (!d.node)
          s.push("unknown")

        return s.join(" ")
      })

      nodesDict = {}

      node.each( function (d) {
        if (d.node)
          nodesDict[d.node.nodeinfo.node_id] = d
      })

      label = vis.select("g.labels")
                    .selectAll("g.label")
                    .data(data.graph.nodes, function (d) {
                      return d.id
                    })

      var labelEnter = label.enter()
                        .append("g")
                        .attr("class", "label")

      labelEnter.append("path").attr("class", "clients")

      labelEnter.append("text")
                .attr("class", "name")
                .attr("text-anchor", "middle")
                .attr("y", "21px")
                .attr("x", "0px")

      label.selectAll("text.name").text(nodeName)

      var labelTextWidth = function (e) {
        return e.parentNode.querySelector("text").getBBox().width + 3
      }

      labelEnter.insert("rect", "text")
                .attr("y", "10px")
                .attr("x", function() { return labelTextWidth(this) / (-2)})
                .attr("width", function() { return labelTextWidth(this)})
                .attr("height", "15px")

      nodeEnter.append("title")

      node.selectAll("title").text(nodeName)


      force.nodes(nodes)
           .links(links)

      resize()

      force.start()
    }

    self.resetView = function () {
      node.classed("highlight", false)
      link.classed("highlight", false)

      var size = force.size()
      var diameter = Math.sqrt(nodes.length / Math.PI) * LINK_DISTANCE
      var x = (size[0] - diameter) / 2
      var y = (size[1] - diameter) / 2
      console.log(x, y)

      panzoomTo([x, y], [x + diameter, y + diameter])

      doAnimation = true
    }

    self.gotoNode = function (d) {
      link.classed("highlight", false)
      node.classed("highlight", function (e) {
        return e.node === d && d !== undefined
      })

      var n = nodesDict[d.nodeinfo.node_id]

      if (n)
        panzoomTo([n.x, n.y], [n.x, n.y])

      doAnimation = true
    }

    self.gotoLink = function (d) {
      node.classed("highlight", false)
      link.classed("highlight", function (e) {
        return e === d && d !== undefined
      })

      var l = linksDict[linkId(d)]

      if (l) {
        var x = d3.extent([l.source, l.target], function (d) { return d.x })
        var y = d3.extent([l.source, l.target], function (d) { return d.y })
        panzoomTo([x[0], y[0]], [x[1], y[1]])
      }

      doAnimation = true
    }

    self.destroy = function () {
      window.removeEventListener("resize", resize)

      force.stop()
      node.remove()
      link.remove()
      svg.remove()
      force = null
      svg = null
      vis = null
      link = null
      node = null
      label = null
    }

    return self
  }
})
