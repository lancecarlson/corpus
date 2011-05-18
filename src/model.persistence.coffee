this.Model.Persistence =
  # Displays the validations errors that came from the server response
  errors: -> this._errors

  # Reset validation errors
  resetErrors: -> this._errors = {}

  # Generates JSON for the persistence request. You never need to call this but it's useful to look at
  # for debugging purposes. You can also override this method to generate your own toJSON logic.
  toJSON: (options) ->
    this._json[this._name] = _.clone this.attributes()

    this.trigger "data:finished", [this]

    # Loop through hasMany associations
    #_.each model._manyAssociations, (association) ->
    #  model.prototype[association].each (child) ->
    #    childKey = "#{association}_attributes"
    #    baseObj[childKey] = [] unless baseObj[childKey]
    #    baseObj[childKey].push child.toJSON({child: true})
    #  , this
    #, this

    # Loop through hasOne associations
    #_.each model._oneAssociations, (association) ->
    #  child = model.prototype[association]
    #  unless child._fake
    #    this._json[model._name]["#{association}_attributes"] = child.toJSON({child: true})
    #, this

    this._json

  # The url used to make REST requests
  getUrl: (method) ->
    path = _.pluralize "/#{this._name}"
    path = "#{path}/#{this.id()}" unless this.isNew()
    path

  # Saves the record
  # Example:
  # post.save
  #   success: (validPost) ->
  #     console.log "SUCCESS"
  #   errors: (invalidPost) ->
  #     console.log invalidPost.errors
  save: (options) ->
    method = if this.isNew() then "create" else "update"

    record = this

    options or= {}
    success = options.success
    error = options.error

    options.success = (resp, status, xhr) ->
      record.resetErrors()
      unless _.isEmpty resp
        record.attr "id", resp["id"]
      success record, resp, xhr
      record.trigger "save:after", [record]
    options.error = (resp, status, xhr) ->
      record._errors = $.parseJSON(resp.responseText)
      error record, resp, xhr if error
      record.trigger "save:after", [record]

    record.trigger "save:before", [record]

    Model.Sync(record, method, options)
