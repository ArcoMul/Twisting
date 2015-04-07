"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var _ = require("underscore");
var notYetImplementedTemplate = _.template(require("../templates/not-yet-implemented.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        this.setElement($("#main-page"));
    },

    navigate: function (e) {
        app.router.navigate(e.target.pathname, {trigger: true});
        e.preventDefault();
    },

    render: function() {
        this.$el.html(notYetImplementedTemplate());
        return this;
    }
});
