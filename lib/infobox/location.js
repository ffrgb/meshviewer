define(function () {
  return function (config, el, router, d) {
    var sidebarTitle = document.createElement("h2");
    sidebarTitle.textContent = "Location: " + d.toString();
    el.appendChild(sidebarTitle);

    getJSON("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + d.lat + "&lon=" + d.lng + "&zoom=18&addressdetails=0")
      .then(function (result) {
        if (result.display_name) {
          sidebarTitle.textContent = result.display_name;
        }
      });

    var editLat = document.createElement("input");
    editLat.type = "text";
    editLat.value = d.lat.toFixed(9);
    el.appendChild(createBox("lat", "Breitengrad", editLat));

    var editLng = document.createElement("input");
    editLng.type = "text";
    editLng.value = d.lng.toFixed(9);
    el.appendChild(createBox("lng", "Längengrad", editLng));

    var editUci = document.createElement("textarea");
    editUci.value =
      "uci set gluon-node-info.@location[0]='location'; " +
      "uci set gluon-node-info.@location[0].share_location='1';" +
      "uci set gluon-node-info.@location[0].latitude='" + d.lat.toFixed(9) + "';" +
      "uci set gluon-node-info.@location[0].longitude='" + d.lng.toFixed(9) + "';" +
      "uci commit gluon-node-info";

    el.appendChild(createBox("uci", "Befehl", editUci, false));

    var linkPlain = document.createElement("a");
    linkPlain.textContent = "plain";
    linkPlain.onclick = function () {
      switch2plain();
      return false;
    };
    linkPlain.href = "#";

    var linkUci = document.createElement("a");
    linkUci.textContent = "uci";
    linkUci.onclick = function () {
      switch2uci();
      return false;
    };
    linkUci.href = "#";

    var hintText = document.createElement("p");
    hintText.appendChild(document.createTextNode("Du kannst zwischen "));
    hintText.appendChild(linkPlain);
    hintText.appendChild(document.createTextNode(" und "));
    hintText.appendChild(linkUci);
    hintText.appendChild(document.createTextNode(" wechseln."));
    el.appendChild(hintText);

    function createBox(name, title, inputElem, isVisible) {
      var visible = typeof isVisible !== "undefined" ? isVisible : true;
      var box = document.createElement("div");
      var heading = document.createElement("h3");
      heading.textContent = title;
      box.appendChild(heading);
      var btn = document.createElement("button");
      btn.className = "ion-ios-copy";
      btn.title = "Kopieren";
      btn.onclick = function () {
        copy2clip(inputElem.id);
      };
      inputElem.id = "location-" + name;
      inputElem.readOnly = true;
      var line = document.createElement("p");
      line.appendChild(inputElem);
      line.appendChild(btn);
      box.appendChild(line);
      box.id = "box-" + name;
      box.style.display = visible ? "block" : "none";
      return box;
    }

    function copy2clip(id) {
      var copyField = document.querySelector("#" + id);
      copyField.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.log(err);
      }
    }

    function switch2plain() {
      document.getElementById("box-uci").style.display = "none";
      document.getElementById("box-lat").style.display = "block";
      document.getElementById("box-lng").style.display = "block";
    }

    function switch2uci() {
      document.getElementById("box-uci").style.display = "block";
      document.getElementById("box-lat").style.display = "none";
      document.getElementById("box-lng").style.display = "none";
    }
  };
});
