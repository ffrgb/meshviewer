define([], function () {
  return function () {
    var targets = []
    var filterObservers = []
    var filters = []
    var filteredData
    var data

    function remove(d) {
      targets = targets.filter( function (e) { return d !== e } )
    }

    function add(d) {
      targets.push(d)

      if (filteredData !== undefined)
        d.setData(filteredData)
    }

    function setData(d) {
      data = d
      refresh()
    }

    function refresh() {
      if (data === undefined)
        return

      filteredData = filters.reduce( function (a, f) {
        return f.run(a)
      }, data)

      targets.forEach( function (t) {
        t.setData(filteredData)
      })
    }

    function notifyObservers() {
      filterObservers.forEach( function (d) {
        d.filtersChanged(filters)
      })
    }

    function addFilter(d) {
      filters.push(d)
      notifyObservers()
      d.setRefresh(refresh)
      refresh()
    }

    function removeFilter(d) {
      filters = filters.filter( function (e) { return d !== e } )
      notifyObservers()
      refresh()
    }

    function watchFilters(d) {
      filterObservers.push(d)

      d.filtersChanged(filters)

      return function () {
        filterObservers = filterObservers.filter( function (e) { return d !== e })
      }
    }

    return { add: add,
             remove: remove,
             setData: setData,
             addFilter: addFilter,
             removeFilter: removeFilter,
             watchFilters: watchFilters,
             refresh: refresh
           }
  }
})
