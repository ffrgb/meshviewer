define(["leaflet"],
  function (L) {
    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d
        this.redraw()
      },
      drawTile: function (canvas, tilePoint) {
        if (!this.data)
          return

        var tileSize = this.options.tileSize
        var s = tilePoint.multiplyBy(tileSize)
        var map = this._map

        function project(coords) {
          var p = map.project(new L.LatLng(coords[0], coords[1]))
          return {x: p.x - s.x, y: p.y - s.y}
        }

        var nodes = this.data
        var ctx = canvas.getContext("2d")
        var margin = 50

        ctx.beginPath()
        nodes.forEach(function (d) {
            var p = project([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude])
            if (p.x + margin < 0 || p.y + margin < 0 || p.x - tileSize - margin > 0 || p.y - tileSize - margin > 0)
              return

            var clients = d.statistics.clients
            if (d.clients === 0)
              return

            var distance = 12
            var radius = 3
            var a = 1.2
            var startAngle = Math.PI
            var angle = startAngle

            for (var i = 0; i < clients; i++) {
              if ((angle - startAngle) > 2 * Math.PI) {
                angle = startAngle
                distance += 2 * radius * a
              }

              var x = p.x + distance * Math.cos(angle)
              var y = p.y + distance * Math.sin(angle)

              ctx.moveTo(x, y)
              ctx.arc(x, y, radius, 0, 2 * Math.PI)

              var n = Math.floor((Math.PI * distance) / (a * radius))
              var angleDelta = 2 * Math.PI / n
              angle += angleDelta
            }
          })

          ctx.fillStyle = "rgba(153, 118, 16, 0.5)"
          ctx.fill()
        }
    })
})
