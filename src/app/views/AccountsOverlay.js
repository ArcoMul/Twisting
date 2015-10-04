"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    UserModel = require('../models/User'),
    accountsOverlayTemplate = _.template(require("../templates/overlay-accounts.html")),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,
    users: {},

    events: {
        "click a": "navigate",
        "click .user": "choose"
    },

    initialize: function() {
        var self = this;

        this.render();

        // Fetch users from wallet
        Twister.getUsers(function (err, users) {
            _.each(users, function (username) {
                var user = new UserModel({username: username});
                self.users[username] = user;

                // Try to get avatar from disk
                user.fetchAvatarFromDisk(function (err) {
                    if (user.get('avatar')) {
                        self.$el.find('.user[data-user=' + user.get('username') + ']').children('img').attr('src', user.get('avatar'));
                        return;
                    }

                    // Couldn't find avatar on disk, try DHT
                    user.fetchAvatar(function (err) {
                        self.$el.find('.user[data-user=' + user.get('username') + ']').children('img').attr('src', user.get('avatar'));
                    });
                });
            });
            self.render(self.users);
        });
    },

    choose: function (e) {
        var username = $(e.currentTarget).attr('data-user');
        app.changeUser(this.users[username]);
        app.router.navigate('start', {trigger: true});
        this.trigger('close');
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    render: function(users) {
        this.$el.html(accountsOverlayTemplate({_: _, users: users}));
        return this;
    }
});
