"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var app = require("../app");
var moment = require("moment");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({
    defaults: {
        message: null,
        time: null,
        user: null,
        retwist: false
    },

    getMessageRegexed: function () {
        if (!this.get('message')) return "";
        return this.get('message').replace( /(^|[^@\w])@(\w{1,15})\b/g, '$1<a class="username" href="/user/$2">$2</a>' );
    },

    getTimeAgo: function ()
    {
        return moment(this.get('time') * 1000).fromNow();
    }
});
