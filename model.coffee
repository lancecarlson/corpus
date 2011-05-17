this.Model = (name, options, func) ->

  model = (attributes) ->
    self = this
    this._tagId = null
    this._refresh attributes
    this._errors = {}
    this._parent = {}
    this._name = name
    this._json = {}
    this._uid = _.uniqueId("#{this._name}_")
    this.bind "change", this._change
    this.bind "data:format", this.toData
    _.each model.listAssociations(), (associationName) -> self[associationName]._parent = self
    this.initialize(attributes)
    this

  model._name = name

  _.extend model.prototype, Model.Events,
    initialize: -> # Do nothing

    modelName: -> "#{_.classify this._name}"

    attributes: -> this._attributes

    _change: (record) ->
      _.each record._changes, (value, key) ->
        # REMOVE FOLLOWING LINE
        #name = '[name="' + model._name + "[" + key + "]" + '"]'
        # if the value is already the same, don't update the value
        if $(name).val() != value
          $(name).val value

    _refresh: (attributes) ->
      this._attributes = attributes or= {}
      this._parseAssociations attributes
      this._prevAttributes = _.clone(this._attributes)
      this._changes = {}
      this.attr(attributes)
      this._changes = {}

    _parseAssociations: (attributes) ->
      _.each model._manyAssociations, (assoc) ->
        val = attributes[assoc]
        delete attributes[assoc]
        _.each val, (attrs) ->
          instance = eval("new #{_.classify assoc}")
          instance._refresh(attrs)
          instance._parent = this
          this[assoc].add instance
        , this
      , this

      #  attrPieces = attr.split("_")
      #  # is an association
      #  if attrPieces.pop() == "attributes"
      #    delete attributes[attr]
      #    associationName = attrPieces.join("_")
      #    if _.include model.listAssociations(), associationName
      #      klass = _.classify associationName
      #      _.each val, (attrs, tag_id) ->
      #        # this line could probably just say new Model(klass). Need to test.
      #        instance = eval("new #{klass}")
      #        instance._refresh(attrs)
      #        instance._tagId = parseInt(tag_id)
      #        instance._parent = this
      #        this[associationName].add instance
      #      , this
      #, this

    get: (key) ->
      this._attributes[key]

    set: (key, value) ->
      if _.isString(key) or _.isNumber(key)
        # Run value through sanitation if set
        if model._sanitizers[key]
          value = model._sanitizers[key].call(this, value)

        # Delete from changes if changed back to previous value
        if _.isEqual this._prevAttributes[key], value
          delete this._changes[key]

        # Create new changes
        else
          this._changes[key] = value

        # Set new value and trigger changes
        this._attributes[key] = value
        this.trigger("change", [this])
      else
        for k, v of key
          this.set(k, v)

    attr: (key, value) ->
      argLen = arguments.length
      return false if (_.isUndefined(key) or _.isEmpty(key)) && argLen > 0
      if (argLen == 0)
        this._attributes
      else if (argLen == 2)
        this.set(key, value)
      else if _.isString(key) or _.isNumber(key)
        this.get(key)
      else
        this.set(key)

    changed: -> this._changes != {}

    changes: -> this._changes

    unbindFrom: (form) ->
      $(form).undelegate ":input", "change", this.onBoundChange
      $(form).undelegate ":input", "keyup", this.onBoundChange

    bindTo: (form) ->
      self = this
      $(form).delegate ":input", "change", {record: this}, this.onBoundChange
      $(form).delegate ":input", "keyup", {record: this}, this.onBoundChange
        #element = $(this).getParams()[model._name]
        #tag_id = $(this).attr("name").replace /[^0-9]+/gi, ''

        #_.each element, (val, attr) ->
        #  attrPieces = attr.split("_")

        #  if attrPieces.pop() == "attributes"
        #    associationName = attrPieces.join("_")
        #    record = self[associationName].findByTagId tag_id
        #    _.each val, (value) ->
        #      record.attr value if record
        #  else
        #    self.attr attr, val
    onBoundChange: (e) ->
      el = $(e.target)
      record = e.data.record
      value = el.val()
      keys = record._parseNameField el
      keys.shift()
      record._parseAttributeKeys(keys, value)

    _parseAttributeKeys: (keys, value) ->
      # attribute
      if keys.length == 1
        key = keys[0]
        this.attr key, value
      # association
      else if keys.length > 1
        this._parseAssociationKeys(keys, value)

    _parseAssociationKeys: (keys, value) ->
      assoc = keys.shift().replace("_attributes", "")
      uid = keys.shift()
      key = keys[0]
      if !this[assoc]._object
        obj = this[assoc].findByUid(uid)
      else
        obj = this[assoc]._object
      obj._parseAttributeKeys(keys, value)

    _parseNameField: (el) ->
      _.map el.attr("name").split("["), (p) -> p.replace("]", "")

    id: -> this.get("id")

    uid: -> this._uid

    isNew: -> !_.isNumber this.id()

    errors: -> this._errors

    resetErrors: -> this._errors = {}

    parent: -> this._parent

    tagId: -> this._tagId

    toJSON: (options) ->
      baseObj = if options and options.child
        this._json = _.clone this.attributes()
      else
        this._json[model._name] = _.clone this.attributes()

      this.trigger "data:format", [this]

      # Loop through hasMany associations
      _.each model._manyAssociations, (association) ->
        model.prototype[association].each (child) ->
          childKey = "#{association}_attributes"
          baseObj[childKey] = [] unless baseObj[childKey]
          baseObj[childKey].push child.toJSON({child: true})
        , this
      , this

      # Loop through hasOne associations
      _.each model._oneAssociations, (association) ->
        child = model.prototype[association]
        unless child._fake
          this._json[model._name]["#{association}_attributes"] = child.toJSON({child: true})
      , this

      this._json

    getUrl: (method) ->
      path = _.pluralize "/#{model._name}"
      path = "#{path}/#{this.id()}" unless this.isNew()
      path

    # should pass success and error callbacks
    # success: (record, resp, xhr)
    # error: (record, resp, xhr)
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

    toData: -> # Do nothing

  # Associations
  _.extend model,
    _manyAssociations: []
    _oneAssociations: []
    _sanitizers: {}

    listAssociations: ->
      this._manyAssociations.concat this._oneAssociations

    hasMany: (name, options) ->
      this._manyAssociations.push name
      manyArray = {}
      collection = new Model.Collection(name)

      if options and options.extend
        _.extend collection, options.extend

      manyArray[name] = collection
      _.extend model.prototype, manyArray

    hasOne: (name) ->
      this._oneAssociations.push name
      association = new Model.One(name)
      oneObj = {}
      oneObj[name] = association
      oneObj["build_#{name}"] = -> association.build()
      oneObj["clear_#{name}"] = -> association.clear()
      _.extend model.prototype, oneObj

    sanitize: (key, callback) ->
      this._sanitizers[key] = callback

    newCollection: ->
      new Model.Collection(this._name)

    fetch: (params) ->
      model.newCollection().fetch(params)

    query: (options) ->
      model.newCollection().query(options)

  model

