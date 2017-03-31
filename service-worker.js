var CACHE = 'v05';

self.addEventListener('install', function (evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(caches.open(CACHE).then(function (cache) {
    cache.addAll([
      '',
      'index.html',
      'app.js',
      'logo.svg',
      'fonts/*'
    ]);
  }));
});

self.addEventListener('fetch', function (evt) {
  if (/\/browser-sync\//.exec(evt.request.url) !== null) {
    return;
  }

  if (/meshviewer\.json/.exec(evt.request.url) !== null) {
    // foo
  }
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(
    update(evt.request)
      .then(refresh)
  );
});

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

// Sends a message to the clients.
function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      // Encode which resource has been updated. By including the
      // [ETag](https://en.wikipedia.org/wiki/HTTP_ETag) the client can
      // check if the content has changed.
      var message = {
        type: 'refresh',
        url: response.url,
        // Notice not all servers return the ETag header. If this is not
        // provided you should use other cache headers or rely on your own
        // means to check if the content has changed.
        eTag: response.headers.get('ETag')
      };
      // Tell the client about the update.
      client.postMessage(JSON.stringify(message));
    });
  });
}

self.addEventListener('activate', function (event) {
  var cacheWhitelist = [CACHE];

  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
        return false;
      }));
    })
  );
});
