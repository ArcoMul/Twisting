"use strict";

// External dependencies.
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    async = require("async"),
    Twister = require("../Twister"),
    MessagesCollection = require("../collections/messages"),
    UserCollection = require("../collections/users");

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

    addUser: function (user) {
        this.get('users').add(user);
    },

    addMessage: function (message) {
        this.get('messages').add(message);
        this.set('lastMessage', this.get('messages').at(this.get('messages').length - 1));
    }

});
