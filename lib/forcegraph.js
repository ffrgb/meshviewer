// TODO
// - window size
// - avoid sidebar
// - pan to node
// - pan and zoom to link
define(["d3"], function (d3) {
   return function (linkScale, sidebar, router) {
    var self = this
    var vis, link, node, label
    var nodesDict, linksDict
    var force

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

    function panzoom() {
      vis.attr("transform",
          "translate(" + d3.event.translate + ") "
          + "scale(" + d3.event.scale + ")")
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

    var el = document.createElement("div")
    el.classList.add("graph")
    self.div = el

    vis = d3.select(el).append("svg")
                .attr("pointer-events", "all")
                .call(d3.behavior.zoom().on("zoom", panzoom))
                .append("g")

    vis.append("g").attr("class", "links")
    vis.append("g").attr("class", "nodes")
    vis.append("g").attr("class", "labels").attr("pointer-events", "none")

    force = d3.layout.force()
              .size([500, 500])
              .charge(-100)
              .gravity(0.05)
              .friction(0.73)
              .theta(0.8)
              .linkDistance(70)
              .linkStrength(0.2)
              .on("tick", tickEvent)

    var draggableNode = d3.behavior.drag()
                          .on("dragstart", dragstart)
                          .on("drag", dragmove)
                          .on("dragend", dragend)

    self.setData = function (data) {
      var links = data.graph.links.filter( function (d) {
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
          linksDict[linkId(d)] = this
      })

      var nodes = data.graph.nodes

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
          nodesDict[d.node.nodeinfo.node_id] = this
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
           .alpha(0.1)
           .start()
    }

    self.resetView = function () {
      node.classed("highlight", false)
      link.classed("highlight", false)
    }

    self.gotoNode = function (d) {
      link.classed("highlight", false)
      node.classed("highlight", function (e) {
        return e.node === d && d !== undefined
      })
    }

    self.gotoLink = function (d) {
      node.classed("highlight", false)
      link.classed("highlight", function (e) {
        return e === d && d !== undefined
      })
    }

    return self
  }
})
