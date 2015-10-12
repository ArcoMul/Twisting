"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    messagesTemplate = _.template(require("../templates/messages.html")),
    Twister = require("../Twister"),
    UserModel = require('../models/User'),
    UserCollection = require('../collections/users'),
    ConversationModel = require('../models/Conversation'),
    ConversationCollection = require('../collections/conversations'),
    MessageModel = require('../models/Message'),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    messages: null,

    events: {
        'click .conversation-list .conversation': 'openConversation'
    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.render();

        var users = new UserCollection();
        var conversations = new ConversationCollection();

        var aliases = [];

        async.auto({
            following: function (next) {
                Twister.getFollowing(app.user.get('username'), function (err, usernames) {
                    if (err) return next(err);
                    _.each(usernames, function (u) {
                        aliases.push(u);
                    });
                    next();
                });
            },
            groups: function (next) {
                Twister.getGroups(app.user.get('username'), function (err, groups) {
                    if (err) return next(err);
                    _.each(groups, function (group) {
                        aliases.push(group.alias);
                        var c = new ConversationModel();
                        c.setGroupAliases(group.alias);
                        _.each(group.members, function (username) {
                            var user = users.findWhere({username: username});
                            if (!user) {
                                user = new UserModel({username: username});
                                users.add(user);
                            }
                            c.addUser(user);
                        });
                        conversations.add(c);
                    });
                    next();
                });
            },
            messages: ['following', 'groups', function (next) {
                Twister.getMessages(app.user.get('username'), 1, aliases, function (err, data) {
                    if (err) return next(err);
                    _.each(data, function (messages, alias) {
                        var conversation = conversations.findWhere({alias: alias});
                        // Direct messages don't have a conversation yet
                        // group messages do
                        if (!conversation) {
                            conversation = new ConversationModel();
                            conversations.add(conversation);
                        }
                        if (!conversation.isGroupConversation()) {
                            var user = users.findWhere({username: alias});
                            if (!user) {
                                user = new UserModel({username: alias});
                                users.add(user);
                            }
                            conversation.addUser(user);
                        }
                        var fromUser = users.findWhere({username: messages[0].from});
                        if (!fromUser) {
                            fromUser = new UserModel({username: alias});
                            users.add(fromUser);
                        }
                        conversation.addMessage(new MessageModel().parse(messages[0], fromUser));
                    });
                    next();
                });
            }]
        }, function (err, results) {
            if (err) return console.error('Error getting direct and group messages', err);
            conversations.sort();
            self.render(conversations);
        });
    },

    openConversation: function (e) {
        var $conversation = $(e.currentTarget);
        console.log($conversation);
    },

    render: function(conversations) {
        this.$el.html(messagesTemplate({
            conversations: conversations
        }));
        return this;
    }
});
