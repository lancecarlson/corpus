(function() {
  var methods, _s;
  this.Model = function(name, options, func) {
    var model;
    model = function(attributes) {
      var self;
      self = this;
      this._tagId = null;
      this._refresh(attributes);
      this._errors = {};
      this._parent = {};
      this._name = name;
      this._json = {};
      this._uid = _.uniqueId("" + this._name + "_");
      this.bind("change", this._change);
      this.bind("data:format", this.toData);
      _.each(model.listAssociations(), function(associationName) {
        return self[associationName]._parent = self;
      });
      this.initialize(attributes);
      return this;
    };
    model._name = name;
    _.extend(model.prototype, Model.Events, {
      initialize: function() {},
      modelName: function() {
        return "" + (_.classify(this._name));
      },
      attributes: function() {
        return this._attributes;
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
        this._parseAssociations(attributes);
        this._prevAttributes = _.clone(this._attributes);
        this._changes = {};
        this.attr(attributes);
        return this._changes = {};
      },
      _parseAssociations: function(attributes) {
        return _.each(model._manyAssociations, function(assoc) {
          var val;
          val = attributes[assoc];
          delete attributes[assoc];
          return _.each(val, function(attrs) {
            var instance;
            instance = eval("new " + (_.classify(assoc)));
            instance._refresh(attrs);
            instance._parent = this;
            return this[assoc].add(instance);
          }, this);
        }, this);
      },
      get: function(key) {
        return this._attributes[key];
      },
      set: function(key, value) {
        var k, v, _results;
        if (_.isString(key) || _.isNumber(key)) {
          if (model._sanitizers[key]) {
            value = model._sanitizers[key].call(this, value);
          }
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
      },
      id: function() {
        return this.get("id");
      },
      uid: function() {
        return this._uid;
      },
      isNew: function() {
        return !_.isNumber(this.id());
      },
      errors: function() {
        return this._errors;
      },
      resetErrors: function() {
        return this._errors = {};
      },
      parent: function() {
        return this._parent;
      },
      tagId: function() {
        return this._tagId;
      },
      toJSON: function(options) {
        var baseObj;
        baseObj = options && options.child ? this._json = _.clone(this.attributes()) : this._json[model._name] = _.clone(this.attributes());
        this.trigger("data:format", [this]);
        _.each(model._manyAssociations, function(association) {
          return model.prototype[association].each(function(child) {
            var childKey;
            childKey = "" + association + "_attributes";
            if (!baseObj[childKey]) {
              baseObj[childKey] = [];
            }
            return baseObj[childKey].push(child.toJSON({
              child: true
            }));
          }, this);
        }, this);
        _.each(model._oneAssociations, function(association) {
          var child;
          child = model.prototype[association];
          if (!child._fake) {
            return this._json[model._name]["" + association + "_attributes"] = child.toJSON({
              child: true
            });
          }
        }, this);
        return this._json;
      },
      getUrl: function(method) {
        var path;
        path = _.pluralize("/" + model._name);
        if (!this.isNew()) {
          path = "" + path + "/" + (this.id());
        }
        return path;
      },
      save: function(options) {
        var error, method, record, success;
        method = this.isNew() ? "create" : "update";
        record = this;
        options || (options = {});
        success = options.success;
        error = options.error;
        options.success = function(resp, status, xhr) {
          record.resetErrors();
          if (!_.isEmpty(resp)) {
            record.attr("id", resp["id"]);
          }
          success(record, resp, xhr);
          return record.trigger("save:after", [record]);
        };
        options.error = function(resp, status, xhr) {
          record._errors = $.parseJSON(resp.responseText);
          if (error) {
            error(record, resp, xhr);
          }
          return record.trigger("save:after", [record]);
        };
        record.trigger("save:before", [record]);
        return Model.Sync(record, method, options);
      },
      toData: function() {}
    });
    _.extend(model, {
      _manyAssociations: [],
      _oneAssociations: [],
      _sanitizers: {},
      listAssociations: function() {
        return this._manyAssociations.concat(this._oneAssociations);
      },
      hasMany: function(name, options) {
        var collection, manyArray;
        this._manyAssociations.push(name);
        manyArray = {};
        collection = new Model.Collection(name);
        if (options && options.extend) {
          _.extend(collection, options.extend);
        }
        manyArray[name] = collection;
        return _.extend(model.prototype, manyArray);
      },
      hasOne: function(name) {
        var association, oneObj;
        this._oneAssociations.push(name);
        association = new Model.One(name);
        oneObj = {};
        oneObj[name] = association;
        oneObj["build_" + name] = function() {
          return association.build();
        };
        oneObj["clear_" + name] = function() {
          return association.clear();
        };
        return _.extend(model.prototype, oneObj);
      },
      sanitize: function(key, callback) {
        return this._sanitizers[key] = callback;
      },
      newCollection: function() {
        return new Model.Collection(this._name);
      },
      fetch: function(params) {
        return model.newCollection().fetch(params);
      },
      query: function(options) {
        return model.newCollection().query(options);
      }
    });
    return model;
  };
  this.Model.Events = {
    bind: function(event, callback) {
      this.callbacks = this.callbacks || {};
      this.callbacks[event] = this.callbacks[event] || [];
      this.callbacks[event].push(callback);
      return this;
    },
    trigger: function(name, data) {
      var callback, callbacks, _i, _len;
      this.callbacks = this.callbacks || {};
      callbacks = this.callbacks[name];
      if (callbacks) {
        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
          callback = callbacks[_i];
          callback.apply(this, data || []);
        }
      }
      return this;
    }
  };
  this.Model.Sync = function(obj, method, options) {
    var data, methodVerbs, params;
    methodVerbs = {
      "create": "POST",
      "update": "PUT",
      "delete": "DELETE",
      "read": "GET"
    };
    params = _.extend({
      type: methodVerbs[method],
      contentType: "application/json",
      dataType: "json",
      processData: method === "read" ? true : false
    }, options);
    params.url = obj.getUrl(method);
    if (!options.data) {
      data = JSON.stringify(obj.toJSON());
      if (data !== "{}") {
        params.data = data;
      }
    }
    return $.ajax(params);
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
    removeAll: function() {
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
    findByTagId: function(tag_id) {
      return _.detect(this.records, function(element) {
        return element.tagId() === parseInt(tag_id);
      });
    },
    removeByTagId: function(tag_id) {
      var record;
      record = _.detect(this.records, function(element) {
        return element.tagId() === parseInt(tag_id);
      });
      if (record) {
        return this._remove(record);
      }
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
  jQuery.R = function(route, callback) {
    var args, escapeRegExp, fn, namedParam, pathname, splatParam;
    pathname = document.location.pathname;
    namedParam = /:([\w\d]+)/g;
    splatParam = /\*([\w\d]+)/g;
    escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
    fn = {
      _routeToRegExp: function(route) {
        route = route.replace(escapeRegExp, "\\$&").replace(namedParam, "([^\/]*)").replace(splatParam, "(.*?)");
        return new RegExp('^' + route + '$');
      },
      _extractParameters: function(route, fragment) {
        return route.exec(fragment).slice(1);
      }
    };
    if (!_.isRegExp(route)) {
      route = fn._routeToRegExp(route);
    }
    if (route.test(pathname)) {
      args = fn._extractParameters(route, pathname);
      return callback.apply(this, args);
    }
  };
  _s = {
    uncountable_words: ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news'],
    plural_rules: [[new RegExp('(m)an$', 'gi'), '$1en'], [new RegExp('(pe)rson$', 'gi'), '$1ople'], [new RegExp('(child)$', 'gi'), '$1ren'], [new RegExp('^(ox)$', 'gi'), '$1en'], [new RegExp('(ax|test)is$', 'gi'), '$1es'], [new RegExp('(octop|vir)us$', 'gi'), '$1i'], [new RegExp('(alias|status)$', 'gi'), '$1es'], [new RegExp('(bu)s$', 'gi'), '$1ses'], [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'], [new RegExp('([ti])um$', 'gi'), '$1a'], [new RegExp('sis$', 'gi'), 'ses'], [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'], [new RegExp('(hive)$', 'gi'), '$1s'], [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'], [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'], [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'], [new RegExp('([m|l])ouse$', 'gi'), '$1ice'], [new RegExp('(quiz)$', 'gi'), '$1zes'], [new RegExp('s$', 'gi'), 's'], [new RegExp('$', 'gi'), 's']],
    singular_rules: [[new RegExp('(m)en$', 'gi'), '$1an'], [new RegExp('(pe)ople$', 'gi'), '$1rson'], [new RegExp('(child)ren$', 'gi'), '$1'], [new RegExp('([ti])a$', 'gi'), '$1um'], [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', 'gi'), '$1$2sis'], [new RegExp('(hive)s$', 'gi'), '$1'], [new RegExp('(tive)s$', 'gi'), '$1'], [new RegExp('(curve)s$', 'gi'), '$1'], [new RegExp('([lr])ves$', 'gi'), '$1f'], [new RegExp('([^fo])ves$', 'gi'), '$1fe'], [new RegExp('([^aeiouy]|qu)ies$', 'gi'), '$1y'], [new RegExp('(s)eries$', 'gi'), '$1eries'], [new RegExp('(m)ovies$', 'gi'), '$1ovie'], [new RegExp('(x|ch|ss|sh)es$', 'gi'), '$1'], [new RegExp('([m|l])ice$', 'gi'), '$1ouse'], [new RegExp('(bus)es$', 'gi'), '$1'], [new RegExp('(o)es$', 'gi'), '$1'], [new RegExp('(shoe)s$', 'gi'), '$1'], [new RegExp('(cris|ax|test)es$', 'gi'), '$1is'], [new RegExp('(octop|vir)i$', 'gi'), '$1us'], [new RegExp('(alias|status)es$', 'gi'), '$1'], [new RegExp('^(ox)en', 'gi'), '$1'], [new RegExp('(vert|ind)ices$', 'gi'), '$1ex'], [new RegExp('(matr)ices$', 'gi'), '$1ix'], [new RegExp('(quiz)zes$', 'gi'), '$1'], [new RegExp('s$', 'gi'), '']],
    pluralize: function(str) {
      return _s.apply_rules(str, _s.plural_rules, _s.uncountable_words);
    },
    singularize: function(str) {
      return _s.apply_rules(str, _s.singular_rules, _s.uncountable_words);
    },
    classify: function(str) {
      return _.camelize(_.capitalize(_.singularize(str)));
    },
    apply_rules: function(str, rules, skip) {
      var ignore, plurality, regex, rule, _i, _len;
      ignore = skip.indexOf(str.toLowerCase()) > -1;
      if (!ignore) {
        for (_i = 0, _len = rules.length; _i < _len; _i++) {
          rule = rules[_i];
          regex = rule[0], plurality = rule[1];
          if (str.match(regex)) {
            str = str.replace(regex, plurality);
            break;
          }
        }
      }
      return str;
    }
  };
  this._.mixin(_s);
}).call(this);
