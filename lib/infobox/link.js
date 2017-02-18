define(['helper'], function (helper) {
  'use strict';

  function showStatImg(o, d, time) {
    var subst = {};
    subst['{SOURCE_ID}'] = d.source.node_id;
    subst['{SOURCE_NAME}'] = d.source.node.nodeinfo.hostname.replace(/[^a-z0-9\-]/ig, '_');
    subst['{TARGET_ID}'] = d.target.node_id;
    subst['{TARGET_NAME}'] = d.target.node.nodeinfo.hostname.replace(/[^a-z0-9\-]/ig, '_');
    subst['{TIME}'] = time;
    subst['{LOCALE}'] = _.locale();
    return helper.showStat(o, subst);
  }

  return function (config, el, router, d) {
    var h2 = document.createElement('h2');
    var a1 = document.createElement('a');
    a1.href = router.generateLink({ node: d.source.node_id });
    a1.textContent = d.source.node.nodeinfo.hostname;
    h2.appendChild(a1);

    var arrow = document.createElement('span');
    arrow.classList.add('ion-arrow-right-c');
    h2.appendChild(arrow);

    var a2 = document.createElement('a');
    a2.href = router.generateLink({ node: d.target.node_id });
    a2.textContent = d.target.node.nodeinfo.hostname;
    h2.appendChild(a2);
    el.appendChild(h2);

    var attributes = document.createElement('table');
    attributes.classList.add('attributes');

    helper.attributeEntry(attributes, 'node.tq', helper.showTq(d));
    helper.attributeEntry(attributes, 'node.distance', helper.showDistance(d));
    var hw1 = helper.dictGet(d.source.node.nodeinfo, ['hardware', 'model']);
    var hw2 = helper.dictGet(d.target.node.nodeinfo, ['hardware', 'model']);
    helper.attributeEntry(attributes, 'node.hardware', hw1 + ' – ' + hw2);

    el.appendChild(attributes);

    if (config.linkInfos) {
      var time = d.target.node.lastseen.format('DDMMYYYYHmmss');
      config.linkInfos.forEach(function (linkInfo) {
        var h4 = document.createElement('h4');
        h4.textContent = linkInfo.name;
        el.appendChild(h4);
        el.appendChild(showStatImg(linkInfo, d, time));
      });
    }
  };
});
