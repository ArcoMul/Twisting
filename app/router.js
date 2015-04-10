"use strict";

// External dependencies.
var gui = window.require('nw.gui'),
    Backbone = require("backbone"),
    $ = require("jquery"),
    app = require("./app"),
    UserModel = require("./models/User"),
    UserContentView = require("./views/UserContent"),
    UserContextView = require("./views/UserContext"),
    FeedContentView = require("./views/FeedContent"),
    FeedContextView = require("./views/FeedContext"),
    NotYetImplementedView = require("./views/NotYetImplemented");

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
        app.router.navigate("user/" + app.user.get('username'), {trigger: true});
    },
    
    user: function(user) {
        var user = new UserModel({username: user});
        app.mainView.switchContextView(new UserContextView({model: user}));
        app.mainView.switchContentView(new UserContentView({model: user}));
    },

    feed: function () {
        app.mainView.switchContextView(new FeedContextView());
        app.mainView.switchContentView(new FeedContentView());
    },

    notYetImplemented: function () {
        var view = new NotYetImplementedView();
        view.render();
    }
});
