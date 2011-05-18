this.Model.Base =
  # Callback that can be used when a record is initialized
  initialize: -> # Do nothing

  # Returns the model name of the record
  modelName: -> "#{_.classify this._name}"

  # Gets the id of the record from the server
  id: -> this.get("id")

  # The UID for the record object. This is generated randomly for each record and is never equal to the id()
  uid: -> this._uid

  # Determines if the record is new or not. Looks at the id() and if it is set, then it's not new.
  # Returns true or false
  isNew: -> !_.isNumber this.id()

  # When a record has been marked hasMany or hasOne, they become a child in that association.
  # parent() is a convenient way to access the parent object.
  # Example, Post.hasMany "comments"
  # comment.parent() #=> post record
  parent: -> this._parent