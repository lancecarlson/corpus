this.Model.Associations =
  _manyAssociations: []
  _oneAssociations: []
  _sanitizers: {}

  listAssociations: ->
    this._manyAssociations.concat this._oneAssociations

  # Sets a hasMany association for the model
  # Post.hasMany "comments"
  #
  # post.comments #=> [{comment1...}, {comment2...}]
  #
  # You can also extend the collection methods by using extend
  # Post.hasMany "comments",
  #   extend:
  #     popularComments: ->
  #       this.records = this.sortBy (comment) -> comment.position()
  hasMany: (name, options) ->
    this._manyAssociations.push name
    manyArray = {}
    collection = new Model.Collection(name)

    if options and options.extend
      _.extend collection, options.extend

    manyArray[name] = collection
    _.extend model.prototype, manyArray

  # Sets a hasOne association for the model
  # Post.hasOne "user"
  hasOne: (name) ->
    this._oneAssociations.push name
    association = new Model.One(name)
    oneObj = {}
    oneObj[name] = association
    oneObj["build_#{name}"] = -> association.build()
    oneObj["clear_#{name}"] = -> association.clear()
    _.extend model.prototype, oneObj

  # Sanitize incoming record attribute data
  # Task.sanitize "hours", (hours) -> parseInt(hours)
  #
  # Then if you do this:
  # task.set("hours", "5")
  #
  # You should get:
  # task.get("hours") #=> 5
  sanitize: (key, callback) ->
    this._sanitizers[key] = callback

  newCollection: ->
    new Model.Collection(this._name)

  fetch: (params) ->
    model.newCollection().fetch(params)

  query: (options) ->
    model.newCollection().query(options)