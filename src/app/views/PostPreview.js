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

    events: {
        "click button": "openPost"
    },

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

    openPost: function () {
        console.log('openPost');
        app.router.navigate('/users/' + this.post.get('user').get('username') + '/posts/' + this.post.get('twister_id'), {testtest: 123});
        app.router.postDetail(
            this.post.get('user'),
            this.post);
    },

    render: function() {
        this.$el.html(postPreviewTemplate({
            postTemplate: postTemplate,
            post: this.post
        }));
        var $title = this.$el.find('.title');
        var $top = this.$el.find('.top');
        var $middle = this.$el.find('.middle');
        var $bottom = this.$el.find('.bottom');
        var $footer = this.$el.find('.footer');
        var dynamicHeight = this.$el.height() - $title.height() - $middle.height() - $footer.height();
        this.$el.height($("#main-scrollable").height());
        var tooManyParents = false,
            tooManyReplies = false;
        if ($top.height() > dynamicHeight / 2) {
            tooManyParents = true;
        }
        if ($bottom.height() > dynamicHeight / 2) {
            tooManyReplies = true;
        }

        if (tooManyParents && tooManyReplies) {
            $top.height(dynamicHeight / 2);
            $bottom.height(dynamicHeight / 2);
        } else if (tooManyParents && !tooManyReplies) {
            $top.height(dynamicHeight - $bottom.height());
        } else if (!tooManyParents && tooManyReplies) {
            $bottom.height(dynamicHeight - $top.height());
        }

        if (!tooManyParents && !tooManyReplies) {
            $footer.hide();
        }

        $top.children().children().first().css('marginTop', -$top[0].scrollHeight + $top.height());
        console.log($top, $top.children().first(), -$top[0].scrollHeight + $top.height(), $top[0].scrollHeight, $top.height());
        return this;
    }
});
