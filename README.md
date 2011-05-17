# Corpus

## Features

* Light-weight URL Routing. (Does not support hashbang urls.. yet)
* Conventions for maintaining views
* Models for persisting state
* Written entirely in coffeescript
* Currently developed with a RESTful rails backend in mind, but can be expanded for others.

## Dependencies

* JQuery (http://docs.jquery.com/Downloading_jQuery)
* Underscore (http://documentcloud.github.com/underscore/)

## Routing/Controllers

You can choose to use corpus routing or not. Presently it's only purpose is to load specific views/models when a specific page is loaded. This is helpful for consolidating behavior per page rather than having all of your JQuery selectors running on every page. 

### Example (posts.coffee)

$ -> 
  # Only runs the PostView.Form view when the /posts/new or /posts/:id/edit urls are requested
  _.each ["/posts/new", "/posts/:id/edit"], (route) ->
    $.R route, (id) ->
      post = new Post()
      new PostView.Form(post)

  # Only runs the PostView.Index view when the /posts url is requested
  $.R "/posts", -> new PostView.Index(post)

## Models

### Example

## Views:

There is no special constant/class to extend for views. We merely use a convention at this point. In the future we may offer a constant/class you can extend for additional assistance but for now, the convention we've adopted has worked pretty well.