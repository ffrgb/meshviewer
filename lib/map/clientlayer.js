define(['leaflet', 'helper', 'utils/color'],
  function (L, helper, color) {
    'use strict';

    return L.GridLayer.extend({
      setData: function (d) {
        this.data = d;

        // pre-calculate start angles
        this.data.all().forEach(function (n) {
          n.startAngle = (parseInt(n.node.nodeinfo.node_id.substr(10, 2), 16) / 255) * 2 * Math.PI;
        });
        this.redraw();
      },
      createTile: function (tilePoint) {
        var tile = L.DomUtil.create('canvas', 'leaflet-tile');

        var tileSize = this.options.tileSize;
        tile.width = tileSize;
        tile.height = tileSize;

        if (!this.data) {
          return tile;
        }

        var ctx = tile.getContext('2d');
        var s = tilePoint.multiplyBy(tileSize);
        var map = this._map;

        var margin = 50;
        var bbox = helper.getTileBBox(s, map, tileSize, margin);

        var nodes = this.data.search(bbox);

        if (nodes.length === 0) {
          return tile;
        }

        var startDistance = 12;

        ctx.beginPath();
        nodes.forEach(function (d) {
          var p = map.project([d.node.nodeinfo.location.latitude, d.node.nodeinfo.location.longitude]);

          p.x -= s.x;
          p.y -= s.y;

          helper.positionClients(ctx, p, d.startAngle, d.node.statistics.clients, startDistance);
        });

        ctx.fillStyle = color.map.clients;
        ctx.fill();

        return tile;
      }
    });
  });
