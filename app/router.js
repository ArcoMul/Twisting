"use strict";

// External dependencies.
var gui = window.require('nw.gui');
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
        if (this.isExternal(url)) {
            gui.Shell.openExternal(url);
        } else {
            Backbone.history.loadUrl(url);
        }
    },
    
    isExternal: function (url) {
        var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
        if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== window.location.protocol) return true;
        if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[window.location.protocol]+")?$"), "") !== window.location.host) return true;
        return false;
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
