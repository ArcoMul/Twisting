"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    app = require("../app"),
    _ = require("underscore");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        'click .close-button': 'onClose'
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.render();
        new (this.options.childView)(_.extend({el: this.$content}, this.options.options));
    },

    onClose: function () {
        var self = this;
        this.$el.one('webkitAnimationEnd', function(e) {
            self.remove();
        });
        this.$el.addClass('close');
    },

    render: function() {
        this.$el.html('<div><div class="close-button">&times;</div><div class="content-holder"><div class="content"></div></div></div>');
        this.$content = this.$el.find('.content');
        return this;
    }
});
