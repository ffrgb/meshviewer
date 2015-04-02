function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse)
}

function sortByKey(key, d) {
  return d.slice().sort( function (a, b) {
    return a[key] - b[key]
  }).reverse()
}

function limit(key, m, d) {
  return d.filter( function (d) {
    return d[key].isAfter(m)
  })
}

function sum(a) {
  return a.reduce( function (a, b) {
    return a + b
  }, 0)
}

function one() {
  return 1
}

function trueDefault(d) {
  return d === undefined ? true : d
}

function dictGet(dict, key) {
  var k = key.shift()

  if (!(k in dict))
    return null

  if (key.length == 0)
    return dict[k]

  return dictGet(dict[k], key)
}

function localStorageTest() {
  var test = 'test'
  try {
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch(e) {
    return false
  }
}

/* Helpers working with nodes */

function offline(d) {
  return !d.flags.online
}

function online(d) {
  return d.flags.online
}

function has_location(d) {
  return "location" in d.nodeinfo
}

function subtract(a, b) {
  var ids = {}

  b.forEach( function (d) {
    ids[d.nodeinfo.node_id] = true
  })

  return a.filter( function (d) {
    return !(d.nodeinfo.node_id in ids)
  })
}

/* Helpers working with links */

function showDistance(d) {
  if (isNaN(d.distance))
    return

  return numeral(d.distance).format("0,0") + " m"
}

function showTq(d) {
  return numeral(1/d.tq).format("0%")
}

function linkId(d) {
  var ids = [d.source.node.nodeinfo.node_id, d.target.node.nodeinfo.node_id]

  return ids.sort().join("-")
}

/* Infobox stuff (XXX: move to module) */

function attributeEntry(el, label, value) {
  if (value === null || value == undefined)
    return

  var tr = document.createElement("tr")
  var th = document.createElement("th")
  th.textContent = label
  tr.appendChild(th)

  var td = document.createElement("td")

  if (typeof value == "function")
    value(td)
  else
    td.appendChild(document.createTextNode(value))

  tr.appendChild(td)

  el.appendChild(tr)

  return td
}
