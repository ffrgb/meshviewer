define(["filters/nodefilter"], function (nodefilter) {
  return function (name, key, value, f) {
    function run(d) {
      var o = dictGet(d, key.slice(0))

      if (f)
        o = f(o)

      return o === value
    }

    function setRefresh() {
    }

    function render(el) {
      var label = document.createElement("label")
      label.textContent = name + " "

      var strong = document.createElement("strong")
      strong.textContent = value

      label.appendChild(strong)

      el.appendChild(label)
    }

    return { run: nodefilter(run),
             setRefresh: setRefresh,
             render: render
           }
  }
})
