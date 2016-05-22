define(["virtual-dom"], function (V) {
  return function (headings, sortIndex, renderRow) {
    var data;
    var sortReverse = false;
    var el = document.createElement("table");
    var elLast = V.h("table");

    function sortTable(i) {
      sortReverse = i === sortIndex ? !sortReverse : false;
      sortIndex = i;

      updateView();
    }

    function sortTableHandler(i) {
      return function () {
        sortTable(i);
      };
    }

    function updateView() {
      var children = [];

      if (data.length !== 0) {
        var th = headings.map(function (d, i) {
          var properties = {
            onclick: sortTableHandler(i),
            className: "sort-header"
          };

          if (sortIndex === i) {
            properties.className += sortReverse ? " sort-up" : " sort-down";
          }

          return V.h("th", properties, d.name);
        });

        var links = data.slice(0).sort(headings[sortIndex].sort);

        if (headings[sortIndex].reverse ? !sortReverse : sortReverse) {
          links = links.reverse();
        }

        children.push(V.h("thead", V.h("tr", th)));
        children.push(V.h("tbody", links.map(renderRow)));
      }

      var elNew = V.h("table", children);
      el = V.patch(el, V.diff(elLast, elNew));
      elLast = elNew;
    }

    this.setData = function (d) {
      data = d;
      updateView();
    };

    this.el = el;

    return this;
  };
});
