"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    PostModel = require("../models/Post"),
    postTemplate = _.template(require("../templates/post.html")),
    postDetailTemplate = _.template(require("../templates/post-detail.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "keypress .compose.reply div": "onTyping",
        "input .compose.reply div": "onTyping",
    },

    initialize: function(options) {
        var self = this;
        
        console.log('THIS', this);
        console.log('new post detail', options);

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

        self.render();
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

    onTyping: function (e) {
        if (e) e.stopPropagation();
        if (e && e.keyCode == 13) {
            e.preventDefault();
            this.submitReply();
            return;
        }
        var charcount = this.$input.text().length;
        this.$charcount.text(140 - charcount + ' charachters left');
        if (charcount > 0) {
            this.$charcount.show();
            this.$input.parent().parent().addClass('editing');
        } else {
            this.$charcount.hide();
            this.$input.parent().parent().removeClass('editing');
        }
    },

    submitReply: function () {
        var self = this;
        Twister.reply(app.user.get('username'), this.$input.text(), this.replyingTo.get('reply').username, this.replyingTo.get('reply').twister_id, function (err, data) {
            if (err) {
                return console.log('Error posting reply:', err);
            }
            self.$input.text("");
            self.onTyping();
        });
    },

    render: function() {
        this.replyingTo = new PostModel({
            user: app.user,
            reply: {
                username: this.post.getLastChild().get('user').get('username'),
                twister_id: this.post.getLastChild().get('twister_id')
            }
        });
        this.$el.html(postDetailTemplate({
            reply: this.replyingTo,
            postTemplate: postTemplate,
            post: this.post
        }));
        this.$charcount = this.$el.find('.characters');
        this.$input = this.$el.find('.compose.reply div[contenteditable=true]');
        return this;
    }
});

