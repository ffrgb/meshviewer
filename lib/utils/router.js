define(['Navigo'], function (Navigo) {
  'use strict';

  return function (language) {
    var init = false;
    var objects = {};
    var targets = [];
    var views = {};
    var current = {};
    var state = { lang: language.getLocale(), view: 'map' };

    function resetView() {
      targets.forEach(function (t) {
        t.resetView();
      });
    }

    function gotoNode(d) {
      if (objects.nodeDict[d.nodeId]) {
        targets.forEach(function (t) {
          t.gotoNode(objects.nodeDict[d.nodeId], objects.nodeDict);
        });
      }
    }

    function gotoLink(d) {
      var link = objects.links.filter(function (value) {
        return value.id === d.linkId;
      });
      if (link) {
        targets.forEach(function (t) {
          t.gotoLink(link);
        });
      }
    }

    function view(d) {
      if (d.view in views) {
        views[d.view]();
        state.view = d.view;
        resetView();
      }
    }

    function customRoute(lang, viewValue, node, link, zoom, lat, lng) {
      current = {
        lang: lang,
        view: viewValue,
        node: node,
        link: link,
        zoom: zoom,
        lat: lat,
        lng: lng
      };

      if (lang && lang !== state.lang && lang === language.getLocale(lang)) {
        language.setLocale(lang);
      }

      if (!init || viewValue && viewValue !== state.view) {
        if (!viewValue) {
          viewValue = state.view;
        }
        view({ view: viewValue });
        init = true;
      }

      if (node) {
        gotoNode({ nodeId: node });
      } else if (link) {
        gotoLink({ linkId: link });
      } else if (lat) {
        targets.forEach(function (t) {
          t.gotoLocation({
            zoom: parseInt(zoom, 10),
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          });
        });
      } else {
        resetView();
      }
    }

    var router = new Navigo(null, true, '#!');

    router
      .on(/^\/?#?!?\/([\w]{2})?\/?(map|graph)?\/?([a-f\d]{12})?([a-f\d\-]{25})?\/?(?:(\d+)\/(-?[\d.]+)\/(-?[\d.]+))?$/, customRoute)
      .on({
        '*': function () {
          router.fullUrl();
        }
      });

    router.generateLink = function generateLink(data, full, deep) {
      var result = '#!';

      if (full) {
        data = Object.assign({}, state, data);
      } else if (deep) {
        data = Object.assign({}, current, data);
      }

      for (var key in data) {
        if (!data.hasOwnProperty(key) || data[key] === undefined) {
          continue;
        }
        result += '/' + data[key];
      }

      return result;
    };

    router.fullUrl = function fullUrl(data, e, deep) {
      if (e) {
        e.preventDefault();
      }
      router.navigate(router.generateLink(data, !deep, deep));
    };

    router.getLang = function getLang() {
      var lang = location.hash.match(/^\/?#!?\/([\w]{2})\//);
      if (lang) {
        state.lang = language.getLocale(lang[1]);
        return lang[1];
      }
      return null;
    };

    router.addTarget = function addTarget(d) {
      targets.push(d);
    };

    router.removeTarget = function removeTarget(d) {
      targets = targets.filter(function (e) {
        return d !== e;
      });
    };

    router.addView = function addView(k, d) {
      views[k] = d;
    };

    router.setData = function setData(data) {
      objects = data;
    };

    return router;
  };
});
