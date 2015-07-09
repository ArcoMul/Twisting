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

    events: {
        "click a": "navigate",
        "click .user": "choose"
    },

    initialize: function() {
        var self = this;

        this.render();

        Twister.getUsers(function (err, users) {
            console.log('received users', users);
            self.users = {};
            _.each(users, function (username) {
                var user = new UserModel({username: username});
                user.fetchAvatar(function (err) {
                    self.$el.find('.user[data-user=' + user.get('username') + ']').children('img').attr('src', user.get('avatar'));
                });
                self.users[username] = user;
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
