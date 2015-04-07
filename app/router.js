"use strict";

// External dependencies.
var Backbone = require("backbone");
var $ = require("jquery");
var app = require("./app");
var UserModel = require("./models/User");
var UserProfileView = require("./views/UserProfile");
var FeedView = require("./views/Feed");
var NotYetImplementedView = require("./views/NotYetImplemented");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Router.extend({
    navigate: function (url) {
        console.log('loadUrl', url);
        // Override pushstate and load url directly
        Backbone.history.loadUrl(url);
    },
    routes: {
        "index.html": "index",
        "user/:user": "user",
        "feed": "feed",
        "settings": "notYetImplemented",
        "logout": "notYetImplemented"
    },

    index: function() {
        console.log("Welcome to your / route.");
        app.router.navigate("user/" + app.user.get('username'), {trigger: true});
    },
    
    user: function(user) {
        console.log("User route:", user);
        var view = new UserProfileView({model: new UserModel({username: user})});
        view.render();
    },

    feed: function () {
        var view = new FeedView();
        view.render();
    },

    notYetImplemented: function () {
        var view = new NotYetImplementedView();
        view.render();
    }
});
