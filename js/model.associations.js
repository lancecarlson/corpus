(function() {
  this.Model.Associations = {
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
  };
}).call(this);
