define(function () {
  return function () {
    var self = this
    var objects = { nodes: {}, links: {} }
    var targets = []
    var running = false

    function saveState(d) {
      var s = "#!"

      if (d) {
        if ("node" in d)
          s += "n:" + encodeURIComponent(d.node.nodeinfo.node_id)

        if ("link" in d)
          s += "l:" + encodeURIComponent(d.link.id)
      }

      window.history.pushState(s, undefined, s)
    }

    function resetView(push) {
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.resetView()
      })

      if (push)
        saveState()
    }

    function gotoNode(d) {
      if (!d)
        return false

      targets.forEach( function (t) {
        t.gotoNode(d)
      })

      return true
    }

    function gotoLink(d) {
      if (!d)
        return false

      targets.forEach( function (t) {
        t.gotoLink(d)
      })

      return true
    }

    function loadState(s) {
      if (!s)
        return false

      if (!s.startsWith("#!"))
        return false

      var args = s.slice(2).split(":")
      var id

      if (args[1] !== undefined) {
        id = decodeURIComponent(args[1])

        if (args[0] === "n" && id in objects.nodes) {
          gotoNode(objects.nodes[id])
          return true
        }

        if (args[0] === "l" && id in objects.links) {
          gotoLink(objects.links[id])
          return true
        }
      }

      return false
    }

    self.start = function () {
      running = true

      if (!loadState(window.location.hash))
        resetView(false)

      window.onpopstate = function (d) {
        if (!loadState(d.state))
          resetView(false)
      }
    }

    self.node = function (d) {
      return function () {
        if (gotoNode(d))
          saveState({ node: d })

        return false
      }
    }

    self.link = function (d) {
      return function () {
        if (gotoLink(d))
          saveState({ link: d })

        return false
      }
    }

    self.reset = function () {
      resetView()
      saveState()
    }

    self.addTarget = function (d) {
      targets.push(d)
    }

    self.removeTarget = function (d) {
      targets = targets.filter( function (e) {
        return d !== e
      })
    }

    self.setData = function (data) {
      objects.nodes = {}
      objects.links = {}

      data.nodes.all.forEach( function (d) {
        objects.nodes[d.nodeinfo.node_id] = d
      })

      data.graph.links.forEach( function (d) {
        objects.links[d.id] = d
      })
    }

    self.reload = function () {
      if (!running)
        return

      if (!loadState(window.history.state))
        resetView(false)
    }

    return self
  }
})
