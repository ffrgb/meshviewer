define(['helper', 'snabbdom'], function (helper, V) {
  'use strict';
  V = V.default;

  function showStatImg(o, d, time) {
    var subst = {};
    subst['{SOURCE_ID}'] = d.source.node_id;
    subst['{SOURCE_NAME}'] = d.source.hostname.replace(/[^a-z0-9\-]/ig, '_');
    subst['{TARGET_ID}'] = d.target.node_id;
    subst['{TARGET_NAME}'] = d.target.hostname.replace(/[^a-z0-9\-]/ig, '_');
    subst['{TIME}'] = time;
    subst['{LOCALE}'] = _.locale();
    return helper.showStat(V, o, subst);
  }

  return function (config, el, router, d, linkScale) {
    var self = this;
    var header = document.createElement('div');
    var table = document.createElement('table');
    var images = document.createElement('div');
    el.appendChild(header);
    el.appendChild(table);
    el.appendChild(images);

    self.render = function render() {
      var children = [];
      var headers = [];
      headers.push(V.h('h2', [
        V.h('a', {
          props: { href: router.generateLink({ node: d.source.node_id }) }
        }, d.source.hostname),
        V.h('span', ' - '),
        V.h('a', {
          props: { href: router.generateLink({ node: d.target.node_id }) }
        }, d.target.hostname)
      ]));

      header = V.patch(header, V.h('div', headers));

      children.push(helper.attributeEntry(V, 'node.connectionType', d.type));
      children.push(helper.attributeEntry(V, 'node.tq', V.h('span',
        {
          style:
            {
              color: linkScale((d.source_tq + d.target_tq) / 2)
            }
        }, helper.showTq(d.source_tq) + ' - ' + helper.showTq(d.target_tq))));
      children.push(helper.attributeEntry(V, 'node.distance', helper.showDistance(d)));
      children.push(helper.attributeEntry(V, 'node.hardware', (d.source.model ? d.source.model + ' – ' : '') +
        (d.target.model ? d.target.model : '')));

      var elNew = V.h('table', children);
      table = V.patch(table, elNew);
      table.elm.classList.add('attributes');

      if (config.linkInfos) {
        var time = d.target.lastseen.format('DDMMYYYYHmmss');
        var img = [];
        config.linkInfos.forEach(function (linkInfo) {
          img.push(V.h('h4', linkInfo.name));
          img.push(showStatImg(linkInfo, d, time));
        });
        images = V.patch(images, V.h('div', img));
      }
    };

    self.setData = function setData(data) {
      d = data.links.find(function (a) {
        return a.id === d.id;
      });
      self.render();
    };
    return self;
  };
});
