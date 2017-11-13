define(['helper', 'snabbdom'], function (helper, V) {
  'use strict';
  V = V.default;

  function showStatImg(children, d, time) {
    var subst = {
      '{SOURCE_ID}': d.source.node_id,
      '{SOURCE_NAME}': d.source.hostname.replace(/[^a-z0-9\-]/ig, '_'),
      '{SOURCE_MAC}': d.source_mac,
      '{TARGET_ID}': d.target.node_id,
      '{TARGET_NAME}': d.target.hostname.replace(/[^a-z0-9\-]/ig, '_'),
      '{TARGET_MAC}': d.target_mac,
      '{TIME}': time,
      '{LOCALE}': _.locale()
    };
    return function(linkInfo){
      children.push(V.h('tr', V.h('th', { props: { rowspan: '2' } },
        linkInfo.name
      )));
      children.push(V.h('tr', V.h('th', { props: { rowspan: '2' } },
        helper.showStat(V, linkInfo, subst)
      )));
    };
  }

  return function (el, d, linkScale) {
    var self = this;
    var header = document.createElement('div');
    var table = document.createElement('table');
    el.appendChild(header);
    el.appendChild(table);

    self.render = function render() {
      var children = [], linkImg = [], globalImg = [];
      var time = d[0].target.lastseen.format('DDMMYYYYHmmss');
      
      if (config.linkInfos) {
        config.linkInfos.forEach(function (linkInfo) {
          if(linkInfo.image.indexOf('{SOURCE_MAC}') === -1) {
            globalImg.push(linkInfo);
          } else {
            linkImg.push(linkInfo);
          }
        });
      }

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

        linkImg.forEach(showStatImg(children, link, time));
      });

      globalImg.forEach(showStatImg(children, d[0], time));
      
      var elNew = V.h('table', children);
      table = V.patch(table, elNew);
      table.elm.classList.add('attributes');
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
