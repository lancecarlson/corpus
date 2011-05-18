this.Model.Events =
  bind: (event, callback) ->
    this.callbacks = this.callbacks || {}
    this.callbacks[event] = this.callbacks[event] || []
    this.callbacks[event].push(callback)
    this

  trigger: (name, data) ->
    this.callbacks = this.callbacks || {}

    callbacks = this.callbacks[name]

    if callbacks
      for callback in callbacks
        callback.apply(this, data || [])

    this