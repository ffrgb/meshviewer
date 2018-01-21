define(['helper', 'snabbdom'], function (helper, V) {
  'use strict';
  V = V.default;

  function showStatImg(img, o, d, time) {
    var subst = {
      '{SOURCE_ID}': d.source.node_id,
      '{SOURCE_NAME}': d.source.hostname.replace(/[^a-z0-9\-]/ig, '_'),
      '{SOURCE_ADDR}': d.source_addr,
      '{TARGET_ID}': d.target.node_id,
      '{TARGET_NAME}': d.target.hostname.replace(/[^a-z0-9\-]/ig, '_'),
      '{TARGET_ADDR}': d.target_addr,
      '{TYPE}': d.type,
      '{TIME}': time,
      '{LOCALE}': _.locale()
    };

    img.push(V.h('h4', helper.listReplace(o.name, subst)));
    img.push(helper.showStat(V, o, subst));
  }

  return function (el, d, linkScale) {
    var self = this;
    var header = document.createElement('div');
    var table = document.createElement('table');
    var images = document.createElement('div');
    el.appendChild(header);
    el.appendChild(table);
    el.appendChild(images);

    self.render = function render() {
      var children = [];
      var img = [];
      var time = d[0].target.lastseen.format('DDMMYYYYHmmss');

      header = V.patch(header, V.h('div', V.h('h2', [
        V.h('a', {
          props: { href: router.generateLink({ node: d[0].source.node_id }) }
        }, d[0].source.hostname),
        V.h('span', ' - '),
        V.h('a', {
          props: { href: router.generateLink({ node: d[0].target.node_id }) }
        }, d[0].target.hostname)
      ])));

      helper.attributeEntry(V, children, 'node.hardware', (d[0].source.model ? d[0].source.model + ' – ' : '') +
        (d[0].target.model ? d[0].target.model : ''));
      helper.attributeEntry(V, children, 'node.distance', helper.showDistance(d[0]));

      d.forEach(function (link) {
        children.push(V.h('tr', { props: { className: 'header' } }, [
          V.h('th', _.t('node.connectionType')),
          V.h('th', link.type)
        ]));
        helper.attributeEntry(V, children, 'node.tq', V.h('span',
          { style: { color: linkScale((link.source_tq + link.target_tq) / 2) } },
          helper.showTq(link.source_tq) + ' - ' + helper.showTq(link.target_tq))
        );

        if (config.linkTypeInfos) {
          config.linkTypeInfos.forEach(function (o) {
            showStatImg(img, o, link, time);
          });
        }
      });

      if (config.linkInfos) {
        config.linkInfos.forEach(function (o) {
          showStatImg(img, o, d[0], time);
        });
      }

      var elNew = V.h('table', children);
      table = V.patch(table, elNew);
      table.elm.classList.add('attributes');
      images = V.patch(images, V.h('div', img));
    };

    self.setData = function setData(data) {
      d = data.links.filter(function (a) {
        return a.id === d[0].id;
      });
      self.render();
    };
    return self;
  };
});
