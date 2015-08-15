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
    StartView = require("./views/Start"),
    StatusView = require("./views/Status"),
    LoginView = require("./views/LoginOverlay"),
    AccountsView = require("./views/AccountsOverlay"),
    CreateAccountView = require("./views/CreateAccount"),
    SettingsView = require("./views/Settings"),
    NotYetImplementedView = require("./views/NotYetImplemented");

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
        "account/create": "createAccount",
        "user/:user": "user",
        "user/:user/posts/:post": "postDetail",
        "feed": "feed",
        "status": "status",
        "mentions": "mentions",
        "messages": "notYetImplemented",
        "tags": "notYetImplemented",
        "tags/:tag": "notYetImplemented",
        "settings": "settings",
        "logout": "notYetImplemented"
    },

    index: function() {
        app.router.navigate("start", {trigger: true});
    },

    start: function () {
       app.mainView.showOverlay(StartView, {starting: true}); 
    },

    login: function () {
       app.mainView.showOverlay(LoginView); 
    },

    createAccount: function () {
       app.mainView.showOverlay(CreateAccountView); 
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
        if (this.contentView) {
            this.contentView.remove();
        }
        $("#main-content").append('<div />');
        this.contentView = new FeedView({ el: $("#main-content").children().last() });
    },

    settings: function () {
        if (this.contentView) {
            this.contentView.remove();
        }
        $("#main-content").append('<div />');
        this.contentView = new SettingsView({ el: $("#main-content").children().last()});
    },

    status: function () {
        app.mainView.showSlideOverlay(StatusView);
    },

    mentions: function () {
        app.dispatcher.trigger('open-mentions');
    },

    notYetImplemented: function () {
        if (this.contentView) {
            this.contentView.remove();
        }
        $("#main-content").append('<div />');
        this.contentView = new NotYetImplementedView({ el: $("#main-content").children().last()});
    }
});
