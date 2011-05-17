jQuery.R = (route, callback) ->
  pathname = document.location.pathname

  # Regex for routes
  namedParam = /:([\w\d]+)/g
  splatParam = /\*([\w\d]+)/g
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g

  fn =
    _routeToRegExp: (route) ->
      route = route.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)")

      new RegExp('^' + route + '$')
    _extractParameters : (route, fragment) ->
      route.exec(fragment).slice(1)


  route = fn._routeToRegExp(route) if !_.isRegExp(route)

  if route.test pathname
    args = fn._extractParameters(route, pathname)
    callback.apply(this, args)