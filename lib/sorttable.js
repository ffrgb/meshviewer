define(['snabbdom'], function (V) {
  'use strict';
  V = V.default;

  return function (headings, sortIndex, renderRow) {
    var self = this;
    var data;
    var sortReverse = false;
    self.el = document.createElement('table');

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

          return V.h('th', { props: properties }, name);
        });

        var links = data.slice(0).sort(headings[sortIndex].sort);

        if (headings[sortIndex].reverse ? !sortReverse : sortReverse) {
          links = links.reverse();
        }

        children.push(V.h('thead', V.h('tr', th)));
        children.push(V.h('tbody', links.map(renderRow)));
      }

      var elNew = V.h('table', children);
      self.el = V.patch(self.el, elNew);
    }

    self.setData = function setData(d) {
      data = d;
      updateView();
    };

    return self;
  };
});
