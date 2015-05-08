"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    app = require("../app"),
    notYetImplementedOverlayTemplate = _.template(require("../templates/overlay-notyetimplemented.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click .close": "close"
    },

    initialize: function() {
        this.render();
    },

    close: function () {
        app.router.navigate('feed', {trigger: true});
        this.remove();
    },

    render: function() {
        this.$el.html(notYetImplementedOverlayTemplate());
        return this;
    }
});

