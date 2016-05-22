define(function () {
  return function () {
    var self = this;

    self.render = function (el) {
      var p = document.createElement("p");
      p.setAttribute("class", "legend");
      el.appendChild(p);

      var spanNew = document.createElement("span");
      spanNew.setAttribute("class", "legend-new");
      var symbolNew = document.createElement("span");
      symbolNew.setAttribute("class", "symbol");
      var textNew = document.createTextNode(" Neuer Knoten");
      spanNew.appendChild(symbolNew);
      spanNew.appendChild(textNew);
      p.appendChild(spanNew);

      var spanOnline = document.createElement("span");
      spanOnline.setAttribute("class", "legend-online");
      var symbolOnline = document.createElement("span");
      symbolOnline.setAttribute("class", "symbol");
      var textOnline = document.createTextNode(" Knoten ist online");
      spanOnline.appendChild(symbolOnline);
      spanOnline.appendChild(textOnline);
      p.appendChild(spanOnline);

      var spanOffline = document.createElement("span");
      spanOffline.setAttribute("class", "legend-offline");
      var symbolOffline = document.createElement("span");
      symbolOffline.setAttribute("class", "symbol");
      var textOffline = document.createTextNode(" Knoten ist offline");
      spanOffline.appendChild(symbolOffline);
      spanOffline.appendChild(textOffline);
      p.appendChild(spanOffline);
    };

    return self;
  };
});

