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
        retwist: null
    },

    getMessageRegexed: function () {
        if (!this.get('message')) return "";
        var msg = this.get('message').replace( /(https?:\/\/[^\s]+)/g, function(url) { return '<a href="'+url+'">'+url+'</a>' });
        msg = msg.replace( /(^|[^#\w])#(\w{1,15})\b/g, '$1<a href="hashtag/$2">#$2</a>' );
        msg = msg.replace( /(^|[^@\w])@(\w{1,15})\b/g, '$1<a class="username" href="user/$2">$2</a>' );
        return msg;
    },

    getTimeAgo: function ()
    {
        return moment(this.get('time') * 1000).fromNow();
    }
});
