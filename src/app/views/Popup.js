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
        'click .close-button': 'onClose',
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.render(options);
    },

    onClose: function () {
        if(this.options.onClose) this.options.onClose();
        this.remove();
    },

    render: function() {
        this.$el.html('<div class="bg"><div class="popup"><div class="top"><p>'
            +this.options.texts.main
            +'</p></div><div class="bottom"><button class="close-button">'
            +this.options.texts.button+'</button></div></div></div>'
        );
        return this;
    }
});
