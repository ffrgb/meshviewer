define(['helper'], function (helper) {
  'use strict';

  return function (name, key, value, f) {
    var negate = false;
    var refresh;

    var label = document.createElement('label');
    var strong = document.createElement('strong');
    label.textContent = name + ': ';
    label.appendChild(strong);

    function run(d) {
      var o = helper.dictGet(d, key.slice(0));

      if (f) {
        o = f(o);
      }

      return o === value ? !negate : negate;
    }

    function setRefresh(r) {
      refresh = r;
    }

    function draw(el) {
      if (negate) {
        el.classList.add('not');
      } else {
        el.classList.remove('not');
      }

      strong.textContent = value;
    }

    function render(el) {
      el.appendChild(label);
      draw(el);

      label.onclick = function onclick() {
        negate = !negate;

        draw(el);

        if (refresh) {
          refresh();
        }
      };
    }

    function getKey() {
      return value.concat(name);
    }

    return {
      run: run,
      setRefresh: setRefresh,
      render: render,
      getKey: getKey
    };
  };
});
