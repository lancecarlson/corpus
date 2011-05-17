# Corpus

Corpus.js is a Javascript framework written entirely in CoffeeScript that makes it easy to develop large client side web applications without too much overhead.

## Features

* Light-weight URL Routing. (Does not support hashbang urls.. yet)
* Conventions for maintaining views
* Models for persisting state
* Written entirely in coffeescript
* Currently developed with a RESTful ruby on rails backend in mind, but can be expanded for others.

## Dependencies

* JQuery 1.4+ (http://docs.jquery.com/Downloading_jQuery)
* Underscore (http://documentcloud.github.com/underscore/)

## Routing/Controllers

You can choose to use corpus routing or not. Presently it's only purpose is to load specific views/models when a specific page is loaded. This is helpful for consolidating behavior per page rather than having all of your JQuery selectors running on every page. 

### Example (posts.coffee)

```coffeescript
$ -> 
  # Only runs the PostView.Form view when the /posts/new or /posts/:id/edit urls are requested
  _.each ["/posts/new", "/posts/:id/edit"], (route) ->
    $.R route, (id) ->
      post = new Post()
      new PostView.Form(post)

  # Only runs the PostView.Index view when the /posts url is requested
  $.R "/posts", -> new PostView.Index(post)
```

## Models

To maintain state in the browser, Corpus provides a light-weight model layer that is similar to the popular server-side framework Ruby on Rails. Some of the features it provides are:

* Key, value attributes management (managed attribute changes too)
* Record UID's as well as database ID management
* Associations
* Persistence with a RESTful backend
* Event system
* Collections

### Example 

#### post.coffee

```coffeescript
this.Post = Model "post"
Post.hasMany "comments"
Post.hasOne "user"

_.extend Post.prototype,
  initialize: (attributes) ->
    this.bind "save:before", this.onBeforeSave

  onBeforeSave: ->
    # do something

  createdAt: ->
    this.get("created_at")

  authorName: ->
    this.user.name()
```

#### comment.coffee

```coffeescript
this.Comment = Model "comment"
```

This allows you to do the following:

```coffeescript
post = new Post
post.set("body", "Lorem ipsum...")
comment = new Comment(body: "Some Comment")
post.comments.add comment
post.save
  success:
    # Do whatever
  error:
    # Validation errors
```

The json will look like:

```javascript
{ 
  body: "Lorem Ipsum",
  comments: [
    body: "Lorem Ipsum"
  ]
}
```

## Views:

There is no special constant/class to extend for views. We merely use a convention at this point. In the future we may offer a constant/class you can extend for additional assistance but for now, the convention we've adopted has worked pretty well.

### Example:

```coffeescript
this.PostView.Form = (post) ->
  view = this
  $("#post_form").submit ->
    self = this
    post.save
      success: (respPost) ->
        if post.isNew
          post = respPost
        if $(self).data("redirect")
          document.location.href = $(self).data("redirect")
        $(self).trigger "saved"
      error: (post) ->
        $("#error_explanation ul").html("")
        messages = _.each post.errors(), (message, value) ->
          $("#error_explanation ul").append("<li>" + value + " " + message + "</li>");
        $("#error_explanation").show()
```

## Recommended project directory structure using Barista + Ruby on Rails:

If you're using jammit with barista, you should use something like this:

```
app/coffeescripts/controllers/     # all of your controllers go here
app/coffeescripts/models/          # all of your models go here
app/coffeescripts/views/           # all of your views go here
app/coffeescripts/vendor/          # all of your vendor files like model.coffee and route.coffee go here
app/coffeescripts/lib/             # all if your library files like underscore.inflection.coffee go here
```

If you're using barista, this should generate each of the above directories inside of public/javascripts/.

## Recommended project directory structure using Rails 3:

-- Coming Soon --