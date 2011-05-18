this.Model.Attributes =
  # Returns the attributes associated with the record
  attributes: -> this._attributes

  # Get the attribute value.
  # post.get("body")
  get: (key) ->
    this._attributes[key]

  # Set the attribute value. Can set multiple keys at once.
  # post.set("body", "Lorem Ipsum..")
  # post.set({body: "Lorem Ipsum", title: "Fake Latin Lesson"})
  set: (key, value) ->
    if _.isString(key) or _.isNumber(key)
      # Run value through sanitation if set
      #if this._model and this._model._sanitizers[key]
      #  value = this._model._sanitizers[key].call(this, value)

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

  # Set or get an attribute value/values
  # post.attr("body", "Lorem Ipsum")
  # post.attr("body") #=> "Lorem Ipsum"
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

  # Indicates if the record has changed or not.
  # Returns true or false
  changed: -> this._changes != {}

  # Changes to the attributes of the record
  # Returns {key: "value", key2: "value2"}
  changes: -> this._changes

  #_parseAssociations: (attributes) ->
  #  _.each model._manyAssociations, (assoc) ->
  #    val = attributes[assoc]
  #    delete attributes[assoc]
  #    _.each val, (attrs) ->
  #      instance = eval("new #{_.classify assoc}")
  #      instance._refresh(attrs)
  #      instance._parent = this
  #      this[assoc].add instance
  #    , this
  #  , this

  _change: (record) ->
    _.each record._changes, (value, key) ->
      if $(name).val() != value
        $(name).val value

  # Refresh all attributes. Only called on instantiation
  _refresh: (attributes) ->
    this._attributes = attributes or= {}
    #this._parseAssociations attributes
    this._prevAttributes = _.clone(this._attributes)
    this._changes = {}
    this.attr(attributes)
    this._changes = {}