this.Model.Events =
  bind: (event, callback) ->
    this.callbacks = this.callbacks || {}
    this.callbacks[event] = this.callbacks[event] || []
    this.callbacks[event].push(callback)
    this

  trigger: (name, data) ->
    this.callbacks = this.callbacks || {}

    callbacks = this.callbacks[name]

    if callbacks
      for callback in callbacks
        callback.apply(this, data || [])

    this

# Ajax persistence
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

# One
this.Model.One = (name) ->
  this._name = name
  this._fake = true
  this

_.extend Model.One.prototype,
  build: ->
    record = eval("new #{_.classify this._name}")
    record._parent = this.parent() if this.parent()
    this._object = record

  clear: ->
    this.parent()[this._name] = this

  parent: -> this._parent

# Collection
this.Model.Collection = (name) ->
  this._name = _.singularize name
  this._options = {}
  this._reset()
  this.url = this.getUrl(name)
  this.bind "change", this._change
  this.bind "add", (collection) -> this.trigger("refresh", [collection])
  this.bind "remove", (collection) -> this.trigger("refresh", [collection])
  this

_.extend Model.Collection.prototype, Model.Events,
  getUrl: ->
    "/#{_.pluralize this._name}"

  add: (records) ->
    if _.isArray records
      _.each records, (record) ->
        this._add record
      , this
    else
      this._add records

  removeAll: ->
    this.records = []
    #this.remove this.records

  remove: (records) ->
    if _.isArray records
      _.each records, (record) ->
        this._remove record
      , this
    else
      this._remove records

  _change: (record) ->
    self = this
    _.each record._changes, (value, key) ->
      index_id = record.tagId()
      current_model_name = _.pluralize(record._name)
      name = '[name="' + self.parent()._name + "[#{current_model_name}_attributes][#{index_id}][#{key}]" + '"]'
      $(name).val value

  parent: -> this._parent

  get: (id) ->
    return null if _.isNull id
    return this._byId[if !_.isNull id.id then id.id else id]

  refresh: (records) ->
    this._reset()
    this.add(records)
    this.trigger("refresh", [this])
    this

  fetch: (params) ->
    this.query(data: params)
    this

  findByTagId: (tag_id) ->
    _.detect this.records, (element) -> element.tagId() == parseInt(tag_id)

  removeByTagId: (tag_id) ->
    record = _.detect this.records, (element) -> element.tagId() == parseInt(tag_id)
    this._remove(record) if record

  findByUid: (uid) ->
    _.detect this.records, (record) -> record.uid() == uid

  removeByUid: (uid) ->
    record = this.findByUid(uid)
    this._remove(record) if record

  query: (options) ->
    this._options = options or= {}
    collection = this
    success = options.success
    options.success = (resp, status, xhr) ->
      collection.refresh(resp)
      success(collection, resp) if success

    Model.Sync(this, "read", options)
    this

  toJSON: -> this._options

  pluck: (attr) ->
    _.map this.records, (record) ->
      record.get attr

  _add: (record) ->
    # If a json object is passed, convert to record object
    unless record._name
      attr = record
      record = eval("new #{_.classify this._name}")
      record._refresh(attr)

    this._bindRecordEvents(record)
    record._parent = this.parent() if this.parent()
    this.records.push record
    this.length++
    this.trigger("add", [record])
    record

  _remove: (record) ->
    index = this.records.indexOf(record)
    this.records.splice(index, 1)
    this.trigger("remove", [record])

    # Deprecate this in favor of dispatching a change event after a bind to remove
    this.trigger("change", [record])
    this.length--

  _reset: ->
    this.length = 0
    this.records = []
    this._byId = {}

  _bindRecordEvents: (record) ->
    collection = this
    record.bind "change", ->
      collection.trigger "change", [record]


# Underscore methods that we want to implement on the Collection.
methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
  'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
  'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
  'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty']

_.each methods, (method) ->
  Model.Collection.prototype[method] = ->
    _[method].apply(_, [this.records].concat(_.toArray(arguments)))
