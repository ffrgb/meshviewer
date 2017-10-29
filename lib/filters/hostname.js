define(function () {
  'use strict';

  return function () {
    var refreshFunctions = [];
    var timer;
    var input = document.createElement('input');

    function refresh() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        refreshFunctions.forEach(function (f) {
          f();
        });
      }, 250);
    }

    function run(d) {
      return d.hostname.toLowerCase().includes(input.value.toLowerCase());
    }

    function setRefresh(f) {
      refreshFunctions.push(f);
    }

    function render(el) {
      input.type = 'search';
      input.placeholder = _.t('sidebar.nodeFilter');
      input.setAttribute('aria-label', _.t('sidebar.nodeFilter'));
      input.addEventListener('input', refresh);
      el.classList.add('filter-node');
      el.classList.add('ion-filter');
      el.appendChild(input);
    }

    return {
      run: run,
      setRefresh: setRefresh,
      render: render
    };
  };
});
