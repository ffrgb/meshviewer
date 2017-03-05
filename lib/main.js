define(['polyglot', 'moment', 'router', 'leaflet', 'gui', 'helper', 'language'],
  function (Polyglot, moment, Router, L, GUI, helper, Language) {
    'use strict';

    return function (config) {
      function handleData(data) {
        var dataNodes = {};
        dataNodes.nodes = [];
        var dataGraph = {};
        dataGraph.batadv = {};
        dataGraph.batadv.nodes = [];
        dataGraph.batadv.links = [];

        function rearrangeLinks(d) {
          d.source += dataGraph.batadv.nodes.length;
          d.target += dataGraph.batadv.nodes.length;
        }

        for (var i = 0; i < data.length; ++i) {
          var vererr;
          if (i % 2) {
            if (data[i].version !== 1) {
              vererr = 'Unsupported graph version: ' + data[i].version;
              console.error(vererr); // silent fail
            } else {
              data[i].batadv.links.forEach(rearrangeLinks);
              dataGraph.batadv.nodes = dataGraph.batadv.nodes.concat(data[i].batadv.nodes);
              dataGraph.batadv.links = dataGraph.batadv.links.concat(data[i].batadv.links);
              dataGraph.timestamp = data[i].timestamp;
            }
          } else if (data[i].version !== 2) {
            vererr = 'Unsupported nodes version: ' + data[i].version;
            console.error(vererr); // silent fail
          } else {
            dataNodes.nodes = dataNodes.nodes.concat(data[i].nodes);
            dataNodes.timestamp = data[i].timestamp;
          }
        }

        var nodes = dataNodes.nodes.filter(function (d) {
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

        var graphnodes = {};

        dataNodes.nodes.forEach(function (d) {
          graphnodes[d.nodeinfo.node_id] = d;
        });

        var graph = dataGraph.batadv;

        graph.nodes.forEach(function (d) {
          if (d.node_id in graphnodes) {
            d.node = graphnodes[d.node_id];
            if (d.unseen) {
              d.node.flags.online = true;
              d.node.flags.unseen = true;
            }
          }
        });

        graph.links.forEach(function (d) {
          d.source = graph.nodes[d.source];

          if (graph.nodes[d.target].node) {
            d.target = graph.nodes[d.target];
          } else {
            d.target = undefined;
          }
        });

        var links = graph.links.filter(function (d) {
          return d.target !== undefined;
        });

        nodes.forEach(function (d) {
          d.neighbours = [];
        });

        links.forEach(function (d) {
          var unknown = (d.source.node === undefined);
          var ids;

          if (unknown) {
            d.target.node.neighbours.push({ id: d.source.id, link: d, incoming: true });
            ids = [d.source.id.replace(/:/g, ''), d.target.node.nodeinfo.node_id];
          } else {
            if (d.target.node.flags.gateway === true || d.source.node.flags.gateway === true) {
              d.type = 'fastd';
            } else {
              d.type = 'N/A';
            }

            ids = [d.source.node.nodeinfo.node_id, d.target.node.nodeinfo.node_id];
            d.source.node.neighbours.push({ node: d.target.node, link: d, incoming: false });
            d.target.node.neighbours.push({ node: d.source.node, link: d, incoming: true });
            if (d.type !== 'fastd' && d.type !== 'L2TP') {
              d.source.node.meshlinks = d.source.node.meshlinks ? d.source.node.meshlinks + 1 : 1;
            }
          }

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
          timestamp: moment.utc(dataNodes.timestamp).local(),
          nodes: {
            all: nodes,
            new: newnodes,
            lost: lostnodes
          },
          graph: {
            links: links,
            nodes: graph.nodes
          }
        };
      }

      var language = new Language(config);

      var router = new Router();

      var urls = [];

      if (typeof config.dataPath === 'string' || config.dataPath instanceof String) {
        config.dataPath = [config.dataPath];
      }

      for (var i in config.dataPath) {
        urls.push(config.dataPath[i] + 'nodes.json');
        urls.push(config.dataPath[i] + 'graph.json');
      }

      function update() {
        return Promise.all(urls.map(helper.getJSON))
          .then(handleData);
      }

      update()
        .then(function (d) {
          var gui = new GUI(config, router, language);
          gui.setData(d);
          router.setData(d);
          router.start();

          window.setInterval(function () {
            update().then(function (n) {
              gui.setData(n);
              router.setData(n);
              router.update();
            });
          }, 60000);
        })
        .catch(function (e) {
          document.body.textContent = e;
          console.warn(e);
        });
    };
  });
