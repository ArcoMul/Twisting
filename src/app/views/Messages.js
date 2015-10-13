"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    messagesTemplate = _.template(require("../templates/messages.html")),
    conversationTemplate = _.template(require("../templates/conversation.html")),
    Twister = require("../Twister"),
    UserModel = require('../models/User'),
    UserCollection = require('../collections/users'),
    ConversationModel = require('../models/Conversation'),
    ConversationCollection = require('../collections/conversations'),
    MessageModel = require('../models/Message'),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    users: null,
    conversations: null,

    events: {
        'click .conversation-list .message': 'openConversation'
    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.render();

        this.users = new UserCollection();
        this.conversations = new ConversationCollection();

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
                            var user = self.users.findWhere({username: username});
                            if (!user) {
                                user = new UserModel({username: username});
                                self.users.add(user);
                            }
                            c.addUser(user);
                        });
                        self.conversations.add(c);
                    });
                    next();
                });
            },
            messages: ['following', 'groups', function (next) {
                Twister.getMessages(app.user.get('username'), 1, aliases, function (err, data) {
                    if (err) return next(err);
                    _.each(data, function (messages, alias) {
                        var conversation = self.conversations.findWhere({alias: alias});
                        // Direct messages don't have a conversation yet
                        // group messages do
                        if (!conversation) {
                            conversation = new ConversationModel();
                            self.conversations.add(conversation);
                        }
                        if (!conversation.isGroupConversation()) {
                            var user = self.users.findWhere({username: alias});
                            if (!user) {
                                user = new UserModel({username: alias});
                                self.users.add(user);
                            }
                            conversation.addUser(user);
                        }
                        var fromUser = self.users.findWhere({username: messages[0].from});
                        if (!fromUser) {
                            fromUser = new UserModel({username: alias});
                            self.users.add(fromUser);
                        }
                        conversation.addMessage(new MessageModel().parse(messages[0], fromUser));
                    });
                    next();
                });
            }]
        }, function (err, results) {
            if (err) return console.error('Error getting direct and group messages', err);
            self.conversations.sort();
            self.render();
        });
    },

    openConversation: function (e) {
        var self = this;
        var $conversation = $(e.currentTarget);
        var cid = $conversation.attr('data-cid');
        var conversation = this.conversations.get(cid);
        if (conversation.get('messages').length < 10) {
            conversation.fetchMessages(app.user.get('username'), 10, function (err, conversation) {
                if (err) return console.error('Error fetching messages for conversation');
                self.renderConversation(conversation);
            });
        }
    },

    renderConversation: function (conversation) {
        this.$conversation.html(conversationTemplate({
            conversation: conversation
        }));
        this.$conversation.scrollTop(this.$conversation[0].scrollHeight);
    },

    render: function() {
        this.$el.html(messagesTemplate({
            conversations: this.conversations
        }));
        this.$conversation = this.$el.find('#conversation').first();
        return this;
    }
});
