define(["leaflet", "jshashes"],
  function (L, jsHashes) {
    var MD5 = new jsHashes.MD5()

    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d

        //pre-calculate start angles
        this.data.all().forEach(function (d) {
          var hash = MD5.hex(d.node.nodeinfo.node_id)
          d.startAngle = (parseInt(hash.substr(0, 2), 16) / 255) * 2 * Math.PI
        })
        this.redraw()
      },
      drawTile: function (canvas, tilePoint) {
        function getTileBBox(s, map, tileSize, margin) {
          var tl = map.unproject([s.x - margin, s.y - margin])
          var br = map.unproject([s.x + margin + tileSize, s.y + margin + tileSize])

          return [br.lat, tl.lng, tl.lat, br.lng]
        }

        if (!this.data)
          return

        var tileSize = this.options.tileSize
        var s = tilePoint.multiplyBy(tileSize)
        var map = this._map

        var margin = 50
        var bbox = getTileBBox(s, map, tileSize, margin)

        var nodes = this.data.search(bbox)

        if (nodes.length === 0)
          return

        var ctx = canvas.getContext("2d")

        var radius = 3
        var a = 1.2
        var startDistance = 12

        ctx.beginPath()
        nodes.forEach(function (d) {
          var p = map.project([d.node.nodeinfo.location.latitude, d.node.nodeinfo.location.longitude])
          var clients = d.node.statistics.clients

          if (clients === 0)
            return

          p.x -= s.x
          p.y -= s.y

          var distance = startDistance
          var startAngle = d.startAngle
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
