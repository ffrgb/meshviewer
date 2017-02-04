define(['virtual-dom'], function (V) {
  'use strict';

  return function (headings, sortIndex, renderRow) {
    var data;
    var sortReverse = false;
    var el = document.createElement('table');
    var elLast = V.h('table');

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
          var name = _.t(d.name);
          var properties = {
            onclick: sortTableHandler(i),
            className: 'sort-header'
          };

          if (d.class) {
            properties.className += ' ' + d.class;
            properties.title = name;
            name = '';
          }

          if (sortIndex === i) {
            properties.className += sortReverse ? ' sort-up' : ' sort-down';
          }

          return V.h('th', properties, name);
        });

        var links = data.slice(0).sort(headings[sortIndex].sort);

        if (headings[sortIndex].reverse ? !sortReverse : sortReverse) {
          links = links.reverse();
        }

        children.push(V.h('thead', V.h('tr', th)));
        children.push(V.h('tbody', links.map(renderRow)));
      }

      var elNew = V.h('table', children);
      el = V.patch(el, V.diff(elLast, elNew));
      elLast = elNew;
    }

    this.setData = function setData(d) {
      data = d;
      updateView();
    };

    this.el = el;

    return this;
  };
});
