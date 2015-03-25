define(["infobox/link", "infobox/node"], function (Link, Node) {
  return function (config, sidebar, gotoAnything) {
    var self = this
    el = undefined

    function destroy() {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
        el = undefined
      }
    }

    function create() {
      destroy()

      el = document.createElement("div")
      sidebar.insertBefore(el, sidebar.firstChild)

      el.scrollIntoView(false)
      el.classList.add("infobox")
      el.destroy = destroy

      var closeButton = document.createElement("button")
      closeButton.classList.add("close")
      closeButton.onclick = gotoAnything.reset
      el.appendChild(closeButton)
    }

    self.resetView = destroy

    self.gotoNode = function (d) {
      create()
      new Node(config, el, gotoAnything, d)
    }

    self.gotoLink = function (d) {
      create()
      new Link(config, el, gotoAnything, d)
    }

    return self
  }
})
