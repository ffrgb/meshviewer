define(["leaflet", "jshashes"],
  function (L, jsHashes) {
    var MD5 = new jsHashes.MD5();

    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d;

        //pre-calculate start angles
        this.data.all().forEach(function (d) {
          var hash = MD5.hex(d.node.nodeinfo.node_id);
          d.startAngle = (parseInt(hash.substr(0, 2), 16) / 255) * 2 * Math.PI;
        });
        this.redraw();
      },
      drawTile: function (canvas, tilePoint) {
        function getTileBBox(s, map, tileSize, margin) {
          var tl = map.unproject([s.x - margin, s.y - margin]);
          var br = map.unproject([s.x + margin + tileSize, s.y + margin + tileSize]);

          return [br.lat, tl.lng, tl.lat, br.lng];
        }

        if (!this.data)
          return;

        var tileSize = this.options.tileSize;
        var s = tilePoint.multiplyBy(tileSize);
        var map = this._map;

        var margin = 50;
        var bbox = getTileBBox(s, map, tileSize, margin);

        var nodes = this.data.search(bbox);

        if (nodes.length === 0)
          return;

        var ctx = canvas.getContext("2d");

        var radius = 3;
        var a = 1.2;
        var startDistance = 12;

        ctx.beginPath();
        nodes.forEach(function (d) {
          var p = map.project([d.node.nodeinfo.location.latitude, d.node.nodeinfo.location.longitude]);
          var clients = d.node.statistics.clients;

          if (clients === 0)
            return;

          p.x -= s.x;
          p.y -= s.y;

          for (var orbit = 0, i = 0; i < clients; orbit++) {
            var distance = startDistance + orbit * 2 * radius * a;
            var n = Math.floor((Math.PI * distance) / (a * radius));
            var delta = clients - i;

            for (var j = 0; j < Math.min(delta, n); i++, j++) {
              var angle = 2 * Math.PI / n * j;
              var x = p.x + distance * Math.cos(angle + d.startAngle);
              var y = p.y + distance * Math.sin(angle + d.startAngle);

              ctx.moveTo(x, y);
              ctx.arc(x, y, radius, 0, 2 * Math.PI);
            }
          }
        });

        ctx.fillStyle = "rgba(220, 0, 103, 0.7)";
        ctx.fill();
      }
    });
});
