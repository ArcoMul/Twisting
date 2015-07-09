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
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.render();
        this.childView = new (this.options.childView)(_.extend({el: this.$content}, this.options.options));
        this.childView.on("close", function () {
            if (self.childView.onClose) {
                self.childView.onClose();
            }
            self.remove();
        });
    },

    render: function() {
        this.$el.html('<div class="overlay"><div class="inner"></div></div>');
        this.$content = this.$el.find('.inner');
        return this;
    }
});
