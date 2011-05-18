this.Model.Bind =
  # Unbind record from a form. See bindTo()
  unbindFrom: (form) ->
    $(form).undelegate ":input", "change", this.onBoundChange
    $(form).undelegate ":input", "keyup", this.onBoundChange

  # Bind record to a form. All changes to input/select/textarea fields will automatically update the
  # attributes on a record.
  # post.bindTo "#post_form"
  bindTo: (form) ->
    self = this
    $(form).delegate ":input", "change", {record: this}, this.onBoundChange
    $(form).delegate ":input", "keyup", {record: this}, this.onBoundChange

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