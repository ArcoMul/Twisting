"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    app = require("../app"),
    settingsTemplate = _.template(require("../templates/settings.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    initialize: function() {
        this.render();
    },

    render: function() {
        this.$el.html(settingsTemplate({
            username: app.user.get('username')
        }));
        return this;
    }

});

