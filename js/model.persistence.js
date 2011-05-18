(function() {
  this.Model.Persistence = {
    errors: function() {
      return this._errors;
    },
    resetErrors: function() {
      return this._errors = {};
    },
    toJSON: function(options) {
      this._json[this._name] = _.clone(this.attributes());
      this.trigger("data:finished", [this]);
      return this._json;
    },
    getUrl: function(method) {
      var path;
      path = _.pluralize("/" + this._name);
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
    }
  };
}).call(this);
