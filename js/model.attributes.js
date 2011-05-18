(function() {
  this.Model.Attributes = {
    attributes: function() {
      return this._attributes;
    },
    get: function(key) {
      return this._attributes[key];
    },
    set: function(key, value) {
      var k, v, _results;
      if (_.isString(key) || _.isNumber(key)) {
        if (_.isEqual(this._prevAttributes[key], value)) {
          delete this._changes[key];
        } else {
          this._changes[key] = value;
        }
        this._attributes[key] = value;
        return this.trigger("change", [this]);
      } else {
        _results = [];
        for (k in key) {
          v = key[k];
          _results.push(this.set(k, v));
        }
        return _results;
      }
    },
    attr: function(key, value) {
      var argLen;
      argLen = arguments.length;
      if ((_.isUndefined(key) || _.isEmpty(key)) && argLen > 0) {
        return false;
      }
      if (argLen === 0) {
        return this._attributes;
      } else if (argLen === 2) {
        return this.set(key, value);
      } else if (_.isString(key) || _.isNumber(key)) {
        return this.get(key);
      } else {
        return this.set(key);
      }
    },
    changed: function() {
      return this._changes !== {};
    },
    changes: function() {
      return this._changes;
    },
    _change: function(record) {
      return _.each(record._changes, function(value, key) {
        if ($(name).val() !== value) {
          return $(name).val(value);
        }
      });
    },
    _refresh: function(attributes) {
      this._attributes = attributes || (attributes = {});
      this._prevAttributes = _.clone(this._attributes);
      this._changes = {};
      this.attr(attributes);
      return this._changes = {};
    }
  };
}).call(this);
