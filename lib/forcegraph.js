define(['d3-selection', 'd3-force', 'd3-zoom', 'd3-drag', 'forcegraph/math', 'forcegraph/draw'], function (d3Selection, d3Force, d3Zoom, d3Drag, math, draw) {
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

    const NODE_RADIUS_DRAG = 10;
    const NODE_RADIUS_SELECT = 15;
    const LINK_RADIUS_SELECT = 12;

    draw.setTransform(transform);

    function resizeCanvas() {
      canvas.width = el.offsetWidth;
      canvas.height = el.offsetHeight;
      canvas.style.width = el.offsetWidth + 'px';
      canvas.style.height = el.offsetHeight + 'px';
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

      e = {x: e[0], y: e[1]};


      var closedLink;
      var radius = LINK_RADIUS_SELECT;
      intLinks
        /* Disable Clickable VPN
        .filter(function (d) {
          return d.o.type !== 'fastd' && d.o.type !== 'L2TP';
        })
        */
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
       if (d.o.type === 'fastd' || d.o.type === 'L2TP') {
         return 0;
       }
       return 75;
     })
     .strength(function (d) {
       if (d.o.type === 'fastd' || d.o.type === 'L2TP') {
         return 0.02;
       }
       return Math.max(0.5, 1 / d.o.tq);
     });

    var zoom = d3Zoom.zoom()
         .scaleExtent([1 / 3, 3])
         .on('zoom', function () {
           transform = d3Selection.event.transform;
           draw.setTransform(transform);
           redraw();
         });


    force = d3Force.forceSimulation()
      .force('link', forceLink)
      .force('charge', d3Force.forceManyBody())
      .on('tick', redraw);

    var drag = d3Drag.drag()
      .subject(function () {
        if (!d3Selection.event.active) {
          force.alphaTarget(0.1).restart();
        }
        var e = transform.invert([d3Selection.event.x, d3Selection.event.y]);
        var n = force.find(e[0], e[1], NODE_RADIUS_DRAG);

        if (n !== undefined) {
          n.fx = transform.applyX(n.x);
          n.fy = transform.applyY(n.y);
          return n;
        }
        return undefined;
      })
      .on('drag', function () {
        var e = transform.invert([d3Selection.event.x, d3Selection.event.y]);
        d3Selection.event.subject.fx = e[0];
        d3Selection.event.subject.fy = e[1];
      })
      .on('end', function () {
        if (!d3Selection.event.active) {
          d3Selection.event.subject.fx = null;
          d3Selection.event.subject.fy = null;
          force.alphaTarget(0);
        }
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
        e.color = linkScale(d.tq).hex();

        return e;
      });

      force.nodes(intNodes);
      forceLink.links(intLinks);

      force.restart();
      resizeCanvas();
    };

    self.resetView = function resetView() {
      draw.setHighlight(null);
      redraw();
    };

    self.gotoNode = function gotoNode(d) {
      draw.setHighlight({ type: 'node', o: d });
      redraw();
    };

    self.gotoLink = function gotoLink(d) {
      draw.setHighlight({ type: 'link', o: d });
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
