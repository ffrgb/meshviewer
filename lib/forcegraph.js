define(['d3-selection', 'd3-force', 'd3-zoom', 'd3-drag', 'utils/math', 'forcegraph/draw'],
  function (d3Selection, d3Force, d3Zoom, d3Drag, math, draw) {
    'use strict';

    return function (config, linkScale, sidebar, router) {
      var self = this;
      var el;
      var canvas;
      var ctx;
      var force;
      var forceLink;

      var transform = d3Zoom.zoomIdentity;
      var intNodes = [];
      var dictNodes = {};
      var intLinks = [];

      var NODE_RADIUS_DRAG = 10;
      var NODE_RADIUS_SELECT = 15;
      var LINK_RADIUS_SELECT = 12;

      var ZOOM_MIN = 1 / 8;
      var ZOOM_MAX = 3;

      var FORCE_ALPHA = 0.3;

      draw.setTransform(transform);

      function resizeCanvas() {
        canvas.width = el.offsetWidth;
        canvas.height = el.offsetHeight;
        draw.setMaxArea(canvas.width, canvas.height);
      }

      function moveTo(x, y) {
        transform.x = (canvas.width + sidebar()) / 2 - x * transform.k;
        transform.y = canvas.height / 2 - y * transform.k;
      }

      function onClick() {
        if (d3Selection.event.defaultPrevented) {
          return;
        }

        var e = transform.invert([d3Selection.event.clientX, d3Selection.event.clientY]);
        var n = force.find(e[0], e[1], NODE_RADIUS_SELECT);

        if (n !== undefined) {
          router.node(n.o.node)();
          return;
        }

        e = { x: e[0], y: e[1] };


        var closedLink;
        var radius = LINK_RADIUS_SELECT;
        intLinks
          .forEach(function (d) {
            var distance = math.distanceLink(e, d.source, d.target);
            if (distance < radius) {
              closedLink = d;
              radius = distance;
            }
          });

        if (closedLink !== undefined) {
          router.link(closedLink.o)();
        }
      }

      function redraw() {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        intLinks.forEach(draw.drawLink);
        intNodes.forEach(draw.drawNode);

        ctx.restore();
      }

      el = document.createElement('div');
      el.classList.add('graph');

      forceLink = d3Force.forceLink()
        .distance(function (d) {
          if (d.o.vpn) {
            return 0;
          }
          return 75;
        })
        .strength(function (d) {
          if (d.o.vpn) {
            return 0.02;
          }
          return Math.max(0.5, 1 / d.o.tq);
        });

      var zoom = d3Zoom.zoom()
        .scaleExtent([ZOOM_MIN, ZOOM_MAX])
        .on('zoom', function () {
          transform = d3Selection.event.transform;
          draw.setTransform(transform);
          redraw();
        });

      force = d3Force.forceSimulation()
        .force('link', forceLink)
        .force('charge', d3Force.forceManyBody())
        .force('x', d3Force.forceX().strength(0.02))
        .force('y', d3Force.forceY().strength(0.02))
        .force('collide', d3Force.forceCollide())
        .on('tick', redraw);

      var drag = d3Drag.drag()
        .subject(function () {
          var e = transform.invert([d3Selection.event.x, d3Selection.event.y]);
          var n = force.find(e[0], e[1], NODE_RADIUS_DRAG);

          if (n !== undefined) {
            n.x = d3Selection.event.x;
            n.y = d3Selection.event.y;
            return n;
          }
          return undefined;
        })
        .on('start', function () {
          if (!d3Selection.event.active) {
            force.alphaTarget(FORCE_ALPHA).restart();
          }
          d3Selection.event.subject.fx = transform.invertX(d3Selection.event.subject.x);
          d3Selection.event.subject.fy = transform.invertY(d3Selection.event.subject.y);
        })
        .on('drag', function () {
          d3Selection.event.subject.fx = transform.invertX(d3Selection.event.x);
          d3Selection.event.subject.fy = transform.invertY(d3Selection.event.y);
        })
        .on('end', function () {
          if (!d3Selection.event.active) {
            force.alphaTarget(0);
          }
          d3Selection.event.subject.fx = null;
          d3Selection.event.subject.fy = null;
        });

      canvas = d3Selection.select(el)
        .append('canvas')
        .on('click', onClick)
        .call(drag)
        .call(zoom)
        .node();

      ctx = canvas.getContext('2d');
      draw.setCTX(ctx);

      window.addEventListener('resize', function () {
        resizeCanvas();
        redraw();
      });

      self.setData = function setData(data) {
        intNodes = data.graph.nodes.map(function (d) {
          var e;
          if (d.id in dictNodes) {
            e = dictNodes[d.id];
          } else {
            e = {};
            dictNodes[d.id] = e;
          }

          e.o = d;

          return e;
        });

        intLinks = data.graph.links.map(function (d) {
          var e = {};
          e.o = d;
          e.source = dictNodes[d.source.id];
          e.target = dictNodes[d.target.id];
          e.color = linkScale(1 / d.tq);

          return e;
        });

        force.nodes(intNodes);
        forceLink.links(intLinks);

        force.alpha(1).restart();
        resizeCanvas();
      };

      self.resetView = function resetView() {
        draw.setHighlight(null);
        transform.k = (ZOOM_MIN + 1) / 2;
        moveTo(0, 0);
        redraw();
      };

      self.gotoNode = function gotoNode(d) {
        draw.setHighlight({ type: 'node', o: d });

        for (var i = 0; i < intNodes.length; i++) {
          var n = intNodes[i];
          if (n.o.node !== d) {
            continue;
          }
          transform.k = (ZOOM_MAX + 1) / 2;
          moveTo(n.x, n.y);
          break;
        }
        redraw();
      };

      self.gotoLink = function gotoLink(d) {
        draw.setHighlight({ type: 'link', o: d });
        for (var i = 0; i < intLinks.length; i++) {
          var l = intLinks[i];
          if (l.o !== d) {
            continue;
          }
          moveTo((l.source.x + l.target.x) / 2, (l.source.y + l.target.y) / 2);
          break;
        }
        redraw();
      };

      self.destroy = function destroy() {
        force.stop();
        canvas.remove();
        force = null;

        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      };

      self.render = function render(d) {
        d.appendChild(el);
        resizeCanvas();
      };

      return self;
    };
  });
