define(["moment"], function (moment) {
  return function(config, field, router, title) {
    var self = this
    var el

    self.render = function (d) {
      el = document.createElement("div")
      d.appendChild(el)
    }

    self.setData = function (list) {
      if (list.length === 0)
        return

      var h2 = document.createElement("h2")
      h2.textContent = title
      el.appendChild(h2)
      var table = document.createElement("table")
      el.appendChild(table)

      var tbody = document.createElement("tbody")

      list.forEach( function (d) {
        var time = moment(d[field]).fromNow()

        var row = document.createElement("tr")
        var td1 = document.createElement("td")
        var a = document.createElement("a")
        a.classList.add("hostname")
        a.classList.add(d.flags.online ? "online" : "offline")
        a.textContent = d.nodeinfo.hostname
        a.href = "#"
        a.onclick = router.node(d)
        td1.appendChild(a)

        if (has_location(d)) {
          var span = document.createElement("span")
          span.classList.add("icon")
          span.classList.add("ion-location")
          td1.appendChild(span)
        }

        if ("owner" in d.nodeinfo && config.showContact) {
          var contact = d.nodeinfo.owner.contact
          td1.appendChild(document.createTextNode(" – " + contact + ""))
        }

        var td2 = document.createElement("td")
        td2.textContent = time

        row.appendChild(td1)
        row.appendChild(td2)
        tbody.appendChild(row)
      })

      table.appendChild(tbody)
      el.appendChild(table)
    }

    return self
  }
})
