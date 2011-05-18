this.Model = (name, options, func) ->

  model = (attributes) ->
    self = this
    this._refresh attributes
    this._errors = {}
    this._parent = {}
    this._model = model
    this._name = name
    this._json = {}
    this._uid = _.uniqueId("#{this._name}_")

    #this.bind "change", this._change
    #this.bind "data:format", this.toData
    #_.each model.listAssociations(), (associationName) -> self[associationName]._parent = self
    this.initialize(attributes)
    this

  Model.Module.extend.call model, Model.Module

  model._name = name
  model.include Model.Events
  model.include Model.Base
  model.include Model.Attributes
  model.include Model.Persistence
  model

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

  this._uid = _.uniqueId("#{this._name}_")

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

  clear: ->
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
