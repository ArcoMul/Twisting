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
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        console.log("Initialize user profile");
        
        this.render();

        this.feed = new FeedModel();
        this.feed.get('users').add(new UserModel({username: this.model.get('username')}));
        this.feed.get('posts').on('add', function (post) {
            this.$el.children('#content-posts').first().append(postTemplate({post: post}));
        }.bind(this));

        this.loadPosts();

        $("#main-scrollable").scroll(this.scroll.bind(this));
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    loadPosts: function () {
        if (this.isLoading) return;
        this.isLoading = true;
        this.feed.fetchPosts(10, function (err) {

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

    scroll: function (e) {
        var bottomOfScreen = $("#main-scrollable").height() + $("#main-scrollable").scrollTop();
        var indexJustOutOfScreen;
        var index = 0;
        this.$el.children('#content-posts').children().each(function () {
            if ($(this).position().top > bottomOfScreen) {
                indexJustOutOfScreen = index;
                return false;
            }
            index++;
        });
        if (indexJustOutOfScreen == this.$el.children('#content-posts').children().length - 1) {
            this.loadPosts();
        }
    },

    render: function() {
        console.log("Render user profile");
        this.$el.html(postsContentTemplate({user: this.model}));
        return this;
    },

    remove: function() {
        $(window.document).unbind('scroll');
        this.$el.empty().off();
        this.stopListening();
        return this;
    }
});
