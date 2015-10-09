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
        "click .compose.reply div": "onReplyClick",
        "keypress .compose.reply div": "onTyping",
        "input .compose.reply div": "onTyping",
        "click .post .avatar .icon": "openPost",
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

        this.render();
    },

    addParentPost: function (post) {
        var self = this;
        Twister.getPost(post.get('reply').username, post.get('reply').twister_id, function (err, parentPost) {
            if (err) return console.error('Error getting parent post', err);

            if (!parentPost || parentPost.length === 0) return;

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

    onReplyClick: function (e) {
        if (!_.isEmpty(this.$input.text())) return;
        var replyingToUsername = this.replyingTo.get('user').get('username');

        // Get the usernames mentioned in the post we are replying to
        var usernames = this.replyingTo.getMentionedUsernames();

        // See if the active user is mentioned too,
        // if so, remove the username
        var index = usernames.indexOf(app.user.get('username'));
        if (index != -1) {
            usernames.splice(index, 1);
        }

        // See if the user of the post is not the active user and if
        // the user is already in there, otherwise add this user too
        if (replyingToUsername != app.user.get('username') && usernames.indexOf(replyingToUsername) == -1) {
            usernames.push(replyingToUsername);
        }

        // Build up the precomposed reply with the right mentions
        var html = '';
        usernames.forEach(function (username) {
            html += "@" + username + "&nbsp;";
        });

        // Render and set the cursor to the end, ready for typing
        this.$input.html(html).keypress();
        if (html.length === 0) return;
        this.setCursorToEnd(this.$input[0]);
    },

    setCursorToEnd: function (ele)
    {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(ele, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        ele.focus();
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
        var $icon = this.$input.parent().parent().find('.icon');

        // Already submitting
        if ($icon.hasClass('loading')) return;

        $icon.addClass('loading');

        this.replyingTo.reply(app.user, this.$input.text(), function (err, reply) {
            if (err) {
                return console.error('Error posting reply:', err);
            }
            $icon.removeClass('loading');
            self.$input.text("");
            self.onTyping();
            self.render();
        });
    },

    openPost: function (e) {
        var $post = $(e.currentTarget).parents('.post');
        var id = $post.attr('data-id');
        var post = this.options.feed.get('posts').get(id);

        // Couldn't find the post, might be a fake post or something went wrong
        // anyway, abort mission
        if (!post) return;

        e.stopImmediatePropagation();
        e.preventDefault();

        // Show original twist, not the retwist itself
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        app.dispatcher.trigger('open-post-detail', {
            post: post,
            feed: this.options.feed
        });
    },

    render: function() {
        this.replyingTo = this.post.getLastChild();
        this.$el.html(postDetailTemplate({
            reply: this.replyingTo,
            postTemplate: postTemplate,
            post: this.post,
            user: app.user
        }));
        this.$charcount = this.$el.find('.characters');
        this.$input = this.$el.find('.compose.reply div[contenteditable=true]');
        return this;
    }
});
