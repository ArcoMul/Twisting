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

        this.on('userChange', function (user) {
            this.model = user;
            this.render();
            this.loadAvatar();
        }, this);

        if (this.model) {
            this.loadAvatar();
        }
    },

    loadAvatar: function () {
        this.model.fetchAvatar(function () {
            this.$el.find('.user-profile').css({'background-image': 'url(' + this.model.get('avatar') + ')'});
        }.bind(this));
    },

    navigate: function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        app.router.navigate($(e.currentTarget).attr('href'), {trigger: true});
    },

    render: function() {
        this.$el.html(mainMenuTemplate({user: this.model}));
        return this;
    }
});
