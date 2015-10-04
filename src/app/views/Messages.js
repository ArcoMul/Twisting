"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    messagesTemplate = _.template(require("../templates/messages.html")),
    Twister = require("../Twister"),
    UserModel = require('../models/User'),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    messages: null,

    events: {

    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.render();

        var users = [];

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            _.each(usernames, function (u) {
                users.push(new UserModel({username: u}));
            });
            Twister.getMessages(app.user.get('username'), 1, usernames, function (err, data) {
                console.log('MESSAGES', data);
            });
        });
    },


    render: function() {
        this.$el.html(messagesTemplate({
            messages: this.message
        }));
        return this;
    }
});
