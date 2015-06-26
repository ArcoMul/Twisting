"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    postsContent = _.template(require("../templates/feed.html")),
    postTemplate = _.template(require("../templates/post.html")),
    PostsCollection = require("../collections/posts"),
    UserCollection = require("../collections/users"),
    PostModel = require("../models/Post"),
    UserModel = require("../models/User"),
    FeedModel = require("../models/Feed"),
    PostPreview = require("../views/PostPreview"),
    SlideOverlayView = require("../views/SlideOverlay"),
    PostView = require("../views/Post"),
    UserView = require("../views/User"),
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
        //"keypress .compose": "onTyping",
        //"input .compose": "onTyping",
        //"click button": "onSubmit",
        //"click .newpost": "onNewPost",
        //"click .post": "onPostClick",
        //"click .post .actions .retwist": "retwist",
        //"click .post .actions .reply": "reply",
        //"click .post .actions .preview": "preview",
        "scroll": "scroll",
        "click .post .icon": "openPost",
        "click .post .avatar": "openUser"
    },

    initialize: function(options) {
        var self = this;
        this.options = options;

        this.render();

        this.feed = new FeedModel();
        this.feed.get('posts').on('add', function (post, posts, info) {

            var ago = post.getDaysAgo();
            var $day = self.$feed.children('.posts[data-days-ago=' + ago + ']');
            if ($day.length == 0) {
                self.$feed.append('<div class="days-ago">'+(ago == 0 ? 'Today' : post.getTimeAgo()) +'</div><div class="posts line" data-days-ago="'+ago+'"></div>');
            }
            $day.first().append(postTemplate({post: post, icon: true}));

            return;

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

        this.$el.scrollTop(0);
    },

    setNewPost: function (n) {
        this.$newpost.text(n + ' new post' + (n > 1 ? 's' : ''));
        this.$newpost.show();
    },

    onNewPost: function () {
        this.$posts.find(".post:hidden").show();
        this.$newpost.hide();
    },

    openPost: function (e) {
        e.stopImmediatePropagation();
        var id = $(e.currentTarget).parents('.post').attr('data-id');
        this.openPostDetail(id);
    },
    
    openPostDetail: function (id) {
        var post = this.feed.get('posts').get(id);

        // Show original twist, not the retwist itself
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: PostView,
            options: {
                post: post,
                feed: this.feed
            }
        });
    },

    openUser: function (e) {
        e.stopImmediatePropagation();
        var id = $(e.currentTarget).parents('.post').attr('data-id');
        var post = this.feed.get('posts').get(id);
        var user = post.get('user');
        this.openUserDetail(user);
    },

    openUserDetail: function (user) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: UserView,
            options: {
                user: user
            }
        });
    },

    preview: function (e) {
        e.stopPropagation();
        var id = $(e.currentTarget).parents('.post').attr('data-id');
        this.openPostDetail(id);
    },

    retwist: function (e) {
        e.stopPropagation();
        var id = $(e.currentTarget).parents('.post').attr('data-id'),
            post = this.feed.get('posts').get(id);

        // Retwist the original twist
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        Twister.retwist(app.user.get('username'), post.toRetwist(), function (err, data) {
            if (err) return console.error('Error retwisting twist', err);    
        });
    },

    reply: function (e) {
        e.stopPropagation();
        var id = $(e.currentTarget).parents('.post').attr('data-id'),
            post = this.feed.get('posts').get(id);

        // Reply to the original twist
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        this.$replyingTo.text("Replying to @" + post.get('user').get('username')).show();
        this.replyingTo = post;

        $("#main-scrollable").scrollTop(0);
        this.$input
            .focus()
            .html("@" + post.get('user').get('username') + "&nbsp;")
            .keypress();

        this.setCursorToEnd(this.$input[0]);

        console.log('Reply to', post);
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

    loadPosts: function (includeMaxId, isPolling) {
        if (this.isLoading) return;
        var self = this;

        // Polling call can be done at the same time as a scroll call
        if (!isPolling) {
            this.isLoading = true;
            this.$loader.show();
        }

        var sortDirection = isPolling ? 1 : -1;
        this.feed.fetchPosts(10, {includeMaxId: includeMaxId, includeNotFollowers: false, sortDirection: sortDirection}, function (err) {
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
                    self.$el.find('.post[data-id=' + post.id + '] .avatar img').attr('src', user.get('avatar'));
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
            this.replyingTo = null;
            this.$replyingTo.text("").hide();
            this.$info.hide();
        }
    },

    onSubmit: function (e) {
        var self = this;
        if (this.replyingTo) {
            Twister.reply(app.user.get('username'), this.$input.text(), this.replyingTo.get('user').get('username'), this.replyingTo.get('twister_id'), function (err, data) {
                if (err) {
                    return console.log('Error posting:', err);
                }
                self.$input.text("");
                self.$info.hide();
                self.replyingTo = null;
            }.bind(this));
        } else {
            Twister.post(app.user.get('username'), this.$input.text(), function (err, data) {
                if (err) {
                    return console.log('Error posting:', err);
                }
                self.$input.text("");
                self.$info.hide();
            }.bind(this));
        }
    },

    scroll: function (e) {
        var bottomOfScreen = $("#main-scrollable").height() + $("#main-scrollable").scrollTop();
        var totalHeight = $("#main-scrollable")[0].scrollHeight;

        if (bottomOfScreen > totalHeight - 200 && this.feed.get('posts').length > 0) {
            this.loadPosts(true);
        }
        console.log('scrollllll');
    },

    updateTime: function () {
        var self = this;
        // TODO
        return;
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
        this.$input = this.$el.find('.compose [contenteditable=true]');
        this.$replyingTo = this.$el.find('.compose .replying-to');
        this.$info = this.$el.find('.info');
        this.$charcount = this.$el.find('.info span');
        this.$loader = this.$el.find('.load-animation');
        this.$newpost = this.$el.find('.newpost');
        this.$posts = this.$el.find('.posts');
        this.$feed = this.$el.find('.feed .feed-posts');
        return this;
    },

    remove: function() {
        this.$el.off(null, null, this);
        clearInterval(this.pollingTimer);
        clearInterval(this.timeUpdateTimer);
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});

