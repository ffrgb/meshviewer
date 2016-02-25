define(function () {
  return function () {
    var self = this
    var objects = { nodes: {}, links: {} }
    var targets = []
    var views = {}
    var currentView
    var currentObject
    var running = false

    function saveState() {
      var e = []

      if (currentView)
        e.push("v:" + currentView)

      if (currentObject) {
        if ("node" in currentObject)
          e.push("n:" + encodeURIComponent(currentObject.node.nodeinfo.node_id))

        if ("link" in currentObject)
          e.push("l:" + encodeURIComponent(currentObject.link.id))
      }

      var s = "#!" + e.join(";")

      window.history.pushState(s, undefined, s)
    }

    function resetView(push) {
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.resetView()
      })

      if (push) {
        currentObject = undefined
        saveState()
      }
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

    function gotoLocation(d) {
      if (!d)
        return false

      targets.forEach( function (t) {
        if(!t.gotoLocation)console.warn("has no gotoLocation", t)
        t.gotoLocation(d)
      })

      return true
    }

    function loadState(s) {
      if (!s)
        return false

      if (!s.startsWith("#!"))
        return false

      var targetSet = false

      s.slice(2).split(";").forEach(function (d) {
        var args = d.split(":")

        if (args[0] === "v" && args[1] in views) {
          currentView = args[1]
          views[args[1]]()
        }

        var id

        if (args[0] === "n") {
          id = decodeURIComponent(args[1])
          if (id in objects.nodes) {
            currentObject = { node: objects.nodes[id] }
            gotoNode(objects.nodes[id])
            targetSet = true
          }
        }

        if (args[0] === "l") {
          id = decodeURIComponent(args[1])
          if (id in objects.links) {
            currentObject = { link: objects.links[id] }
            gotoLink(objects.links[id])
            targetSet = true
          }
        }
      })

      return targetSet
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

    self.view = function (d) {
      if (d in views) {
        views[d]()

        if (!currentView || running)
          currentView = d

        if (!running)
          return

        saveState()

        if (!currentObject) {
          resetView(false)
          return
        }

        if ("node" in currentObject)
          gotoNode(currentObject.node)

        if ("link" in currentObject)
          gotoLink(currentObject.link)
      }
    }

    self.node = function (d) {
      return function () {
        if (gotoNode(d)) {
          currentObject = { node: d }
          saveState()
        }

        return false
      }
    }

    self.link = function (d) {
      return function () {
        if (gotoLink(d)) {
          currentObject = { link: d }
          saveState()
        }

        return false
      }
    }

    self.gotoLocation = gotoLocation

    self.reset = function () {
      resetView()
    }

    self.addTarget = function (d) {
      targets.push(d)
    }

    self.removeTarget = function (d) {
      targets = targets.filter( function (e) {
        return d !== e
      })
    }

    self.addView = function (k, d) {
      views[k] = d
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

    return self
  }
})
