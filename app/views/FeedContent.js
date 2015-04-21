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
    Twister = require("../Twister"),
    async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        "click a": "navigate",
        "keypress .compose": "onTyping",
        "input .compose": "onTyping",
        "click button": "onSubmit"
    },

    initialize: function() {
        console.log("Initialize feed");

        this.render();

        this.feed = new FeedModel();
        this.feed.get('posts').on('add', function (post) {
            this.$el.find('#content-posts').first().append(postTemplate({post: post}));
        }.bind(this));

        Twister.getFollowing(app.user.get('username'), function (err, usernames) {
            console.log('Followers', usernames);

            _.each(usernames, function (u) {
                this.feed.get('users').add(new UserModel({username: u}));
            }, this);

            this.loadPosts();
        }.bind(this));

        $("#main-scrollable").scrollTop(0);
        $("#main-scrollable").scroll(this.scroll.bind(this));
    },

    loadPosts: function () {
        if (this.isLoading) return;
        this.isLoading = true;
        this.$loader.show();
        this.feed.fetchPosts(10, function (err) {

            this.$loader.hide();

            // Fetch avatars of users of which we don't have one yet
            this.feed.fetchAvatars(function (err, user, postsToSetAvatar) {
                if (!user.get('avatar')) {
                    console.log(user.get('username'), 'does not have an avatar');
                    return;
                }
                _.each(postsToSetAvatar, function (post) {
                    this.$el.find('.post[data-id=' + post.cid + '] .left img').attr('src', user.get('avatar'));
                }, this);
            }.bind(this));

            // Allowed to load the next page
            this.isLoading = false;
        }.bind(this));
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

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    scroll: function (e) {
        var bottomOfScreen = $("#main-scrollable").height() + $("#main-scrollable").scrollTop();
        var indexJustOutOfScreen;
        var index = 0;
        this.$el.find('#content-posts').children().each(function () {
            if ($(this).position().top > bottomOfScreen) {
                indexJustOutOfScreen = index;
                return false;
            }
            index++;
        });
        if (indexJustOutOfScreen == this.$el.find('#content-posts').children().length - 1) {
            this.loadPosts();
        }
    },

    render: function() {
        console.log("Render Feed");
        this.$el.html(postsContent());
        this.$input = this.$el.find('[contenteditable=true]');
        this.$info = this.$el.find('.info');
        this.$charcount = this.$el.find('.info span');
        this.$loader = this.$el.find('.load-animation');
        return this;
    }
});

