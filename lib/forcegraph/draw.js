define(['helper'], function (helper) {
  var self = this;

  var ctx;
  var transform;

  var highlight;

  var nonUplinkColor = '#f2e3c6';
  var clientColor = '#e6324b';

  var cableColor = '#50b0f0';
  var highlightColor = 'rgba(255, 255, 255, 0.2)';

  var labelColor = '#fff';

  var NODE_RADIUS = 15;
  var LINE_RADIUS = 12;

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
      ctx.fillStyle = labelColor;
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
    ctx.strokeStyle = nonUplinkColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 1;
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
