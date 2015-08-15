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
        'click .confirm-button': 'onConfirm',
        'click .cancel-button': 'onCancel'
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.render(options);
    },

    onConfirm: function () {
        if(this.options.onConfirm) this.options.onConfirm();
        this.remove();
    },

    onCancel: function () {
        if(this.options.onCancel) this.options.onCancel();
        this.remove();
    },

    render: function() {
        this.$el.html('<div class="bg"><div class="popup"><div class="top"><p>'
            +this.options.texts.main
            +'</p></div><div class="bottom"><button class="cancel-button">'
            +this.options.texts.cancel
            +'</button><button class="confirm-button">'
            +this.options.texts.confirm+'</button></div></div></div>'
        );
        return this;
    }
});
