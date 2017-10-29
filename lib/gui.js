define(['d3-interpolate', 'map', 'sidebar', 'tabs', 'container', 'legend',
  'linklist', 'nodelist', 'simplenodelist', 'infobox/main',
  'proportions', 'forcegraph', 'title', 'about', 'datadistributor',
  'filters/filtergui', 'filters/hostname'],
function (d3Interpolate, Map, Sidebar, Tabs, Container, Legend, Linklist,
  Nodelist, SimpleNodelist, Infobox, Proportions, ForceGraph,
  Title, About, DataDistributor, FilterGUI, HostnameFilter) {
  'use strict';

  return function (config, router, language) {
    var self = this;
    var content;
    var contentDiv;

    var linkScale = d3Interpolate.interpolate('#F02311', '#04C714');
    var sidebar;

    var buttons = document.createElement('div');
    buttons.classList.add('buttons');

    var fanout = new DataDistributor();
    var fanoutUnfiltered = new DataDistributor();
    fanoutUnfiltered.add(fanout);

    function removeContent() {
      if (!content) {
        return;
      }

      router.removeTarget(content);
      fanout.remove(content);

      content.destroy();

      content = null;
    }

    function addContent(K) {
      removeContent();

      content = new K(config, linkScale, sidebar.getWidth, router, buttons);
      content.render(contentDiv);

      fanout.add(content);
      router.addTarget(content);
    }

    function mkView(K) {
      return function () {
        addContent(K);
      };
    }

    var loader = document.getElementsByClassName('loader')[0];
    loader.classList.add('hide');

    contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    document.body.appendChild(contentDiv);

    sidebar = new Sidebar(document.body);

    contentDiv.appendChild(buttons);

    var buttonToggle = document.createElement('button');
    buttonToggle.classList.add('ion-eye', 'shadow');
    buttonToggle.setAttribute('data-tooltip', _.t('button.switchView'));
    buttonToggle.onclick = function onclick() {
      var data;
      if (content.constructor === Map) {
        data = { view: 'graph', lat: undefined, lng: undefined, zoom: undefined };
      } else {
        data = { view: 'map' };
      }
      router.fullUrl(data, false, true);
    };

    buttons.appendChild(buttonToggle);

    var title = new Title(config);

    var header = new Container('header');
    var infobox = new Infobox(config, sidebar, router, linkScale);
    var tabs = new Tabs();
    var overview = new Container();
    var legend = new Legend(config, language);
    var newnodeslist = new SimpleNodelist('new', 'firstseen', router, _.t('node.new'));
    var lostnodeslist = new SimpleNodelist('lost', 'lastseen', router, _.t('node.missing'));
    var nodelist = new Nodelist(router);
    var linklist = new Linklist(linkScale, router);
    var statistics = new Proportions(config, fanout);
    var about = new About();

    fanoutUnfiltered.add(legend);
    fanoutUnfiltered.add(newnodeslist);
    fanoutUnfiltered.add(lostnodeslist);
    fanoutUnfiltered.add(infobox);
    fanout.add(nodelist);
    fanout.add(linklist);
    fanout.add(statistics);

    sidebar.add(header);
    header.add(legend);

    overview.add(newnodeslist);
    overview.add(lostnodeslist);

    var filterGUI = new FilterGUI(fanout);
    fanout.watchFilters(filterGUI);
    header.add(filterGUI);

    var hostnameFilter = new HostnameFilter();
    fanout.addFilter(hostnameFilter);

    sidebar.add(tabs);
    tabs.add('sidebar.actual', overview);
    tabs.add('node.nodes', nodelist);
    tabs.add('node.links', linklist);
    tabs.add('sidebar.stats', statistics);
    tabs.add('sidebar.about', about);

    router.addTarget(title);
    router.addTarget(infobox);

    router.addView('map', mkView(Map));
    router.addView('graph', mkView(ForceGraph));

    self.setData = fanoutUnfiltered.setData;

    return self;
  };
});
