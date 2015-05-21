"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    app = require("../app"),
    _ = require("underscore"),
    postsContentTemplate = _.template(require("../templates/content-posts.html")),
    postTemplate = _.template(require("../templates/post.html")),
    PostsCollection = require("../collections/posts"),
    UserCollection = require("../collections/users"),
    PostModel = require("../models/Post"),
    UserModel = require("../models/User"),
    FeedModel = require("../models/Feed"),
    PostPreview = require("../views/PostPreview"),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    user: null,
    feed: null,

    events: {
        "click .post": "openPostDetail"
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        
        this.render();

        this.user = new UserModel({username: this.model.get('username')});

        this.feed = new FeedModel();
        this.feed.get('users').add(this.user);
        this.feed.get('posts').on('add', function (post) {
            this.$posts.append(postTemplate({post: post}));
        }.bind(this));

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            if (usernames.indexOf(self.user.get('username')) != -1) {
                return self.loadPosts();
            }
            self.user.set('isFollowing', false);
            self.loadPosts();
        });

        $("#main-scrollable").scrollTop(0);
        this.options.parent.on('scroll', this.scroll, this);
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
                    self.$posts.find('.post[data-id=' + post.id + '] .left img').attr('src', user.get('avatar'));
                });
            });

            // Allowed to load the next page
            self.isLoading = false;
        });
    },

    scroll: function (e) {
        var bottomOfScreen = $("#main-scrollable").height() + $("#main-scrollable").scrollTop();
        var totalHeight = $("#main-scrollable")[0].scrollHeight;

        if (bottomOfScreen > totalHeight - 200) {
            this.loadPosts();
        }
    },

    openPostDetail: function (e) {
        var id = $(e.currentTarget).attr('data-id'),
            post = this.feed.get('posts').get(id);

        // Show original twist, not the retwist itself
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        this.options.parent.openPreview(new PostPreview({post: post, feed: this.feed}));
    },

    render: function() {
        this.$el.html(postsContentTemplate({user: this.model}));
        this.$loader = this.$el.find('.load-animation');
        this.$posts = this.$el.find('.posts');
        return this;
    },

    remove: function () {
        this.options.parent.off(null, null, this);
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});
