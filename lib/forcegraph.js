define(['d3', 'helper'], function (d3, helper) {
  'use strict';

  return function (config, linkScale, sidebar, router) {
    var self = this;
    var el;
    var canvas;
    var ctx;
    var force;
    var forceLink;

    var transform = d3.zoomIdentity;
    var intNodes = [];
    var dictNodes = {};
    var intLinks = [];

    var highlight;

    const nonUplinkColor = '#F2E3C6';
    const locationColor = '#00ff00';
    const noLocationColor = '#0000ff';
    const clientColor = 'rgba(230, 50, 75, 1.0)';
    const cableColor = '#50B0F0';
    const highlightColor = 'rgba(255, 255, 255, 0.2)';

    const NODE_RADIUS = 15;
    const LINE_RADIUS = 12;

    function resizeCanvas() {
      canvas.width = el.offsetWidth;
      canvas.height = el.offsetHeight;
      canvas.style.width = el.offsetWidth + 'px';
      canvas.style.height = el.offsetHeight + 'px';
    }

    function onClick() {
      if (d3.event.defaultPrevented) {
        return;
      }

      var e = transform.invert([d3.event.clientX, d3.event.clientY]);
      e = {x: e[0], y: e[1]};
      var n = intNodes.filter(function (d) {
        return distancePoint(e, d) < NODE_RADIUS;
      });

      if (n.length > 0) {
        router.node(n[0].o.node)();
        return;
      }

      var links = intLinks
        /* Disable Clickable VPN
        .filter(function (d) {
          return d.o.type !== 'fastd' && d.o.type !== 'L2TP';
        })
        */
        .filter(function (d) {
          return distanceLink(e, d.source, d.target) < LINE_RADIUS;
        });

      if (links.length > 0) {
        router.link(links[0].o)();
      }
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
      return distancePoint(p, {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
      });
    }

    function drawLink(d) {
      ctx.beginPath();
      ctx.moveTo(d.source.x, d.source.y);
      var to = [d.target.x, d.target.y];
      if (highlight && highlight.type === 'link' && d.o === highlight.o) {
        ctx.lineTo(to[0], to[1]);
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = LINE_RADIUS * 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        to = [d.source.x, d.source.y];
      }
      ctx.lineTo(to[0], to[1]);
      ctx.strokeStyle = d.o.type === 'Kabel' ? cableColor : d.color;
      if (d.o.type === 'fastd' || d.o.type === 'L2TP') {
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1.5;
      } else {
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2.5;
      }
      ctx.stroke();
    }

    function drawNode(d) {
      ctx.beginPath();
      if (highlight && highlight.type === 'node' && d.o.node === highlight.o) {
        ctx.arc(d.x, d.y, NODE_RADIUS * 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = highlightColor;
        ctx.fill();
        ctx.beginPath();
      }
      ctx.moveTo(d.x + 3, d.y);
      ctx.arc(d.x, d.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = noLocationColor;
      if (d.o.node && d.o.node.nodeinfo && d.o.node.nodeinfo.location) {
        ctx.fillStyle = locationColor;
      }
      ctx.strokeStyle = nonUplinkColor;
      ctx.lineWidth = 5;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.stroke();
      if (transform.k > 1) {
        ctx.beginPath();
        helper.positionClients(ctx, d, Math.PI, d.o.node.statistics.clients, 15);
        ctx.fillStyle = clientColor;
        ctx.fill();
        ctx.beginPath();
        var name = d.o.node_id;
        if (d.o.node && d.o.node.nodeinfo) {
          name = d.o.node.nodeinfo.hostname;
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(name, d.x, d.y + 20);
      }
    }

    function redraw() {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      intLinks.forEach(drawLink);
      intNodes.forEach(drawNode);

      ctx.restore();
    }

    el = document.createElement('div');
    el.classList.add('graph');

    forceLink = d3.forceLink()
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

    var zoom = d3.zoom()
         .scaleExtent([1 / 3, 3])
         .on('zoom', function () {
           transform = d3.event.transform;
           redraw();
         });


    force = d3.forceSimulation()
      .force('link', forceLink)
      .force('charge', d3.forceManyBody())
      .on('tick', redraw);

    var drag = d3.drag()
      .subject(function () {
        if (!d3.event.active) {
          force.alphaTarget(0.1).restart();
        }

        var e = transform.invert([d3.event.x, d3.event.y]);
        e = {x: e[0], y: e[1]};

        var n = intNodes.filter(function (node) {
          return distancePoint(e, node) < NODE_RADIUS;
        });

        if (n.length > 0) {
          n = n[0];
          n.x = transform.applyX(n.x);
          n.y = transform.applyY(n.y);
          return n;
        }
        return undefined;
      })
      .on('drag', function () {
        var e = transform.invert([d3.event.x, d3.event.y]);
        d3.event.subject.fx = e[0];
        d3.event.subject.fy = e[1];
      })
      .on('end', function () {
        if (!d3.event.active) {
          d3.event.subject.fx = null;
          d3.event.subject.fy = null;
          force.alphaTarget(0);
        }
      });

    canvas = d3.select(el)
      .append('canvas')
      .on('click', onClick)
      .call(drag)
      .call(zoom)
      .node();

    ctx = canvas.getContext('2d');

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
      highlight = null;
      redraw();
    };

    self.gotoNode = function gotoNode(d) {
      highlight = { type: 'node', o: d };
      redraw();
    };

    self.gotoLink = function gotoLink(d) {
      highlight = { type: 'link', o: d };
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
