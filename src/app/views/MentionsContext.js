"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    mentionsContextTemplate = _.template(require("../templates/context-mentions.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    initialize: function() {

    },

    render: function() {
        this.$el.html(mentionsContextTemplate({user: this.model}));
        return this;
    }
});
