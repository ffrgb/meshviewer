define(function () {
  "use strict";

  return function (distributor) {
    var container = document.createElement("ul");
    container.classList.add("filters");
    var div = document.createElement("div");

    function render(el) {
      el.appendChild(div);
    }

    function filtersChanged(filters) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      filters.forEach(function (d) {
        var li = document.createElement("li");
        container.appendChild(li);
        d.render(li);

        var button = document.createElement("button");
        button.classList.add("ion-android-close");
        button.onclick = function () {
          distributor.removeFilter(d);
        };
        li.appendChild(button);
      });

      if (container.parentNode === div && filters.length === 0) {
        div.removeChild(container);
      } else if (filters.length > 0) {
        div.appendChild(container);
      }
    }

    return {
      render: render,
      filtersChanged: filtersChanged
    };
  };
});
