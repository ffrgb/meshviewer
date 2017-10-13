define(['moment', 'utils/router', 'leaflet', 'gui', 'helper', 'utils/language'],
  function (moment, Router, L, GUI, helper, Language) {
    'use strict';

    return function (config) {
      function handleData(data) {
        var dataNodes = {};
        dataNodes.nodes = [];
        var dataGraph = {};
        dataGraph.batadv = {};
        dataGraph.batadv.nodes = [];
        dataGraph.batadv.links = [];
        var gateways = {};

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

          if (d.type === 'tunnel' || d.vpn) {
            d.type = 'VPN';
            d.isVPN = true;
          } else if (d.type === 'fastd') {
            d.type = 'fastd';
            d.isVPN = true;
          } else if (d.type === 'l2tp') {
            d.type = 'L2TP';
            d.isVPN = true;
          } else if (d.type === 'gre') {
            d.type = 'GRE';
            d.isVPN = true;
          } else if (d.type === 'wireless') {
            d.type = 'Wifi';
            d.isVPN = false;
          } else if (d.type === 'other') {
            d.type = 'Kabel';
            d.isVPN = false;
          } else {
            d.type = 'N/A';
            d.isVPN = false;
          }

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
