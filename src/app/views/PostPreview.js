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
        this.post = options.post;

        if (this.post.get('reply')) {
            this.addParentPost(options.post);
        }

        Twister.getReplies(this.post.get('user').get('username'), this.post.get('twister_id'), function (err, replies) {
            if (err) return console.error('Error fetching replies', err);
            if (!replies || replies.length == 0) return;

            var posts = [];
            _.each(replies, function (reply) {
                posts.push(new PostModel().parse(reply.p.v, options.feed.get('users')));
            });
            posts = posts.reverse();
            self.post.set('replies', posts);
            self.render();
        });
    },

    addParentPost: function (post) {
        var self = this;
        Twister.getPost(post.get('reply').username, post.get('reply').twister_id, function (err, parentPost) {
            if (err) return console.error('Error getting parent post', err);

            // Found a parent post
            parentPost = new PostModel().parse(parentPost[0].p.v, self.options.feed.get('users'));

            // Tell the parent post the original post is a reply
            parentPost.set('replies', [post]);

            // Tell the original post its parent
            post.set('parent', parentPost);

            self.render();

            // Maybe the parent post also has a parent post
            if (parentPost.get('reply')) {
                self.addParentPost(parentPost);
            }
        });
    },

    render: function() {
        this.$el.html(postPreviewTemplate({
            postTemplate: postTemplate,
            post: this.post
        }));
        return this;
    }
});
