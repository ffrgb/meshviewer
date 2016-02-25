define(function () {
  return function (config, el, router, d) {
    var h2 = document.createElement("h2")
    h2.textContent = "Location: " + d.toString()
    el.appendChild(h2)

    getJSON("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + d.lat + "&lon=" + d.lng + "&zoom=18&addressdetail=0")
    .then(function(result) {
      h2.textContent = result.display_name
    })

    var latDiv = document.createElement("div")
    var h3lat = document.createElement("h3")
    h3lat.textContent = "Breitengrad"
    h3lat.id = "h3-latitude"
    latDiv.appendChild(h3lat)
    var txt1 = document.createElement("textarea")
    txt1.id = "location-latitude"
    txt1.value = d.lat.toFixed(9)
    var p = document.createElement("p")
    p.appendChild(txt1)
    p.appendChild(createCopyButton(txt1.id))
    latDiv.appendChild(p)
    el.appendChild(latDiv)

    var longDiv = document.createElement("div")
    var h3lng = document.createElement("h3")
    h3lng.textContent = "Längengrad"
    longDiv.appendChild(h3lng)
    var txt2 = document.createElement("textarea")
    txt2.id = "location-longitude"
    txt2.value = d.lng.toFixed(9)
    var p2 = document.createElement("p")
    p2.appendChild(txt2)
    p2.appendChild(createCopyButton(txt2.id))
    longDiv.appendChild(p2)
    longDiv.id = "div-longitude"
    el.appendChild(longDiv)

    var a1 = document.createElement("a")
    a1.textContent = "plain"
    a1.onclick = function() {
      switch2plain()
      return false
    }
    a1.href = config.siteURL
    var a2 = document.createElement("a")
    a2.textContent = "uci"
    a2.onclick = function() {
      switch2uci()
      return false
    }
    a2.href = "#"

    var p3 = document.createElement("p")
    p3.textContent = "Du kannst zwischen "
    p3.appendChild(a1)
    var t1 = document.createTextNode(" und ")
    p3.appendChild(t1)
    p3.appendChild(a2)
    var t2 = document.createTextNode(" wechseln.")
    p3.appendChild(t2)
    el.appendChild(p3)

    function createCopyButton(id) {
      var btn = document.createElement("button")
      btn.className = "ion-ios-copy"
      btn.title = "Kopieren"
      btn.onclick = function() {
        copy2clip(id)
      }
      return btn
    }

    function copy2clip(id) {
      var copyTextarea = document.querySelector("#" + id)
      copyTextarea.select()
      try {
        document.execCommand("copy")
      } catch (err) {
        console.log(err)
      }
    }

    function switch2plain() {
      var box1 = document.getElementById("location-latitude")
      box1.value = d.lat.toFixed(9)
      var box2 = document.getElementById("location-longitude")
      box2.value = d.lng.toFixed(9)
      document.getElementById("h3-latitude").textContent = "Breitengrad"
      document.getElementById("div-longitude").style.display = "block"
    }

    function switch2uci() {
      document.getElementById("location-latitude").value = "uci set gluon-node-info.@location[0].latitude='" + d.lat.toFixed(9) + "'; uci set gluon-node-info.@location[0].longitude='" + d.lng.toFixed(9) + "'"
      document.getElementById("h3-latitude").textContent = "Befehl"
      document.getElementById("div-longitude").style.display = "none"
    }
  }
})
