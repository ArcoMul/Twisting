define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var app = require("app");
    var UserModel = require("models/User");
    var UserProfileView = require("views/UserProfile");
    var NotYetImplementedView = require("views/NotYetImplemented");

    // Defining the application router.
    module.exports = Backbone.Router.extend({
        routes: {
            "index.html": "index",
            "user/:user": "user",
            "feed": "notYetImplemented",
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

        notYetImplemented: function () {
            var view = new NotYetImplementedView();
            view.render();
        }
    });
});
