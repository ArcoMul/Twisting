"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    mainPageTemplate = _.template(require("../templates/main-page.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el: '#main-page',

    $context: null,
    $content: null,
    currentContextView: null,
    currentContentView: null,

    initialize: function() {
        var self = this;
        this.render();
        this.$context = this.$el.children('#context-section');
        this.$content = this.$el.children('#content-section');
        this.$overlay = $("#overlay-holder");

        $("#main-scrollable").scroll(function () {
            self.$context.children().first().css({top: $(this).scrollTop()});    
        });
    },

    switchContextView: function (view) {
        if (this.currentContextView) {
            this.currentContextView.remove();
        }
        this.$context.html('<div></div>');
        this.currentContextView = view;
        this.currentContextView.setElement(this.$context.children().first());
        this.currentContextView.render();
    },

    switchContentView: function (view) {
        if(this.currentContentView) {
            this.currentContentView.remove();
        }
        this.$content.html('<div />');
        this.currentContentView = view;
        this.currentContentView.setElement(this.$content.children().first());
        this.currentContentView.render();
    },

    showOverlay: function (view) {
        this.$overlay.html('<div />');
        view.setElement(this.$overlay.children().first());
        view.render();
    },

    render: function() {
        this.$el.html(mainPageTemplate());
        return this;
    }
});
