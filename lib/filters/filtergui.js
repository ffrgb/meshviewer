define([], function () {
  return function (distributor) {
    var container = document.createElement("ul")
    container.classList.add("filters")

    function render(el) {
      el.appendChild(container)
    }

    function filtersChanged(filters) {
      while (container.firstChild)
        container.removeChild(container.firstChild)

      filters.forEach( function (d) {
        var li = document.createElement("li")
        var div = document.createElement("div")
        container.appendChild(li)
        li.appendChild(div)
        d.render(div)

        var button = document.createElement("button")
        button.textContent = ""
        button.onclick = function () {
          distributor.removeFilter(d)
        }
        li.appendChild(button)
      })
    }

    return { render: render,
             filtersChanged: filtersChanged
           }
  }
})
