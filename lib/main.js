define(['moment', 'utils/router', 'leaflet', 'gui', 'helper', 'utils/language'],
  function (moment, Router, L, GUI, helper, Language) {
    'use strict';

    return function (config) {
      function handleData(data) {
        var timestamp;
        var nodes = [];
        var links = [];
        var nodeDict = {};

        for (var i = 0; i < data.length; ++i) {
          nodes = nodes.concat(data[i].nodes);
          timestamp = data[i].timestamp;
          links = links.concat(data[i].links);
        }

        nodes.forEach(function (node) {
          node.firstseen = moment.utc(node.firstseen).local();
          node.lastseen = moment.utc(node.lastseen).local();
        });

        var now = moment();
        var age = moment(now).subtract(config.maxAge, 'days');

        var newnodes = helper.limit('firstseen', age, helper.sortByKey('firstseen', nodes).filter(helper.online));
        var lostnodes = helper.limit('lastseen', age, helper.sortByKey('lastseen', nodes).filter(helper.offline));

        nodes.forEach(function (d) {
          d.neighbours = [];
          nodeDict[d.node_id] = d;
        });

        links.forEach(function (d) {
          d.source = nodes.find(function (a) {
            return a.node_id === d.source;
          });

          d.target = nodes.find(function (a) {
            return a.node_id === d.target;
          });

          d.id = [d.source.node_id, d.target.node_id].join('-');
          d.source.neighbours.push({ node: d.target, link: d });
          d.target.neighbours.push({ node: d.source, link: d });

          try {
            d.latlngs = [];
            d.latlngs.push(L.latLng(d.source.location.latitude, d.source.location.longitude));
            d.latlngs.push(L.latLng(d.target.location.latitude, d.target.location.longitude));

            d.distance = d.latlngs[0].distanceTo(d.latlngs[1]);
          } catch (e) {
            // ignore exception
          }
        });

        links.sort(function (a, b) {
          return b.source_tq - a.source_tq;
        });

        return {
          now: now,
          timestamp: moment.utc(timestamp).local(),
          nodes: {
            all: nodes,
            new: newnodes,
            lost: lostnodes
          },
          links: links,
          graph: {
            links: [],
            nodes: []
          },
          nodeDict: nodeDict
        };
      }

      var language = new Language(config);
      var router = new Router(language);

      var urls = [];

      if (typeof config.dataPath === 'string' || config.dataPath instanceof String) {
        config.dataPath = [config.dataPath];
      }

      for (var i in config.dataPath) {
        if (config.dataPath.hasOwnProperty(i)) {
          urls.push(config.dataPath[i] + 'meshviewer.json');
        }
      }

      function update() {
        language.init(router);
        return Promise.all(urls.map(helper.getJSON))
          .then(handleData);
      }

      update()
        .then(function (d) {
          var gui = new GUI(config, router, language);
          gui.setData(d);
          router.setData(d);
          router.resolve();

          window.setInterval(function () {
            update().then(function (n) {
              gui.setData(n);
              router.setData(n);
            });
          }, 60000);
        })
        .catch(function (e) {
          document.querySelector('.loader').innerHTML += e.message
            + '<br /><br /><button onclick="location.reload(true)" class="btn text" aria-label="Try to reload">Try to reload</button><br /> or report to your community';
          console.warn(e);
        });
    };
  });
