define([], function () {
  return function () {
    var self = this

    var container = document.createElement("div")

    self.add = function (d) {
      d.render(container)
    }

    self.render = function (el) {
      el.appendChild(container)
    }

    return self
  }
})
