define(['config_default', 'main'],
  function (cDefault, main) {
    return function () {
      fetch('config.json')
        .then(function (res) {return res.json();})
        .then(function (out) {
          window.config = Object.assign(cDefault, out);
          main();
        }).catch(function (err) { throw err; });
    };
  });
