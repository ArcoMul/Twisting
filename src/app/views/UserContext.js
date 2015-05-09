"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    userContextTemplate = _.template(require("../templates/context-user.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
    },

    initialize: function() {

    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    render: function() {
        console.log("Render user profile context");
        this.$el.html(userContextTemplate({user: this.model}));
        return this;
    }
});
