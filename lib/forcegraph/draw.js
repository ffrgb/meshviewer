define(['helper'], function (helper) {
  var self = {};

  var ctx;
  var width;
  var height;

  var transform;

  var highlight;

  var nodeColor = '#fff';
  var highlightColor = 'rgba(255, 255, 255, 0.2)';

  var labelColor = '#fff';

  var NODE_RADIUS = 15;
  var LINE_RADIUS = 12;

  function drawDetailNode(d) {
    if (transform.k > 1) {
      helper.positionClients(ctx, d, Math.PI, d.o, 15);
      ctx.beginPath();
      var name = d.o.node_id;
      if (d.o) {
        name = d.o.hostname;
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = labelColor;
      ctx.fillText(name, d.x, d.y + 20);
    }
  }

  function drawHighlightNode(d) {
    if (highlight && highlight.type === 'node' && d.o.node_id === highlight.o.node_id) {
      ctx.arc(d.x, d.y, NODE_RADIUS * 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = highlightColor;
      ctx.fill();
      ctx.beginPath();
    }
  }

  function drawHighlightLink(d, to) {
    if (highlight && highlight.type === 'link' && d.o.id === highlight.o.id) {
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
    if (d.x < transform.invertX(0) || d.y < transform.invertY(0) || transform.invertX(width) < d.x || transform.invertY(height) < d.y) {
      return;
    }
    ctx.beginPath();

    drawHighlightNode(d);

    ctx.moveTo(d.x + 3, d.y);
    ctx.arc(d.x, d.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    drawDetailNode(d);
  };

  self.drawLink = function drawLink(d) {
    var zero = transform.invert([0, 0]);
    var area = transform.invert([width, height]);
    if (d.source.x < zero[0] && d.target.x < zero[0] || d.source.y < zero[1] && d.target.y < zero[1] ||
      d.source.x > area[0] && d.target.x > area[0] || d.source.y > area[1] && d.target.y > area[1]) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(d.source.x, d.source.y);
    var to = [d.target.x, d.target.y];

    to = drawHighlightLink(d, to);

    var grd = ctx.createLinearGradient(d.source.x, d.source.y, d.target.x, d.target.y);
    grd.addColorStop(0.45, d.color);
    grd.addColorStop(0.55, d.color_to);

    ctx.lineTo(to[0], to[1]);
    ctx.strokeStyle = grd;
    if (d.o.type.indexOf('vpn') === 0) {
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1.5;
    } else {
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 2.5;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
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

  self.setMaxArea = function setMaxArea(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;
  };

  return self;
});
