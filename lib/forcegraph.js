define(["d3"], function (d3) {
  var margin = 200;
  var NODE_RADIUS = 15;
  var LINE_RADIUS = 12;

  return function (config, linkScale, sidebar, router) {
    var self = this;
    var canvas, ctx, screenRect;
    var nodesDict, linksDict;
    var zoomBehavior;
    var force;
    var el;
    var doAnimation = false;
    var intNodes = [];
    var intLinks = [];
    var highlight;
    var highlightedNodes = [];
    var highlightedLinks = [];
    var nodes = [];
    var uplinkNodes = [];
    var nonUplinkNodes = [];
    var unseenNodes = [];
    var unknownNodes = [];
    var savedPanZoom;

    var draggedNode;

    var LINK_DISTANCE = 70;

    function graphDiameter(nodes) {
      return Math.sqrt(nodes.length / Math.PI) * LINK_DISTANCE * 1.41;
    }

    function savePositions() {
      if (!localStorageTest()) {
        return;
      }

      var save = intNodes.map(function (d) {
        return {id: d.o.id, x: d.x, y: d.y};
      });

      localStorage.setItem("graph/nodeposition", JSON.stringify(save));
    }

    function nodeName(d) {
      if (d.o.node && d.o.node.nodeinfo) {
        return d.o.node.nodeinfo.hostname;
      } else {
        return d.o.id;
      }
    }

    function dragstart() {
      var e = translateXY(d3.mouse(el));

      var nodes = intNodes.filter(function (d) {
        return distancePoint(e, d) < NODE_RADIUS;
      });

      if (nodes.length === 0) {
        return;
      }

      draggedNode = nodes[0];
      d3.event.sourceEvent.stopPropagation();
      d3.event.sourceEvent.preventDefault();
      draggedNode.fixed |= 2;

      draggedNode.px = draggedNode.x;
      draggedNode.py = draggedNode.y;
    }

    function dragmove() {
      if (draggedNode) {
        var e = translateXY(d3.mouse(el));

        draggedNode.px = e.x;
        draggedNode.py = e.y;
        force.resume();
      }
    }

    function dragend() {
      if (draggedNode) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
        draggedNode.fixed &= ~2;
        draggedNode = undefined;
      }
    }

    var draggableNode = d3.behavior.drag()
      .on("dragstart", dragstart)
      .on("drag", dragmove)
      .on("dragend", dragend);

    function animatePanzoom(translate, scale) {
      var translateP = zoomBehavior.translate();
      var scaleP = zoomBehavior.scale();

      if (!doAnimation) {
        zoomBehavior.translate(translate);
        zoomBehavior.scale(scale);
        panzoom();
      } else {
        var start = {x: translateP[0], y: translateP[1], scale: scaleP};
        var end = {x: translate[0], y: translate[1], scale: scale};

        var interpolate = d3.interpolateObject(start, end);
        var duration = 500;

        var ease = d3.ease("cubic-in-out");

        d3.timer(function (t) {
          if (t >= duration) {
            return true;
          }

          var v = interpolate(ease(t / duration));
          zoomBehavior.translate([v.x, v.y]);
          zoomBehavior.scale(v.scale);
          panzoom();

          return false;
        });
      }
    }

    function onPanZoom() {
      savedPanZoom = {
        translate: zoomBehavior.translate(),
        scale: zoomBehavior.scale()
      };
      panzoom();
    }

    function panzoom() {
      var translate = zoomBehavior.translate();
      var scale = zoomBehavior.scale();

      panzoomReal(translate, scale);
    }

    function panzoomReal(translate, scale) {
      screenRect = {
        left: -translate[0] / scale, top: -translate[1] / scale,
        right: (canvas.width - translate[0]) / scale,
        bottom: (canvas.height - translate[1]) / scale
      };

      requestAnimationFrame(redraw);
    }

    function getSize() {
      var sidebarWidth = sidebar();
      var width = el.offsetWidth - sidebarWidth;
      var height = el.offsetHeight;

      return [width, height];
    }

    function panzoomTo(a, b) {
      var sidebarWidth = sidebar();
      var size = getSize();

      var targetWidth = Math.max(1, b[0] - a[0]);
      var targetHeight = Math.max(1, b[1] - a[1]);

      var scaleX = size[0] / targetWidth;
      var scaleY = size[1] / targetHeight;
      var scaleMax = zoomBehavior.scaleExtent()[1];
      var scale = 0.5 * Math.min(scaleMax, Math.min(scaleX, scaleY));

      var centroid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      var x = -centroid[0] * scale + size[0] / 2;
      var y = -centroid[1] * scale + size[1] / 2;
      var translate = [x + sidebarWidth, y];

      animatePanzoom(translate, scale);
    }

    function updateHighlight(nopanzoom) {
      highlightedNodes = [];
      highlightedLinks = [];

      if (highlight !== undefined) {
        if (highlight.type === "node") {
          var n = nodesDict[highlight.o.nodeinfo.node_id];

          if (n) {
            highlightedNodes = [n];

            if (!nopanzoom) {
              panzoomTo([n.x, n.y], [n.x, n.y]);
            }
          }

          return;
        } else if (highlight.type === "link") {
          var l = linksDict[highlight.o.id];

          if (l) {
            highlightedLinks = [l];

            if (!nopanzoom) {
              var x = d3.extent([l.source, l.target], function (d) {
                return d.x;
              });
              var y = d3.extent([l.source, l.target], function (d) {
                return d.y;
              });
              panzoomTo([x[0], y[0]], [x[1], y[1]]);
            }
          }

          return;
        }
      }

      if (!nopanzoom) {
        if (!savedPanZoom) {
          panzoomTo([0, 0], force.size());
        } else {
          animatePanzoom(savedPanZoom.translate, savedPanZoom.scale);
        }
      }
    }

    function drawLabel(d) {
      var neighbours = d.neighbours.filter(function (d) {
        return d.link.o.type !== "fastd" && d.link.o.type !== "L2TP";
      });

      var sum = neighbours.reduce(function (a, b) {
        return [a[0] + b.node.x, a[1] + b.node.y];
      }, [0, 0]);

      var sumCos = sum[0] - d.x * neighbours.length;
      var sumSin = sum[1] - d.y * neighbours.length;

      var angle = Math.PI / 2;

      if (neighbours.length > 0) {
        angle = Math.PI + Math.atan2(sumSin, sumCos);
      }

      var cos = Math.cos(angle);
      var sin = Math.sin(angle);

      var width = d.labelWidth;
      var height = d.labelHeight;

      var x = d.x + d.labelA * Math.pow(Math.abs(cos), 2 / 5) * Math.sign(cos) - width / 2;
      var y = d.y + d.labelB * Math.pow(Math.abs(sin), 2 / 5) * Math.sign(sin) - height / 2;

      ctx.drawImage(d.label, x, y, width, height);
    }

    function visibleLinks(d) {
      return (d.source.x > screenRect.left && d.source.x < screenRect.right &&
        d.source.y > screenRect.top && d.source.y < screenRect.bottom) ||
        (d.target.x > screenRect.left && d.target.x < screenRect.right &&
        d.target.y > screenRect.top && d.target.y < screenRect.bottom);
    }

    function visibleNodes(d) {
      return d.x + margin > screenRect.left && d.x - margin < screenRect.right &&
        d.y + margin > screenRect.top && d.y - margin < screenRect.bottom;
    }

    function drawNode(color, radius, scale, r) {
      var node = document.createElement("canvas");
      node.width = scale * radius * 8 * r;
      node.height = node.width;

      var nctx = node.getContext("2d");
      nctx.scale(scale * r, scale * r);
      nctx.save();

      nctx.translate(-node.width / scale, -node.height / scale);
      nctx.lineWidth = radius;

      nctx.beginPath();
      nctx.moveTo(radius, 0);
      nctx.arc(0, 0, radius, 0, 2 * Math.PI);

      nctx.strokeStyle = "rgba(255, 0, 0, 1)";
      nctx.shadowOffsetX = node.width * 1.5 + 0;
      nctx.shadowOffsetY = node.height * 1.5 + 3;
      nctx.shadowBlur = 12;
      nctx.shadowColor = "rgba(0, 0, 0, 0.16)";
      nctx.stroke();
      nctx.shadowOffsetX = node.width * 1.5 + 0;
      nctx.shadowOffsetY = node.height * 1.5 + 3;
      nctx.shadowBlur = 12;
      nctx.shadowColor = "rgba(0, 0, 0, 0.23)";
      nctx.stroke();

      nctx.restore();
      nctx.translate(node.width / 2 / scale / r, node.height / 2 / scale / r);

      nctx.beginPath();
      nctx.moveTo(radius, 0);
      nctx.arc(0, 0, radius, 0, 2 * Math.PI);

      nctx.strokeStyle = color;
      nctx.lineWidth = radius;
      nctx.stroke();

      return node;
    }

    function redraw() {
      var r = window.devicePixelRatio;
      var translate = zoomBehavior.translate();
      var scale = zoomBehavior.scale();
      var links = intLinks.filter(visibleLinks);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.save();
      ctx.translate(translate[0], translate[1]);
      ctx.scale(scale, scale);

      var clientColor = "rgba(230, 50, 75, 1.0)";
      var unknownColor = "#D10E2A";
      var nonUplinkColor = "#F2E3C6";
      var uplinkColor = "#5BAAEB";
      var unseenColor = "#FFA726";
      var highlightColor = "rgba(252, 227, 198, 0.15)";
      var nodeRadius = 6;
      var cableColor = "#50B0F0";

      // -- draw links --
      ctx.save();
      links.forEach(function (d) {
        var dx = d.target.x - d.source.x;
        var dy = d.target.y - d.source.y;
        var a = Math.sqrt(dx * dx + dy * dy);
        dx /= a;
        dy /= a;

        ctx.beginPath();
        ctx.moveTo(d.source.x + dx * nodeRadius, d.source.y + dy * nodeRadius);
        ctx.lineTo(d.target.x - dx * nodeRadius, d.target.y - dy * nodeRadius);
        ctx.strokeStyle = d.o.type === "Kabel" ? cableColor : d.color;
        ctx.globalAlpha = d.o.type === "fastd" || d.o.type === "L2TP" ? 0.1 : 0.8;
        ctx.lineWidth = d.o.type === "fastd" || d.o.type === "L2TP" ? 1.5 : 2.5;
        ctx.stroke();
      });

      ctx.restore();

      // -- draw unknown nodes --
      ctx.beginPath();
      unknownNodes.filter(visibleNodes).forEach(function (d) {
        ctx.moveTo(d.x + nodeRadius, d.y);
        ctx.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
      });

      ctx.strokeStyle = unknownColor;
      ctx.lineWidth = nodeRadius;

      ctx.stroke();

      // -- draw nodes --
      ctx.save();
      ctx.scale(1 / scale / r, 1 / scale / r);

      var nonUplinkNode = drawNode(nonUplinkColor, nodeRadius, scale, r);
      nonUplinkNodes.filter(visibleNodes).forEach(function (d) {
        ctx.drawImage(nonUplinkNode, scale * r * d.x - nonUplinkNode.width / 2, scale * r * d.y - nonUplinkNode.height / 2);
      });

      var uplinkNode = drawNode(uplinkColor, nodeRadius, scale, r);
      uplinkNodes.filter(visibleNodes).forEach(function (d) {
        ctx.drawImage(uplinkNode, scale * r * d.x - uplinkNode.width / 2, scale * r * d.y - uplinkNode.height / 2);
      });

      var unseenNode = drawNode(unseenColor, nodeRadius, scale, r);
      unseenNodes.filter(visibleNodes).forEach(function (d) {
        ctx.drawImage(unseenNode, scale * r * d.x - unseenNode.width / 2, scale * r * d.y - unseenNode.height / 2);
      });

      ctx.restore();

      // -- draw clients --
      ctx.save();
      ctx.beginPath();
      nodes.filter(visibleNodes).forEach(function (d) {
        var clients = d.o.node.statistics.clients;
        if (clients === 0) {
          return;
        }

        var startDistance = 16;
        var radius = 3;
        var a = 1.2;
        var startAngle = Math.PI;

        for (var orbit = 0, i = 0; i < clients; orbit++) {
          var distance = startDistance + orbit * 2 * radius * a;
          var n = Math.floor((Math.PI * distance) / (a * radius));
          var delta = clients - i;

          for (var j = 0; j < Math.min(delta, n); i++, j++) {
            var angle = 2 * Math.PI / n * j;
            var x = d.x + distance * Math.cos(angle + startAngle);
            var y = d.y + distance * Math.sin(angle + startAngle);

            ctx.moveTo(x, y);
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
          }
        }
      });

      ctx.fillStyle = clientColor;
      ctx.fill();
      ctx.restore();

      // -- draw node highlights --
      if (highlightedNodes.length) {
        ctx.save();
        ctx.shadowColor = "rgba(255, 255, 255, 1.0)";
        ctx.shadowBlur = 10 * nodeRadius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalCompositeOperation = "lighten";
        ctx.fillStyle = highlightColor;

        ctx.beginPath();
        highlightedNodes.forEach(function (d) {
          ctx.moveTo(d.x + 5 * nodeRadius, d.y);
          ctx.arc(d.x, d.y, 5 * nodeRadius, 0, 2 * Math.PI);
        });
        ctx.fill();

        ctx.restore();
      }

      // -- draw link highlights --
      if (highlightedLinks.length) {
        ctx.save();
        ctx.lineWidth = 2 * 5 * nodeRadius;
        ctx.shadowColor = "rgba(255, 255, 255, 1.0)";
        ctx.shadowBlur = 10 * nodeRadius;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalCompositeOperation = "lighten";
        ctx.strokeStyle = highlightColor;
        ctx.lineCap = "round";

        ctx.beginPath();
        highlightedLinks.forEach(function (d) {
          ctx.moveTo(d.source.x, d.source.y);
          ctx.lineTo(d.target.x, d.target.y);
        });
        ctx.stroke();

        ctx.restore();
      }

      // -- draw labels --
      if (scale > 0.9) {
        intNodes.filter(visibleNodes).forEach(drawLabel, scale);
      }

      ctx.restore();
    }

    function tickEvent() {
      redraw();
    }

    function resizeCanvas() {
      var r = window.devicePixelRatio;
      canvas.width = el.offsetWidth * r;
      canvas.height = el.offsetHeight * r;
      canvas.style.width = el.offsetWidth + "px";
      canvas.style.height = el.offsetHeight + "px";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(r, r);
      requestAnimationFrame(redraw);
    }

    function distance(a, b) {
      return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }

    function distancePoint(a, b) {
      return Math.sqrt(distance(a, b));
    }

    function distanceLink(p, a, b) {
      /* http://stackoverflow.com/questions/849211 */

      var l2 = distance(a, b);

      if (l2 === 0) {
        return distance(p, a);
      }

      var t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;

      if (t < 0) {
        return distance(p, a);
      }

      if (t > 1) {
        return distance(p, b);
      }

      return Math.sqrt(distance(p, {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
      }));
    }

    function translateXY(d) {
      var translate = zoomBehavior.translate();
      var scale = zoomBehavior.scale();

      return {
        x: (d[0] - translate[0]) / scale,
        y: (d[1] - translate[1]) / scale
      };
    }

    function onClick() {
      if (d3.event.defaultPrevented) {
        return;
      }

      var e = translateXY(d3.mouse(el));

      var nodes = intNodes.filter(function (d) {
        return distancePoint(e, d) < NODE_RADIUS;
      });

      if (nodes.length > 0) {
        router.node(nodes[0].o.node)();
        return;
      }

      var links = intLinks.filter(function (d) {
        return d.o.type !== "fastd" && d.o.type !== "L2TP";
      }).filter(function (d) {
        return distanceLink(e, d.source, d.target) < LINE_RADIUS;
      });

      if (links.length > 0) {
        router.link(links[0].o)();
        return;
      }
    }

    function zoom(z, scale) {
      var size = getSize();
      var newSize = [size[0] / scale, size[1] / scale];

      var sidebarWidth = sidebar();
      var delta = [size[0] - newSize[0], size[1] - newSize[1]];
      var translate = z.translate();
      var translateNew = [sidebarWidth + (translate[0] - sidebarWidth - delta[0] / 2) * scale, (translate[1] - delta[1] / 2) * scale];

      animatePanzoom(translateNew, z.scale() * scale);
    }

    function keyboardZoom(z) {
      return function () {
        var e = d3.event;

        if (e.altKey || e.ctrlKey || e.metaKey) {
          return;
        }

        if (e.keyCode === 43) {
          zoom(z, 1.41);
        }

        if (e.keyCode === 45) {
          zoom(z, 1 / 1.41);
        }
      };
    }

    el = document.createElement("div");
    el.classList.add("graph");

    zoomBehavior = d3.behavior.zoom()
      .scaleExtent([1 / 3, 3])
      .on("zoom", onPanZoom)
      .translate([sidebar(), 0]);

    canvas = d3.select(el)
      .attr("tabindex", 1)
      .on("keypress", keyboardZoom(zoomBehavior))
      .call(zoomBehavior)
      .append("canvas")
      .on("click", onClick)
      .call(draggableNode)
      .node();

    ctx = canvas.getContext("2d");

    force = d3.layout.force()
      .charge(-250)
      .gravity(0.1)
      .linkDistance(function (d) {
        if (d.o.type === "fastd" || d.o.type === "L2TP") {
          return 0;
        } else {
          return LINK_DISTANCE;
        }
      })
      .linkStrength(function (d) {
        if (d.o.type === "fastd" || d.o.type === "L2TP") {
          return 0;
        } else {
          return Math.max(0.5, 1 / d.o.tq);
        }
      })
      .on("tick", tickEvent)
      .on("end", savePositions);

    window.addEventListener("resize", resizeCanvas);

    panzoom();

    self.setData = function (data) {
      var oldNodes = {};

      intNodes.forEach(function (d) {
        oldNodes[d.o.id] = d;
      });

      intNodes = data.graph.nodes.map(function (d) {
        var e;
        if (d.id in oldNodes) {
          e = oldNodes[d.id];
        } else {
          e = {};
        }

        e.o = d;

        return e;
      });

      var newNodesDict = {};

      intNodes.forEach(function (d) {
        newNodesDict[d.o.id] = d;
      });

      var oldLinks = {};

      intLinks.forEach(function (d) {
        oldLinks[d.o.id] = d;
      });

      intLinks = data.graph.links.map(function (d) {
        var e;
        if (d.id in oldLinks) {
          e = oldLinks[d.id];
        } else {
          e = {};
        }

        e.o = d;
        e.source = newNodesDict[d.source.id];
        e.target = newNodesDict[d.target.id];

        if (d.type === "fastd" || d.type === "L2TP") {
          e.color = "rgba(255, 255, 255, " + (0.6 / d.tq) + ")";
        } else {
          e.color = linkScale(d.tq).hex();
        }

        return e;
      });

      linksDict = {};
      nodesDict = {};

      intNodes.forEach(function (d) {
        d.neighbours = {};

        if (d.o.node) {
          nodesDict[d.o.node.nodeinfo.node_id] = d;
        }

        var name = nodeName(d);

        var offset = 5;
        var lineWidth = 3;
        var buffer = document.createElement("canvas");
        var r = window.devicePixelRatio;
        var bctx = buffer.getContext("2d");
        bctx.font = "11px Roboto";
        var width = bctx.measureText(name).width;
        var scale = zoomBehavior.scaleExtent()[1] * r;
        buffer.width = (width + 2 * lineWidth) * scale;
        buffer.height = (16 + 2 * lineWidth) * scale;
        bctx.scale(scale, scale);
        bctx.textBaseline = "middle";
        bctx.textAlign = "center";
        bctx.fillStyle = "rgba(242, 227, 198, 1.0)";
        bctx.shadowColor = "rgba(0, 0, 0, 1)";
        bctx.shadowBlur = 5;
        bctx.fillText(name, buffer.width / (2 * scale), buffer.height / (2 * scale));

        d.label = buffer;
        d.labelWidth = buffer.width / scale;
        d.labelHeight = buffer.height / scale;
        d.labelA = offset + buffer.width / (2 * scale);
        d.labelB = offset + buffer.height / (2 * scale);
      });

      intLinks.forEach(function (d) {
        d.source.neighbours[d.target.o.id] = {node: d.target, link: d};
        d.target.neighbours[d.source.o.id] = {node: d.source, link: d};

        if (d.o.source && d.o.target) {
          linksDict[d.o.id] = d;
        }
      });

      intNodes.forEach(function (d) {
        d.neighbours = Object.keys(d.neighbours).map(function (k) {
          return d.neighbours[k];
        });
      });

      nodes = intNodes.filter(function (d) {
        return !d.o.unseen && d.o.node;
      });
      uplinkNodes = nodes.filter(function (d) {
        return d.o.node.flags.uplink;
      });
      nonUplinkNodes = nodes.filter(function (d) {
        return !d.o.node.flags.uplink;
      });
      unseenNodes = intNodes.filter(function (d) {
        return d.o.unseen && d.o.node;
      });
      unknownNodes = intNodes.filter(function (d) {
        return !d.o.node;
      });

      if (localStorageTest()) {
        var save = JSON.parse(localStorage.getItem("graph/nodeposition"));

        if (save) {
          var nodePositions = {};
          save.forEach(function (d) {
            nodePositions[d.id] = d;
          });

          intNodes.forEach(function (d) {
            if (nodePositions[d.o.id] && (d.x === undefined || d.y === undefined)) {
              d.x = nodePositions[d.o.id].x;
              d.y = nodePositions[d.o.id].y;
            }
          });
        }
      }

      var diameter = graphDiameter(intNodes);

      force.nodes(intNodes)
        .links(intLinks)
        .size([diameter, diameter]);

      updateHighlight(true);

      force.start();
      resizeCanvas();
    };

    self.resetView = function () {
      highlight = undefined;
      updateHighlight();
      doAnimation = true;
    };

    self.gotoNode = function (d) {
      highlight = {type: "node", o: d};
      updateHighlight();
      doAnimation = true;
    };

    self.gotoLink = function (d) {
      highlight = {type: "link", o: d};
      updateHighlight();
      doAnimation = true;
    };

    self.destroy = function () {
      force.stop();
      canvas.remove();
      force = null;

      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };

    self.render = function (d) {
      d.appendChild(el);
      resizeCanvas();
      updateHighlight();
    };

    return self;
  };
});
