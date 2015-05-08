"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    postsContent = _.template(require("../templates/content-feed.html")),
    postTemplate = _.template(require("../templates/post.html")),
    PostsCollection = require("../collections/posts"),
    UserCollection = require("../collections/users"),
    PostModel = require("../models/Post"),
    UserModel = require("../models/User"),
    FeedModel = require("../models/Feed"),
    PostPreview = require("../views/PostPreview"),
    Twister = require("../Twister"),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    isLoading: false,
    dateOfLastPost: null,
    feed: null,
    pollingTimer: null,
    timeUpdateTimer: null,

    events: {
        "keypress .compose": "onTyping",
        "input .compose": "onTyping",
        "click button": "onSubmit",
        "click .newpost": "onNewPost",
        "click .post": "openPostDetail"
    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.render();

        this.feed = new FeedModel();
        this.feed.get('posts').on('add', function (post, posts, info) {

            // The first post defines the time of the lastest posted post
            if (!self.dateOfLastPost) {
                self.dateOfLastPost = post.get('time');
            }
            
            // When a post is younger than the youngest post, show notification
            if (post.get('time') > self.dateOfLastPost) {
                self.$posts.prepend(postTemplate({post: post})).children().first().hide();
                self.setNewPost(self.$posts.find('.post:hidden').length);
            } else {
                // Otherwise just add it
                self.$posts.append(postTemplate({post: post}));
            }
        });

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            _.each(usernames, function (u) {
                self.feed.get('users').add(new UserModel({username: u}));
            });

            // Get the first 10 posts
            self.loadPosts(true);

            // Every 30 seconds get latest posts
            if(!self.pollingTimer) self.pollingTimer = setInterval(self.loadPosts.bind(self, false, true), 30000);
        });

        if (!this.timeUpdateTimer) this.timeUpdateTimer = setInterval(this.updateTime.bind(this), 60000);

        $("#main-scrollable").scrollTop(0);
        this.options.parent.on('scroll', this.scroll, this);
    },

    setNewPost: function (n) {
        this.$newpost.text(n + ' new post' + (n > 1 ? 's' : ''));
        this.$newpost.show();
    },

    onNewPost: function () {
        this.$posts.find(".post:hidden").show();
        this.$newpost.hide();
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

    loadPosts: function (includeMaxId, isPolling) {
        if (this.isLoading) return;
        var self = this;

        // Polling call can be done at the same time as a scroll call
        if (!isPolling) {
            this.isLoading = true;
            this.$loader.show();
        }

        this.feed.fetchPosts(10, {includeMaxId: includeMaxId, includeNotFollowers: false}, function (err) {
            if (err) return console.error('Error fetching posts in feed:', err);

            // View is removed while posts where fetched
            if (!self) return;

            if(!isPolling) self.$loader.hide();

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
            if (!isPolling) self.isLoading = false;
        });
    },

    onTyping: function (e) {
        e.stopPropagation();
        var charcount = this.$input.text().length;
        this.$charcount.text(140 - charcount + ' charachters left');
        if (charcount > 0) {
            this.$info.show();
        } else {
            this.$info.hide();
        }
    },

    onSubmit: function (e) {
        Twister.post(app.user.get('username'), this.$input.text(), function (err, data) {
            if (err) {
                return console.log('Error posting:', err);
            }
            this.$input.text("");
            this.$info.hide();
        }.bind(this));
    },

    scroll: function (e) {
        var bottomOfScreen = $("#main-scrollable").height() + $("#main-scrollable").scrollTop();
        var totalHeight = $("#main-scrollable")[0].scrollHeight;

        if (bottomOfScreen > totalHeight - 200 && this.feed.get('posts').length > 0) {
            this.loadPosts(true);
        }
    },

    updateTime: function () {
        var self = this;
        this.$posts.children().each(function () {
            var id = $(this).attr('data-id'),
                post = self.feed.get('posts').get(id);

            $(this).find('.date').text(post.getTimeAgo());
        });
    },

    render: function() {
        // Render
        this.$el.html(postsContent());

        // Save references to certain elements
        this.$input = this.$el.find('[contenteditable=true]');
        this.$info = this.$el.find('.info');
        this.$charcount = this.$el.find('.info span');
        this.$loader = this.$el.find('.load-animation');
        this.$newpost = this.$el.find('.newpost');
        this.$posts = this.$el.find('.posts');
        return this;
    },

    remove: function() {
        this.options.parent.off(null, null, this);
        clearInterval(this.pollingTimer);
        clearInterval(this.timeUpdateTimer);
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});

