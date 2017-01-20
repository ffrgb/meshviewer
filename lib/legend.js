define(function () {
  "use strict";

  return function () {
    var self = this;

    self.render = function (el) {
      var p = document.createElement("p");
      p.classList.add("legend");
      p.innerHTML = '<span class="legend-new"><span class="symbol"></span> Neuer Knoten</span>' +
        '<span class="legend-online"><span class="symbol"></span> Knoten ist online</span>' +
        '<span class="legend-offline"><span class="symbol"></span> Knoten ist offline</span>';
      el.appendChild(p);
    };

    return self;
  };
});

