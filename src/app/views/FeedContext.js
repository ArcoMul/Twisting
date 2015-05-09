"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    feedContextTemplate = _.template(require("../templates/context-feed.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        var self = this;

        this.options = {};

        Twister.getTrendingHashtags(10, function (err, tags) {
            if (err) return console.error('Error getting hashtags:', err);
            self.options.tags = tags;
            self.render();
        });
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    render: function() {
        this.$el.html(feedContextTemplate({_: _, options: this.options}));
        return this;
    }
});

