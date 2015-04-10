"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    feedContextTemplate = _.template(require("../templates/context-feed.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        this.render();
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    render: function() {
        this.$el.html(feedContextTemplate());
        return this;
    }
});

