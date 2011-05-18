(function() {
  this.Model.Module = {
    extend: function(obj) {
      _.extend(this, obj);
      return this;
    },
    include: function(obj) {
      _.extend(this.prototype, obj);
      return this;
    }
  };
}).call(this);
