define(['d3-selection', 'd3-force', 'd3-zoom', 'd3-drag', 'd3-timer', 'd3-ease', 'd3-interpolate', 'utils/math', 'forcegraph/draw'],
  function (d3Selection, d3Force, d3Zoom, d3Drag, d3Timer, d3Ease, d3Interpolate, math, draw) {
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
      var movetoTimer;
      var initial = 1.8;

      var NODE_RADIUS_DRAG = 10;
      var NODE_RADIUS_SELECT = 15;
      var LINK_RADIUS_SELECT = 12;
      var ZOOM_ANIMATE_DURATION = 350;

      var ZOOM_MIN = 1 / 8;
      var ZOOM_MAX = 3;

      var FORCE_ALPHA = 0.01;

      draw.setTransform(transform);

      function resizeCanvas() {
        canvas.width = el.offsetWidth;
        canvas.height = el.offsetHeight;
        draw.setMaxArea(canvas.width, canvas.height);
      }

      function transformPosition(p) {
        transform.x = p.x;
        transform.y = p.y;
        transform.k = p.k;
      }

      function moveTo(callback, forceMove) {
        clearTimeout(movetoTimer);
        if (!forceMove && force.alpha() > 0.3) {
          movetoTimer = setTimeout(function timerOfMoveTo() {
            moveTo(callback);
          }, 300);
          return;
        }
        var result = callback();
        var x = result[0];
        var y = result[1];
        var k = result[2];
        var end = { k: k };

        end.x = (canvas.width + sidebar()) / 2 - x * k;
        end.y = canvas.height / 2 - y * k;

        var start = { x: transform.x, y: transform.y, k: transform.k };

        var interpolate = d3Interpolate.interpolateObject(start, end);

        var timer = d3Timer.timer(function (t) {
          if (t >= ZOOM_ANIMATE_DURATION) {
            timer.stop();
            return;
          }

          var v = interpolate(d3Ease.easeQuadInOut(t / ZOOM_ANIMATE_DURATION));
          transformPosition(v);
          window.requestAnimationFrame(redraw);
        });
      }

      function onClick() {
        if (d3Selection.event.defaultPrevented) {
          return;
        }

        var e = transform.invert([d3Selection.event.clientX, d3Selection.event.clientY]);
        var n = force.find(e[0], e[1], NODE_RADIUS_SELECT);

        if (n !== undefined) {
          router.fullUrl({ node: n.o.node_id });
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
          router.fullUrl({ link: closedLink.o.id });
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
          if (d.o.type.indexOf('vpn') === 0) {
            return 0;
          }
          return 75;
        })
        .strength(function (d) {
          if (d.o.type.indexOf('vpn') === 0) {
            return 0.02;
          }
          return Math.max(0.5, d.o.source_tq);
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
        .on('tick', redraw)
        .alphaDecay(0.025);

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
        intNodes = data.nodes.online.map(function (d) {
          var e = dictNodes[d.node_id];
          if (!e) {
            e = {};
            dictNodes[d.node_id] = e;
          }

          e.o = d;

          return e;
        });

        intLinks = data.links.filter(function (d) {
          return data.nodeDict[d.source.node_id].is_online && data.nodeDict[d.target.node_id].is_online;
        }).map(function (d) {
          return {
            o: d,
            source: dictNodes[d.source.node_id],
            target: dictNodes[d.target.node_id],
            color: linkScale(d.source_tq),
            color_to: linkScale(d.target_tq)
          };
        });

        force.nodes(intNodes);
        forceLink.links(intLinks);

        force.alpha(initial).velocityDecay(0.15).restart();
        if (initial === 1.8) {
          initial = 0.5;
        }

        resizeCanvas();
      };

      self.resetView = function resetView() {
        moveTo(function calcToReset() {
          draw.setHighlight(null);
          return [0, 0, (ZOOM_MIN + 1) / 2];
        }, true);
      };

      self.gotoNode = function gotoNode(d) {
        moveTo(function calcToNode() {
          for (var i = 0; i < intNodes.length; i++) {
            var n = intNodes[i];
            if (n.o.node_id !== d.node_id) {
              continue;
            }
            draw.setHighlight({ type: 'node', o: n.o });
            return [n.x, n.y, (ZOOM_MAX + 1) / 2];
          }
          return [0, 0, (ZOOM_MIN + 1) / 2];
        });
      };

      self.gotoLink = function gotoLink(d) {
        moveTo(function calcToLink() {
          draw.setHighlight({ type: 'link', o: d });
          for (var i = 0; i < intLinks.length; i++) {
            var l = intLinks[i];
            return [(l.source.x + l.target.x) / 2, (l.source.y + l.target.y) / 2, (ZOOM_MAX / 2) + ZOOM_MIN];
          }
          return [0, 0, (ZOOM_MIN + 1) / 2];
        });
      };

      self.gotoLocation = function gotoLocation() {
        // ignore
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
