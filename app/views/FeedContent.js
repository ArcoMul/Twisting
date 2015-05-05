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

    events: {
        "keypress .compose": "onTyping",
        "input .compose": "onTyping",
        "click button": "onSubmit",
        "click .newpost": "onNewPost",
        "click .post": "openPostDetail"
    },

    initialize: function(options) {
        console.log("Initialize feed");
        this.options = options;

        this.render();

        this.feed = new FeedModel();
        this.feed.get('posts').on('add', function (post, posts, info) {

            // The first post defines the time of the lastest posted post
            if (!this.dateOfLastPost) {
                this.dateOfLastPost = post.get('time');
            }
            
            // When a post is younger than the youngest post, show notification
            if (post.get('time') > this.dateOfLastPost) {
                this.$posts.prepend(postTemplate({post: post})).children().first().hide();
                this.setNewPost(this.$posts.find('.post:hidden').length);
            } else {
                // Otherwise just add it
                this.$posts.append(postTemplate({post: post}));
            }
        }.bind(this));

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            console.log('Followers', usernames);

            _.each(usernames, function (u) {
                this.feed.get('users').add(new UserModel({username: u}));
            }, this);

            // Get the first 10 posts
            this.loadPosts(true);

            // Every 10 seconds get latest posts
            this.timer = setInterval(this.loadPosts.bind(this), 10000);
        }.bind(this));

        $("#main-scrollable").scrollTop(0);
        $("#main-scrollable").scroll(this.scroll.bind(this));
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

    loadPosts: function (includeMaxId) {
        if (this.isLoading) return;
        var self = this;
        this.isLoading = true;
        this.$loader.show();
        this.feed.fetchPosts(10, {includeMaxId: includeMaxId}, function (err) {
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

        if (bottomOfScreen > totalHeight - 200) {
            this.loadPosts(true);
        }
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
        clearInterval(this.timer);
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});

