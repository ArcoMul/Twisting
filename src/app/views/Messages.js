"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    messagesTemplate = _.template(require("../templates/messages.html")),
    Twister = require("../Twister"),
    UserModel = require('../models/User'),
    ConversationModel = require('../models/Conversation'),
    ConversationCollection = require('../collections/conversations'),
    MessageModel = require('../models/Message'),
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
        var conversations = new ConversationCollection();

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            _.each(usernames, function (u) {
                users.push(new UserModel({username: u}));
            });
            Twister.getMessages(app.user.get('username'), 1, usernames, function (err, data) {
                _.each(data, function (messages, username) {
                    var c = new ConversationModel();
                    c.addUser(new UserModel({username: username}));
                    c.addMessage(new MessageModel().parse(messages[0], c.get('users').first()));
                    conversations.add(c);
                });
                self.render(conversations);
            });
        });
    },


    render: function(conversations) {
        this.$el.html(messagesTemplate({
            conversations: conversations
        }));
        return this;
    }
});
