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
        "keyup .compose div": "onTyping",

        "click .post.new": "onNewPost",
        //"click .post": "onPostClick",
        "click .retwisters span:nth-child(1)": "retwist",
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
                self.$feed.append(
                    '<div class="days-ago">'
                    + post.getTimeAgo()
                    + '</div>'
                    + '<div class="posts line" data-days-ago="'+ago+'">'
                    + '</div>'
                );
                $day = self.$feed.children().last();
            }

            // The first post defines the time of the lastest posted post
            if (!self.dateOfLastPost) {
                self.dateOfLastPost = post.get('last_time');
            }
            
            // When a post is younger than the youngest post, show notification
            if (post.get('last_time') > self.dateOfLastPost) {
                $day.first().children().first().after(postTemplate({post: post, icon: true})).next().hide();
                self.setNewPost(self.$posts.find('.post:hidden').not(self.$newpost).length);
            } else {
                // Otherwise just add it
                $day.first().append(postTemplate({post: post, icon: true}));
            }
        });

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            _.each(usernames, function (u) {
                self.feed.get('users').add(new UserModel({username: u}));
            });

            // Get the first 10 posts
            self.loadPosts(true);

            // Every 30 seconds get latest posts
            if(!self.pollingTimer) self.pollingTimer = setInterval(self.poll.bind(self), 30000);
        });

        if (!this.timeUpdateTimer) this.timeUpdateTimer = setInterval(this.updateTime.bind(this), 60000);

        this.$el.scrollTop(0);
    },

    setNewPost: function (n) {
        this.$newpost.children(".icon").children("span").text(n);
        this.$newpost.show();
    },

    onNewPost: function () {
        this.$posts.find(".post:hidden").show();
        this.$newpost.hide();
    },

    openPost: function (e) {
        var $post = $(e.currentTarget).parents('.post');
        var id = $post.attr('data-id');
        var post = this.feed.get('posts').get(id);

        // Couldn't find the post, might be a fake post or something went wrong
        // anyway, abort mission
        if (!post) return;

        e.stopImmediatePropagation();

        // Show original twist, not the retwist itself
        if (post.get('retwist')) {
            post = post.get('retwist');
        }

        app.dispatcher.trigger('open-post-detail', {
            post: post,
            feed: this.feed
        });
    },

    openUser: function (e) {
        e.stopImmediatePropagation();
        var $post = $(e.currentTarget).parents('.post');

        // User clicked on his own avatar of the 'compose post'
        if ($post.hasClass('compose')) {
            app.dispatcher.trigger('open-user-profile', {
                user: app.user 
            });
            return;
        }

        // Normal click on an avatar of another user
        var id = $post.attr('data-id');
        var user = this.feed.get('posts').get(id).get('user');
        app.dispatcher.trigger('open-user-profile', {
            user: user
        });
    },

    retwist: function (e) {
        e.stopPropagation();
        e.preventDefault();

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

    poll: function (dontHide)
    {
        this.loadPosts(false, true, dontHide);
    },

    loadPosts: function (includeMaxId, isPolling, dontHide) {
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

            // Hide the loader if the user was scrolling downwards
            if(!isPolling) self.$loader.hide();

            // Immediately show new posts if this is prefered
            if (dontHide) self.onNewPost();

            // Fetch avatars of users of which we don't have one yet
            self.feed.fetchAvatars(function (err, user, postsToSetAvatar) {
                if (!user.get('avatar')) {
                    console.log(user.get('username'), 'does not have an avatar');
                    return;
                }
                // Healthier approach to the above, but doesn't handle retwists really well
                _.each(postsToSetAvatar, function (post) {
                   self.$el.find('.post[data-id=' + post.id + '] img[data-username='+user.get('username')+']').attr('src', user.get('avatar'));
                });
            });

            // Allowed to load the next page
            if (!isPolling) self.isLoading = false;
        });
    },

    onTyping: function (e) {
        if (e) e.stopPropagation();
        if (e && e.keyCode == 13) {
            e.preventDefault();
            this.submitPost();
            return;
        }
        if (e && e.keyCode == 27) {
            e.preventDefault();
            this.$input.text("");
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

    submitPost: function () {
        var self = this;
        var $icon = this.$input.parent().parent().find('.icon');

        // Already submitting
        if ($icon.hasClass('loading')) return;

        // Show that we are processing the post
        $icon.addClass('loading');

        // Post
        Twister.post(app.user.get('username'), this.$input.text(), function (err, data) {
            if (err) {
                return console.log('Error posting:', err);
            }

            // Posting done, reset everything
            $icon.removeClass('loading');
            self.$input.text("");
            self.onTyping();
            self.poll(true);
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
        this.$el.html(postsContent({
            postTemplate: postTemplate,
            post: new PostModel({type: 'compose', user: app.user})
        }));

        // Save references to certain elements
        this.$replyingTo = this.$el.find('.compose .replying-to');
        this.$info = this.$el.find('.info');
        this.$loader = this.$el.find('.load-animation');
        this.$newpost = this.$el.find('.post.new');
        this.$posts = this.$el.find('.posts');
        this.$feed = this.$el.find('.feed .feed-posts');
        this.$charcount = this.$feed.find('.characters');
        this.$input = this.$feed.find('.compose div[contenteditable=true]');
        return this;
    },

    remove: function() {
        this.$el.off(null, null, this);
        clearInterval(this.pollingTimer);
        clearInterval(this.timeUpdateTimer);
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});

