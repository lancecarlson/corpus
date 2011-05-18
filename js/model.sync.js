(function() {
  this.Model.Sync = function(obj, method, options) {
    var data, methodVerbs, params;
    methodVerbs = {
      "create": "POST",
      "update": "PUT",
      "delete": "DELETE",
      "read": "GET"
    };
    params = _.extend({
      type: methodVerbs[method],
      contentType: "application/json",
      dataType: "json",
      processData: method === "read" ? true : false
    }, options);
    params.url = obj.getUrl(method);
    if (!options.data) {
      data = JSON.stringify(obj.toJSON());
      if (data !== "{}") {
        params.data = data;
      }
    }
    return $.ajax(params);
  };
}).call(this);
