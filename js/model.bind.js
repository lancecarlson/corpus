(function() {
  this.Model.Bind = {
    unbindFrom: function(form) {
      $(form).undelegate(":input", "change", this.onBoundChange);
      return $(form).undelegate(":input", "keyup", this.onBoundChange);
    },
    bindTo: function(form) {
      var self;
      self = this;
      $(form).delegate(":input", "change", {
        record: this
      }, this.onBoundChange);
      return $(form).delegate(":input", "keyup", {
        record: this
      }, this.onBoundChange);
    },
    onBoundChange: function(e) {
      var el, keys, record, value;
      el = $(e.target);
      record = e.data.record;
      value = el.val();
      keys = record._parseNameField(el);
      keys.shift();
      return record._parseAttributeKeys(keys, value);
    },
    _parseAttributeKeys: function(keys, value) {
      var key;
      if (keys.length === 1) {
        key = keys[0];
        return this.attr(key, value);
      } else if (keys.length > 1) {
        return this._parseAssociationKeys(keys, value);
      }
    },
    _parseAssociationKeys: function(keys, value) {
      var assoc, key, obj, uid;
      assoc = keys.shift().replace("_attributes", "");
      uid = keys.shift();
      key = keys[0];
      if (!this[assoc]._object) {
        obj = this[assoc].findByUid(uid);
      } else {
        obj = this[assoc]._object;
      }
      return obj._parseAttributeKeys(keys, value);
    },
    _parseNameField: function(el) {
      return _.map(el.attr("name").split("["), function(p) {
        return p.replace("]", "");
      });
    }
  };
}).call(this);
