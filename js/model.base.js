(function() {
  this.Model.Base = {
    initialize: function() {},
    modelName: function() {
      return "" + (_.classify(this._name));
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
    parent: function() {
      return this._parent;
    }
  };
}).call(this);
