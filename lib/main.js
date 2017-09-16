define(['moment', 'utils/router', 'leaflet', 'gui', 'helper', 'utils/language'],
  function (moment, Router, L, GUI, helper, Language) {
    'use strict';

    return function (config) {
      function handleData(data) {
        var dataNodesNodes = [];
        var dataNodesTimestamp = '';
        var dataGraphNodes = [];
        var dataGraphLinks = [];

        function rearrangeLinks(d) {
          d.source += dataGraphNodes.length;
          d.target += dataGraphNodes.length;
        }

        // Aggregate all nodes.json and graph.json files.
        for (var i = 0; i < data.length; ++i) {
          var vererr;
          if (i % 2) {
            if (data[i].version !== 1) {
              vererr = 'Unsupported graph version: ' + data[i].version;
              console.error(vererr); // silent fail
            } else {
              data[i].batadv.links.forEach(rearrangeLinks);
              dataGraphNodes = dataGraphNodes.concat(data[i].batadv.nodes);
              dataGraphLinks = dataGraphLinks.concat(data[i].batadv.links);
            }
          } else if (data[i].version !== 2) {
            vererr = 'Unsupported nodes version: ' + data[i].version;
            console.error(vererr); // silent fail
          } else {
            dataNodesNodes = dataNodesNodes.concat(data[i].nodes);
            dataNodesTimestamp = data[i].timestamp;
          }
        }

        // Get arrays of new and lost nodes.
        var nodes = dataNodesNodes.filter(function (d) {
          return 'firstseen' in d && 'lastseen' in d;
        });

        nodes.forEach(function (node) {
          node.firstseen = moment.utc(node.firstseen).local();
          node.lastseen = moment.utc(node.lastseen).local();
        });

        var now = moment();
        var age = moment(now).subtract(config.maxAge, 'days');

        var newnodes = helper.limit('firstseen', age, helper.sortByKey('firstseen', nodes).filter(helper.online));
        var lostnodes = helper.limit('lastseen', age, helper.sortByKey('lastseen', nodes).filter(helper.offline));

        // Create lookup dict for nodes by node_id.
        var graphnodes = {};

        dataNodesNodes.forEach(function (d) {
          graphnodes[d.nodeinfo.node_id] = d;
        });

        dataGraphNodes.forEach(function (d) {
          if (d.node_id in graphnodes) {
            d.node = graphnodes[d.node_id];
            if (d.unseen) {
              d.node.flags.online = true;
              d.node.flags.unseen = true;
            }
          }
        });

        dataGraphLinks.forEach(function (d) {
          d.source = dataGraphNodes[d.source];

          if (dataGraphNodes[d.target].node) {
            d.target = dataGraphNodes[d.target];
          } else {
            d.target = undefined;
          }
        });

        var links = dataGraphLinks.filter(function (d) {
          return d.target !== undefined;
        });

        // Collect gateways
        var gateways = {};

        nodes.forEach(function (d) {
          d.neighbours = [];
          if (d.flags.gateway && d.nodeinfo.network.mesh) {
            var mesh = d.nodeinfo.network.mesh;
            mesh[Object.keys(mesh)[0]].interfaces.tunnel.forEach(function (mac) {
              gateways[mac] = d.nodeinfo.hostname;
            });
          }
        });

        links.forEach(function (d) {
          var ids;

          ids = [d.source.node.nodeinfo.node_id, d.target.node.nodeinfo.node_id];
          d.source.node.neighbours.push({ node: d.target.node, link: d, incoming: false });
          d.target.node.neighbours.push({ node: d.source.node, link: d, incoming: true });

          d.id = ids.join('-');

          try {
            d.latlngs = [];
            d.latlngs.push(L.latLng(d.source.node.nodeinfo.location.latitude, d.source.node.nodeinfo.location.longitude));
            d.latlngs.push(L.latLng(d.target.node.nodeinfo.location.latitude, d.target.node.nodeinfo.location.longitude));

            d.distance = d.latlngs[0].distanceTo(d.latlngs[1]);
          } catch (e) {
            // ignore exception
          }
        });

        links.sort(function (a, b) {
          return b.tq - a.tq;
        });

        return {
          now: now,
          timestamp: moment.utc(dataNodesTimestamp).local(),
          nodes: {
            all: nodes,
            new: newnodes,
            lost: lostnodes
          },
          graph: {
            links: links,
            nodes: dataGraphNodes
          },
          gateways: gateways
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
          urls.push(config.dataPath[i] + 'nodes.json');
          urls.push(config.dataPath[i] + 'graph.json');
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
            + '<br /><br /><button onclick="location.reload(true)" class="btn text">Try to reload</button><br /> or report to your community';
          console.warn(e);
        });
    };
  });
