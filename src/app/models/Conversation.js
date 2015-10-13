"use strict";

// External dependencies.
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    async = require("async"),
    app = require("../app"),
    Twister = require("../Twister"),
    MessagesCollection = require("../collections/messages"),
    UserCollection = require("../collections/users"),
    UserModel = require("../models/User"),
    MessageModel = require("../models/Message");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({
    defaults: {
        users: null,
        messages: null,
        lastMessage: null
    },

    initialize: function () {
        this.set('users', new UserCollection());
        this.set('messages', new MessagesCollection());
    },

    setGroupAliases: function (alias) {
        this.set('alias', alias);
    },

    isGroupConversation: function () {
        return this.get('alias') ? true : false;
    },

    addUser: function (user) {
        var self = this;
        this.get('users').add(user);
        user.fetchAvatarFromDisk(function (err) {
            self.trigger('avatarLoaded', user);
        });
    },

    addMessage: function (message) {
        this.get('messages').add(message);
        this.set('lastMessage', this.get('messages').at(this.get('messages').length - 1));
    },

    fetchMessages: function (username, n, done) {
        var self = this;
        var aliases = [];
        if (this.isGroupConversation()) {
            aliases.push(this.get('alias'));
        } else {
            this.get('users').each(function (user) {
                aliases.push(user.get('username'));
            });
        }
        Twister.getMessages(username, n, aliases, function (err, data) {
            if (err) return done(err);
            _.each(data, function (messages, alias) {
                _.each(messages, function (message) {
                    var fromUser = self.get('users').findWhere({username: message.from});
                    if (!fromUser) {
                        fromUser = new UserModel({username: message.from});
                        self.addUser(fromUser);
                    }
                    self.addMessage(new MessageModel().parse(message, fromUser));
                });
            });
            done(null, self);
        });
    },

    getOthers: function () {
        var users = this.get('users').toArray();
        users = _.filter(users, function (u) {
            return u.get('username') !== app.user.get('username');
        });
        return users;
    }

});
