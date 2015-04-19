define(["leaflet"],
  function (L) {
    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d
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

        function projectNodes(d) {
          var p = map.project([d.node.nodeinfo.location.latitude, d.node.nodeinfo.location.longitude])

          p.x -= s.x
          p.y -= s.y

          return {p: p, o: d.node}
        }

        var margin = 256
        var bbox = getTileBBox(s, map, tileSize, margin)

        var nodesOnline = this.data.online.search(bbox).map(projectNodes)
        var nodesOffline = this.data.offline.search(bbox).map(projectNodes)
        var nodesNew = this.data.new.search(bbox).map(projectNodes)
        var nodesLost = this.data.lost.search(bbox).map(projectNodes)

        var ctx = canvas.getContext("2d")

        ctx.font = "12px Roboto"
        ctx.textBaseline = "middle"
        ctx.textAlign = "left"
        ctx.lineWidth = 2.5

        var distance = 10
        function drawLabel(d) {
          ctx.strokeText(d.o.nodeinfo.hostname, d.p.x + distance, d.p.y)
          ctx.fillText(d.o.nodeinfo.hostname, d.p.x + distance, d.p.y)
        }

        ctx.fillStyle = "rgba(212, 62, 42, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
        nodesOffline.forEach(drawLabel)

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        nodesOnline.forEach(drawLabel)

        ctx.fillStyle = "rgba(212, 62, 42, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        nodesLost.forEach(drawLabel)

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 1.0)"
        nodesNew.forEach(drawLabel)
      }
    })
})
