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
    StatusOverlayView = require("./views/StatusOverlay"),
    LoginOverlayView = require("./views/LoginOverlay"),
    AccountsOverlayView = require("./views/AccountsOverlay"),
    NotYetImplementedOverlayView = require("./views/NotYetImplementedOverlay");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Router.extend({

    load: function (url) {
        Backbone.history.loadUrl(url);
    },

    routes: {
        "index.html": "index",
        "start": "start",
        "login": "login",
        "choose-account": "chooseAccount",
        "user/:user": "user",
        "user/:user/posts/:post": "postDetail",
        "feed": "feed",
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
       app.mainView.showOverlay(new StatusOverlayView({starting: true})); 
    },

    login: function () {
       app.mainView.showOverlay(new LoginOverlayView()); 
    },

    chooseAccount: function () {
       app.mainView.showOverlay(new AccountsOverlayView()); 
    },
    
    user: function (user) {
        var user = new UserModel({username: user});
        app.dispatcher.trigger('open-user-profile', {
            user: user
        });
        //app.mainView.switchContextView(new UserContextView({model: user, parent: app.mainView}));
        //app.mainView.switchContentView(UserContentView, {model: user, parent: app.mainView});
    },

    postDetail: function(user, post) {
        console.log('postDetail', arguments);
        if (_.isString(user)) {
            user = new UserModel({username: user});
        }
        app.mainView.switchContextView(new UserContextView({model: user, parent: app.mainView}));
        app.mainView.switchContentView(PostContentView, {
            model: post,
            parentPosts: parentPosts
        });
    },

    feed: function () {
        // TODO: don't use clear, make sure all the view are deleted in the right way
        $("#main-scrollable").html('');
        new FeedView({ el: $("#main-scrollable")});
        return;

        app.mainView.switchContextView(new FeedContextView({parent: app.mainView}));
        app.mainView.switchContentView(FeedContentView, {parent: app.mainView});
    },

    mentions: function () {
        app.dispatcher.trigger('open-mentions');
    },

    notYetImplemented: function () {
        app.mainView.showOverlay(new NotYetImplementedOverlayView()); 
    }
});
