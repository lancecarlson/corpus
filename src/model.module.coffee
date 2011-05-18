this.Model.Module =
  extend: (obj) ->
    _.extend this, obj
    this

  include: (obj) ->
    _.extend this.prototype, obj
    this