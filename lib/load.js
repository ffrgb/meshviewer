define(['config_default','main'],
function(cDefault,main) {
  return function() {
    fetch('config.json')
      .then(res => res.json())
      .then((out) => {
        window.config = Object.assign(cDefault, out);
        console.log('Configuration loaded, loading application.');
        main();
    }).catch(err => { throw err; });
  }
});
