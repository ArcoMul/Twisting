
"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    app = require("../app"),
    twemoji = require('twemoji'),
    moment = require("moment");

Backbone.$ = $;

// Defining the application router.
var MessageModel = module.exports = Backbone.Model.extend({
    defaults: {
        twister_id: null,
        message: null,
        time: null,
        last_time: null,
        user: null
    },

    initialize: function (properties) {

    },

    parse: function (data, user) {
        this.set({
            id: user.get('username') + '_' + data.k,
            user: user,
            message: data.text,
            time: data.time,
            twister_id: data.k
        });

        return this;
    },

    getTimeAgo: function () {
        return moment(this.get('time') * 1000).fromNow();
    }

});
