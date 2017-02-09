define(['leaflet', 'helper'],
  function (L, helper) {
    'use strict';

    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d;

        // pre-calculate start angles
        this.data.all().forEach(function (n) {
          n.startAngle = (parseInt(n.node.nodeinfo.node_id.substr(10, 2), 16) / 255) * 2 * Math.PI;
        });
        this.redraw();
      },
      drawTile: function (canvas, tilePoint) {
        if (!this.data) {
          return;
        }

        var tileSize = this.options.tileSize;
        var s = tilePoint.multiplyBy(tileSize);
        var map = this._map;

        var margin = 50;
        var bbox = helper.getTileBBox(s, map, tileSize, margin);

        var nodes = this.data.search(bbox);

        if (nodes.length === 0) {
          return;
        }

        var ctx = canvas.getContext('2d');


        var startDistance = 12;

        ctx.beginPath();
        nodes.forEach(function (d) {
          var p = map.project([d.node.nodeinfo.location.latitude, d.node.nodeinfo.location.longitude]);

          p.x -= s.x;
          p.y -= s.y;

          helper.positionClients(ctx, p, d.startAngle, d.node.statistics.clients, startDistance);
        });

        ctx.fillStyle = 'rgba(220, 0, 103, 0.7)';
        ctx.fill();
      }
    });
  });
