"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    app = require("../app"),
    settingsTemplate = _.template(require("../templates/settings.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        'change #hide-replies-and-retwists': 'onHideRepliesAndRetiwsts'
    },

    initialize: function() {
        this.render();
    },

    onHideRepliesAndRetiwsts: function () {
        if (this.$el.find('#hide-replies-and-retwists').is(':checked')) {
            window.localStorage[app.user.get('username') + '_hideRepliesAndRetwists'] = true;
        } else {
            window.localStorage[app.user.get('username') + '_hideRepliesAndRetwists'] = false;
        }
    },

    render: function() {
        this.$el.html(settingsTemplate({
            username: app.user.get('username'),
            hideRepliesAndRetwists: window.localStorage[app.user.get('username') + '_hideRepliesAndRetwists'] === 'true'
        }));
        return this;
    }

});
