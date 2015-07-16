"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    notYetImplementedTemplate = _.template(require("../templates/notyetimplemented.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    initialize: function() {
        this.render();
    },

    render: function() {
        this.$el.html(notYetImplementedTemplate());
        return this;
    }

});

