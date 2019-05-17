define(['leaflet', 'rbush', 'helper'],
  function (L, RBush, helper) {
    'use strict';

    return L.GridLayer.extend({
      mapRTree: function mapRTree(d) {
        return {
          minX: d.location.latitude, minY: d.location.longitude,
          maxX: d.location.latitude, maxY: d.location.longitude,
          node: d
        };
      },
      setData: function (data) {
        var rtreeOnlineAll = new RBush(9);

        this.data = rtreeOnlineAll.load(data.nodes.online.filter(helper.hasLocation).map(this.mapRTree));

        // pre-calculate start angles
        this.data.all().forEach(function (n) {
          n.startAngle = (parseInt(n.node.node_id.substr(10, 2), 16) / 255) * 2 * Math.PI;
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

        var startDistance = 10;

        nodes.forEach(function (d) {
          var p = map.project([d.node.location.latitude, d.node.location.longitude]);

          p.x -= s.x;
          p.y -= s.y;

          helper.positionClients(ctx, p, d.startAngle, d.node, startDistance);
        });

        return tile;
      }
    });
  });
