(function() {
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
}).call(this);
