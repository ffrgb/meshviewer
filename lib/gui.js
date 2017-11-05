define(['d3-interpolate', 'map', 'sidebar', 'tabs', 'container', 'legend',
  'linklist', 'nodelist', 'simplenodelist', 'infobox/main',
  'proportions', 'forcegraph', 'title', 'about', 'datadistributor',
  'filters/filtergui', 'filters/hostname'],
function (d3Interpolate, Map, Sidebar, Tabs, Container, Legend, Linklist,
  Nodelist, SimpleNodelist, Infobox, Proportions, ForceGraph,
  Title, About, DataDistributor, FilterGUI, HostnameFilter) {
  'use strict';

  return function (language) {
    var self = this;
    var content;
    var contentDiv;

    var linkScale = d3Interpolate.interpolate(config.map.tqFrom, config.map.tqTo);
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

      content = new K(linkScale, sidebar.getWidth, buttons);
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
    buttonToggle.classList.add('ion-eye');
    buttonToggle.setAttribute('aria-label', _.t('button.switchView'));
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

    var title = new Title();

    var header = new Container('header');
    var infobox = new Infobox(sidebar, linkScale);
    var tabs = new Tabs();
    var overview = new Container();
    var legend = new Legend(language);
    var newnodeslist = new SimpleNodelist('new', 'firstseen', _.t('node.new'));
    var lostnodeslist = new SimpleNodelist('lost', 'lastseen',  _.t('node.missing'));
    var nodelist = new Nodelist();
    var linklist = new Linklist(linkScale);
    var statistics = new Proportions(fanout);
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
