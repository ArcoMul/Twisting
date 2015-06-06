"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    app = require("../app"),
    postContentTemplate = _.template(require("../templates/content-post.html")),
    postTemplate = _.template(require("../templates/post.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {

    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.user = options.user;
        this.replies = options.replies;
        this.parentPosts = options.parentPosts;
        
        this.render();
    },

    render: function() {
        this.$el.html(postContentTemplate({
            post: this.model,
            parentPosts: this.parentPosts,
            replies: this.replies,
            user: this.user,
            postTemplate: postTemplate
        }));
        return this;
    }
});
