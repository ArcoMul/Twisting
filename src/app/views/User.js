"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    PostModel = require("../models/Post"),
    FeedModel = require("../models/Feed"),
    postTemplate = _.template(require("../templates/post.html")),
    userDetailTemplate = _.template(require("../templates/user-detail.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "scroll": "scroll",
        "click .avatar .follow": "toggleFollow",
        "click .avatar .following": "toggleFollow",
        "click .post .avatar .icon": "openPost",
        "click .post": "openPost"
    },

    initialize: function(options) {
        var self = this;

        this.options = options;
        this.user = options.user;

        this.feed = new FeedModel();
        this.feed.get('users').add(this.user);
        this.feed.get('posts').on('add', function (post) {
            this.$posts.append(postTemplate({post: post, icon: true}));
        }.bind(this));

        this.user.fetchProfile(function (err) {
            if (err) return console.error('Error fetching profile', err);
            self.render();
        });

        app.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
            if (app.user.get('following').indexOf(self.user.get('username')) != -1) {
                return self.loadPosts();
            }
            self.user.set('isFollowing', false);
            self.loadPosts();
        });

        this.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
        });

        this.user.fetchAvatar(function (err) {
            if (err) return console.error('Error fetch avatar', err);
            self.render();
        });

        self.render();

        this.$scrollable = this.$el.parents('.content-holder');
        this.$scrollable.scroll(function () {
            self.scroll();
        });
    },

    loadPosts: function () {
        var self = this;
        if (this.isLoading) return;
        this.isLoading = true;
        this.$loader.show();
        this.feed.fetchPosts(10, {includeMaxId: true, includeNotFollowers: [this.user]}, function (err) {

            self.$loader.hide();

            // Fetch avatars of users of which we don't have one yet
            self.feed.fetchAvatars(function (err, user, postsToSetAvatar) {
                if (!user.get('avatar')) {
                    console.log(user.get('username'), 'does not have an avatar');
                    return;
                }
                _.each(postsToSetAvatar, function (post) {
                    self.$posts.find('.post[data-id=' + post.id + '] .avatar img').attr('src', user.get('avatar'));
                });
            });

            // Allowed to load the next page
            self.isLoading = false;
        });
    },

    scroll: function (e) {
        var bottomOfScreen = this.$scrollable.height() + this.$scrollable.scrollTop();
        var totalHeight = this.$scrollable[0].scrollHeight;

        if (bottomOfScreen > totalHeight - 200 && this.feed.get('posts').length > 0) {
            this.loadPosts(true);
        }
    },

    toggleFollow: function () {
        var self = this;
        this.$followButton.addClass('loading');
        if (app.user.isFollowing(this.user.get('username'))) {
            app.user.unfollow(this.user.get('username'), function (err) {
                if(err) return console.error('Error unfollowing user', err);
                self.render();
            });
        } else {
            app.user.follow(this.user.get('username'), function (err) {
                if(err) return console.error('Error following user', err);
                self.render();
            });
        }
    },

    openPost: function (e) {
        // Don't do anything if a link is clicked
        if ($(e.target).is('a') || $(e.target).is('img')) {
            return;
        }

        var $post;
        if ($(e.currentTarget).hasClass('post')) {
            $post = $(e.currentTarget);
        } else {
            $post = $(e.currentTarget).parents('.post');
        }
        var id = $post.attr('data-id');
        var post = this.feed.get('posts').get(id);

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
            feed: this.feed
        });
    },

    render: function() {
        this.$el.html(userDetailTemplate({
            postTemplate: postTemplate,
            user: this.user,
            feed: this.feed
        }));
        this.$loader = this.$el.find('.load-animation');
        this.$posts = this.$el.find('.posts');
        this.$followButton = this.$el.find('.avatar div');
        return this;
    }
});
