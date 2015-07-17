"use strict";

// External dependencies.
var Backbone = require("backbone"),
    $ = require("jquery"),
    _ = require("underscore"),
    app = require("./app"),
    UserModel = require("./models/User"),
    UserContentView = require("./views/UserContent"),
    UserContextView = require("./views/UserContext"),
    PostContentView = require("./views/PostContent"),
    FeedView = require("./views/Feed"),
    FeedContentView = require("./views/FeedContent"),
    FeedContextView = require("./views/FeedContext"),
    StatusView = require("./views/Status"),
    LoginView = require("./views/LoginOverlay"),
    AccountsView = require("./views/AccountsOverlay"),
    NotYetImplementedView = require("./views/NotYetImplemented");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Router.extend({

    /*
    load: function (url) {
        Backbone.history.loadUrl(url);
    },
    */

    routes: {
        "index.html": "index",
        "start": "start",
        "login": "login",
        "choose-account": "chooseAccount",
        "user/:user": "user",
        "user/:user/posts/:post": "postDetail",
        "feed": "feed",
        "status": "status",
        "mentions": "mentions",
        "messages": "notYetImplemented",
        "tags": "notYetImplemented",
        "tags/:tag": "notYetImplemented",
        "settings": "notYetImplemented",
        "logout": "notYetImplemented"
    },

    index: function() {
        app.router.navigate("start", {trigger: true});
    },

    start: function () {
       app.mainView.showOverlay(StatusView, {starting: true}); 
    },

    login: function () {
       app.mainView.showOverlay(LoginView); 
    },

    chooseAccount: function () {
       app.mainView.showOverlay(AccountsView); 
    },
    
    user: function (user) {
        var user = new UserModel({username: user});
        app.dispatcher.trigger('open-user-profile', {
            user: user
        });
    },

    feed: function () {
        // TODO: don't use clear, make sure all the view are deleted in the right way
        $("#main-scrollable").html('');
        new FeedView({ el: $("#main-scrollable")});
    },

    status: function () {
        app.mainView.showSlideOverlay(StatusView);
    },

    mentions: function () {
        app.dispatcher.trigger('open-mentions');
    },

    notYetImplemented: function () {
        new NotYetImplementedView({ el: $("#main-scrollable")});
    }
});
