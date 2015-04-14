"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    loginOverlayTemplate = _.template(require("../templates/overlay-login.html")),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,

    events: {
        "click a": "navigate",
        "click button": "login"
    },

    initialize: function() {
        var self = this;
        console.log("Initialize login overlay");

        this.render();

        Twister.getUsers(function (users) {
            console.log('received users', users);
        });
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    login: function (e) {
        e.preventDefault();
        var user = this.$el.find("input[name=username]").val();
        var key = this.$el.find("input[name=key]").val();
        console.log(user,key);
        Twister.importUser(user, key, function (err) {
            if (err) {
                return console.log('Error importing user');
            }

            var dhtRequestFinished = true;
            var interval = setInterval(function () {
                if (!dhtRequestFinished) return;
                dhtRequestFinished = false;
                Twister.getFollowersFromDht(user, function (err, followers) {
                    if (err) {
                        return console.log('Error getting users from DHT');
                    }
                    console.log('DHT followers', followers);
                    if (followers.length > 0) {
                        clearInterval(interval);

                        Twister.follow(user, followers, function (err) {
                            if (err) {
                                return console.log('Error following all retrieved users');
                            }
                            console.log('Everybody followed, lets start!'); 
                            app.router.navigate('feed', {trigger: true});
                        });
                    } else {
                        dhtRequestFinished = true;
                    }
                });
            }, 500);
        });
    },

    render: function() {
        console.log("Render login overlay");
        this.$el.html(loginOverlayTemplate());
        return this;
    }
});
