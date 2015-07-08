define(["filters/nodefilter"], function (nodefilter) {
  return function (name, key, value, f) {
    var negate = false
    var refresh

    function run(d) {
      var o = dictGet(d, key.slice(0))

      if (f)
        o = f(o)

      return o === value ? !negate : negate
    }

    function setRefresh(f) {
      refresh = f
    }

    function draw(el) {
      if (negate)
        el.parentNode.classList.add("not")
      else
        el.parentNode.classList.remove("not")
    }

    function render(el) {
      var label = document.createElement("label")
      label.textContent = name + " "

      var strong = document.createElement("strong")
      strong.textContent = value

      draw(el)

      label.appendChild(strong)
      label.onclick = function () {
        negate = !negate

        draw(el)

        if (refresh)
          refresh()
      }

      el.appendChild(label)
    }

    return { run: nodefilter(run),
             setRefresh: setRefresh,
             render: render
           }
  }
})
