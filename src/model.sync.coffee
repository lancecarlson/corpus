this.Model.Sync = (obj, method, options) ->
  methodVerbs = {
    "create": "POST",
    "update": "PUT",
    "delete": "DELETE",
    "read":   "GET"
  }

  params = _.extend({
    type:        methodVerbs[method],
    contentType: "application/json",
    dataType:    "json",
    processData: if method == "read" then true else false}, options)

  params.url = obj.getUrl(method)

  unless options.data
    data = JSON.stringify obj.toJSON()
    params.data = data unless data == "{}"

  $.ajax(params)