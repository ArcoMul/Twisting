"use strict";

// External dependencies.
var Backbone = require("backbone"),
    $ = require("jquery"),
    app = require("./app"),
    UserModel = require("./models/User"),
    UserContentView = require("./views/UserContent"),
    UserContextView = require("./views/UserContext"),
    FeedContentView = require("./views/FeedContent"),
    FeedContextView = require("./views/FeedContext"),
    MentionsContentView = require("./views/MentionsContent"),
    MentionsContextView = require("./views/MentionsContext"),
    StatusOverlayView = require("./views/StatusOverlay"),
    LoginOverlayView = require("./views/LoginOverlay"),
    AccountsOverlayView = require("./views/AccountsOverlay"),
    NotYetImplementedOverlayView = require("./views/NotYetImplementedOverlay");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Router.extend({

    navigate: function (url) {
        Backbone.history.loadUrl(url);
    },

    routes: {
        "index.html": "index",
        "start": "start",
        "login": "login",
        "choose-account": "chooseAccount",
        "user/:user": "user",
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
    
    user: function(user) {
        var user = new UserModel({username: user});
        app.mainView.switchContextView(new UserContextView({model: user, parent: app.mainView}));
        app.mainView.switchContentView(UserContentView, {model: user, parent: app.mainView});
    },

    feed: function () {
        app.mainView.switchContextView(new FeedContextView({parent: app.mainView}));
        app.mainView.switchContentView(FeedContentView, {parent: app.mainView});
    },

    mentions: function () {
        app.mainView.switchContextView(new MentionsContextView({parent: app.mainView}));
        app.mainView.switchContentView(MentionsContentView, {parent: app.mainView});
    },

    notYetImplemented: function () {
        app.mainView.showOverlay(new NotYetImplementedOverlayView()); 
    }
});
