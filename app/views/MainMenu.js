"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var app = require("../app");
var _ = require("underscore");
var mainMenuTemplate = _.template(require("../templates/main-menu.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        this.setElement($("#main-menu"));
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    render: function() {
        this.$el.html(mainMenuTemplate({user: this.model}));
        return this;
    }
});
