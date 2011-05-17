/* DO NOT MODIFY. This file was compiled Tue, 19 Apr 2011 21:18:39 GMT from
 * /home/lance/Projects/healpay/app/coffeescripts/r.coffee
 */

(function() {
  jQuery.R = function(route, callback) {
    var args, escapeRegExp, fn, namedParam, pathname, splatParam;
    pathname = document.location.pathname;
    namedParam = /:([\w\d]+)/g;
    splatParam = /\*([\w\d]+)/g;
    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    fn = {
      _routeToRegExp: function(route) {
        route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
        return new RegExp('^' + route + '$');
      },
      _extractParameters: function(route, fragment) {
        return route.exec(fragment).slice(1);
      }
    };
    if (!_.isRegExp(route)) {
      route = fn._routeToRegExp(route);
    }
    if (route.test(pathname)) {
      args = fn._extractParameters(route, pathname);
      return callback.apply(this, args);
    }
  };
}).call(this);
