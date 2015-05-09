"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    PostModel = require("../models/Post"),
    postTemplate = _.template(require("../templates/post.html")),
    postPreviewTemplate = _.template(require("../templates/preview-post.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    initialize: function(options) {
        var self = this;

        this.options = options;

        this.parentPosts = [];
        this.replies = [];

        if (options.post.get('reply')) {
            this.addParentPost(options.post);
        }

        Twister.getReplies(options.post.get('user').get('username'), options.post.get('twister_id'), function (err, replies) {
            if (err) return console.error('Error fetching replies', err);
            if (!replies || replies.length == 0) return;

            var posts = [];
            _.each(replies, function (reply) {
                posts.push(new PostModel().parse(reply.p.v.userpost, options.feed.get('users')));
            });
            posts = posts.reverse();
            self.replies = posts;
            self.render();
        });
    },

    addParentPost: function (post) {
        var self = this;
        Twister.getPost(post.get('reply').username, post.get('reply').twister_id, function (err, post) {
            if (err) return console.error('Error getting parent post', err);

            // Found a post, add it to the view and render it
            var post = new PostModel().parse(post[0].p.v.userpost, self.options.feed.get('users'));
            self.parentPosts.unshift(post);
            self.render();

            // Maybe the parent post also has a parent post
            if (post.get('reply')) {
                self.addParentPost(post);
            }
        });
    },

    render: function() {
        this.$el.html(postPreviewTemplate({
            postTemplate: postTemplate,
            options: this.options,
            replies: this.replies,
            parentPosts: this.parentPosts
        }));
        return this;
    }
});
