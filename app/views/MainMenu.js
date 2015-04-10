"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var app = require("../app");
var _ = require("underscore");
var mainMenuTemplate = _.template(require("../templates/main-menu.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el: "#main-menu",

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        this.render();
        this.model.fetchAvatar(function () {
            console.log('set avatar img', this.model.get('avatar'));
            this.$el.find('.user-profile').css({'background-image': 'url(' + this.model.get('avatar') + ')'});
        }.bind(this));
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
