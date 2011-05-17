Features:

* Light-weight URL Routing. (Does not support hashbang urls.. yet)
* Conventions for maintaining views
* Models for persisting state
* Written entirely in coffeescript
* Currently developed with a RESTful rails backend in mind, but can be expanded for others.

Dependencies:

* JQuery (http://docs.jquery.com/Downloading_jQuery)
* Underscore (http://documentcloud.github.com/underscore/)

Routing:

You can choose to use corpus routing or not. Presently it's only purpose is to load specific views/models when a specific page is loaded. This is helpful for consolidating behavior per page rather than having all of your JQuery selectors running on every page. 

Example (posts.coffee):

$ -> 
  _.each ["/posts/new", "/posts/:id/edit"], (route) ->
    $.R route, (id) ->
      post = new Post()
      new PostView.Form(post)

  $.R "/posts", -> new PostView.Index(post)

