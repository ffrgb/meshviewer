'use strict';

define(['helper'], function (helper) {
  var self = this;

  var ctx;
  var transform;

  var highlight;

  const nonUplinkColor = '#F2E3C6';
  const locationColor = '#00ff00';
  const noLocationColor = '#0000ff';
  const clientColor = 'rgba(230, 50, 75, 1.0)';

  const cableColor = '#50B0F0';
  const highlightColor = 'rgba(255, 255, 255, 0.2)';

  const NODE_RADIUS = 15;
  const LINE_RADIUS = 12;

  function drawDetailNode(d) {
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

  function drawHighlightNode(d) {
    if (highlight && highlight.type === 'node' && d.o.node === highlight.o) {
      ctx.arc(d.x, d.y, NODE_RADIUS * 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = highlightColor;
      ctx.fill();
      ctx.beginPath();
    }
  }

  function drawHighlightLink(d, to) {
    if (highlight && highlight.type === 'link' && d.o === highlight.o) {
      ctx.lineTo(to[0], to[1]);
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = LINE_RADIUS * 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      to = [d.source.x, d.source.y];
    }
    return to;
  }

  self.drawNode = function drawNode(d) {
    ctx.beginPath();

    drawHighlightNode(d);

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

    drawDetailNode(d);
  };

  self.drawLink = function drawLink(d) {
    ctx.beginPath();
    ctx.moveTo(d.source.x, d.source.y);
    var to = [d.target.x, d.target.y];

    to = drawHighlightLink(d, to);

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
  };

  self.setCTX = function setCTX(newValue) {
    ctx = newValue;
  };
  self.setHighlight = function setHighlight(newValue) {
    highlight = newValue;
  };
  self.setTransform = function setTransform(newValue) {
    transform = newValue;
  };
  return self;
});
