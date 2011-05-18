(function() {
  var methods;
  this.Model = function(name, options, func) {
    var model;
    model = function(attributes) {
      var self;
      self = this;
      this._refresh(attributes);
      this._errors = {};
      this._parent = {};
      this._model = model;
      this._name = name;
      this._json = {};
      this._uid = _.uniqueId("" + this._name + "_");
      this.initialize(attributes);
      return this;
    };
    Model.Module.extend.call(model, Model.Module);
    model._name = name;
    model.include(Model.Events);
    model.include(Model.Base);
    model.include(Model.Attributes);
    model.include(Model.Persistence);
    return model;
  };
  this.Model.One = function(name) {
    this._name = name;
    this._fake = true;
    return this;
  };
  _.extend(Model.One.prototype, {
    build: function() {
      var record;
      record = eval("new " + (_.classify(this._name)));
      if (this.parent()) {
        record._parent = this.parent();
      }
      return this._object = record;
    },
    clear: function() {
      return this.parent()[this._name] = this;
    },
    parent: function() {
      return this._parent;
    }
  });
  this.Model.Collection = function(name) {
    this._name = _.singularize(name);
    this._options = {};
    this._reset();
    this.url = this.getUrl(name);
    this.bind("change", this._change);
    this.bind("add", function(collection) {
      return this.trigger("refresh", [collection]);
    });
    this.bind("remove", function(collection) {
      return this.trigger("refresh", [collection]);
    });
    this._uid = _.uniqueId("" + this._name + "_");
    return this;
  };
  _.extend(Model.Collection.prototype, Model.Events, {
    getUrl: function() {
      return "/" + (_.pluralize(this._name));
    },
    add: function(records) {
      if (_.isArray(records)) {
        return _.each(records, function(record) {
          return this._add(record);
        }, this);
      } else {
        return this._add(records);
      }
    },
    clear: function() {
      return this.records = [];
    },
    remove: function(records) {
      if (_.isArray(records)) {
        return _.each(records, function(record) {
          return this._remove(record);
        }, this);
      } else {
        return this._remove(records);
      }
    },
    _change: function(record) {
      var self;
      self = this;
      return _.each(record._changes, function(value, key) {
        var current_model_name, index_id, name;
        index_id = record.tagId();
        current_model_name = _.pluralize(record._name);
        name = '[name="' + self.parent()._name + ("[" + current_model_name + "_attributes][" + index_id + "][" + key + "]") + '"]';
        return $(name).val(value);
      });
    },
    parent: function() {
      return this._parent;
    },
    get: function(id) {
      if (_.isNull(id)) {
        return null;
      }
      return this._byId[!_.isNull(id.id) ? id.id : id];
    },
    refresh: function(records) {
      this._reset();
      this.add(records);
      this.trigger("refresh", [this]);
      return this;
    },
    fetch: function(params) {
      this.query({
        data: params
      });
      return this;
    },
    findByUid: function(uid) {
      return _.detect(this.records, function(record) {
        return record.uid() === uid;
      });
    },
    removeByUid: function(uid) {
      var record;
      record = this.findByUid(uid);
      if (record) {
        return this._remove(record);
      }
    },
    query: function(options) {
      var collection, success;
      this._options = options || (options = {});
      collection = this;
      success = options.success;
      options.success = function(resp, status, xhr) {
        collection.refresh(resp);
        if (success) {
          return success(collection, resp);
        }
      };
      Model.Sync(this, "read", options);
      return this;
    },
    toJSON: function() {
      return this._options;
    },
    pluck: function(attr) {
      return _.map(this.records, function(record) {
        return record.get(attr);
      });
    },
    _add: function(record) {
      var attr;
      if (!record._name) {
        attr = record;
        record = eval("new " + (_.classify(this._name)));
        record._refresh(attr);
      }
      this._bindRecordEvents(record);
      if (this.parent()) {
        record._parent = this.parent();
      }
      this.records.push(record);
      this.length++;
      this.trigger("add", [record]);
      return record;
    },
    _remove: function(record) {
      var index;
      index = this.records.indexOf(record);
      this.records.splice(index, 1);
      this.trigger("remove", [record]);
      this.trigger("change", [record]);
      return this.length--;
    },
    _reset: function() {
      this.length = 0;
      this.records = [];
      return this._byId = {};
    },
    _bindRecordEvents: function(record) {
      var collection;
      collection = this;
      return record.bind("change", function() {
        return collection.trigger("change", [record]);
      });
    }
  });
  methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  _.each(methods, function(method) {
    return Model.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.records].concat(_.toArray(arguments)));
    };
  });
}).call(this);
