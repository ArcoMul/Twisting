"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    postsContentTemplate = _.template(require("../templates/content-posts.html")),
    postTemplate = _.template(require("../templates/post.html")),
    PostModel = require("../models/Post"),
    UserModel = require("../models/User"),
    FeedModel = require("../models/Feed"),
    PostPreview = require("../views/PostPreview"),
    Twister = require("../Twister"),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    isLoading: false,
    feed: null,
    $posts: null,
    $loader: null,

    events: {
        "click .post": "openPostDetail"
    },

    initialize: function(options) {
        var self = this;
        this.options = options;
        this.render();

        this.feed = new FeedModel();
        this.feed.get('users').add(app.user);
        this.feed.get('posts').on('add', function (post, posts, info) {
            self.$posts.append(postTemplate({post: post}));
        });

        this.fetchMentions();

        $("#main-scrollable").scrollTop(0);
    },

    fetchMentions: function () {
        if (this.isLoading) return;
        var self = this;

        this.feed.fetchMentions(10, null, function (err) {
            if (err) return console.error('Error fetching posts in feed:', err);

            // View is removed while posts where fetched
            if (!self) return;

            self.$loader.hide();

            // Fetch avatars of users of which we don't have one yet
            self.feed.fetchAvatars(function (err, user, postsToSetAvatar) {
                if (!user.get('avatar')) {
                    console.log(user.get('username'), 'does not have an avatar');
                    return;
                }
                _.each(postsToSetAvatar, function (post) {
                    self.$posts.find('.post[data-id=' + post.cid + '] .left img').attr('src', user.get('avatar'));
                });
            });

            // Allowed to load the next page
            self.isLoading = false;
        });
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
        this.$el.html(postsContentTemplate());
        this.$loader = this.$el.find('.load-animation');
        this.$posts = this.$el.find('.posts');
        return this;
    }
});

