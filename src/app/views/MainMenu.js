"use strict";

// External dependencies.
var gui = window.require('nw.gui'),
    $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    app = require("../app"),
    mainMenuTemplate = _.template(require("../templates/main-menu.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el: "#main-menu",

    maximized: false,

    events: {
        "click a": "navigate",
        "click .window-close": "closeWindow",
        "click .window-minimize": "minimizeWindow",
        "click .window-scale": "scaleWindow",
    },

    initialize: function() {
        var self = this;
        this.render();

        this.on('userChange', function (user) {
            this.model = user;
            this.render();
            this.loadAvatar();
        }, this);

        if (this.model) {
            this.loadAvatar();
        }

        app.dispatcher.on('new-mentions', function (options) {
            self.showNewMentions();
        });
        app.dispatcher.on('mentions-seen', function (options) {
            self.hideNewMentions();
        });
    },

    closeWindow: function () {
        gui.Window.get().close();
    },

    minimizeWindow: function () {
        gui.Window.get().minimize();
    },

    scaleWindow: function () {
        if (this.maximized) {
            gui.Window.get().unmaximize();
            this.maximized = false;
        } else {
            gui.Window.get().maximize();
            this.maximized = true;
        }
    },

    showNewMentions: function () {
        this.$el.find('.mentions .dot').show();
    },
    hideNewMentions: function () {
        this.$el.find('.mentions .dot').hide();
    },

    loadAvatar: function () {
        this.model.fetchAvatar(function () {
            this.$el.find('.user-profile').css({'background-image': 'url(' + this.model.get('avatar') + ')'});
        }.bind(this));
    },

    navigate: function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        app.router.load($(e.currentTarget).attr('href'));
    },

    render: function() {
        this.$el.html(mainMenuTemplate({user: this.model}));
        return this;
    }
});
