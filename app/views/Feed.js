"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var app = require("../app");
var _ = require("underscore");
var feedTemplate = _.template(require("../templates/feed.html"));
var PostsCollection = require("../collections/posts");
var UserCollection = require("../collections/users");
var PostModel = require("../models/Post");
var UserModel = require("../models/User");
var FeedModel = require("../models/Feed");
var Twister = require("../Twister");
var async = require("async");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el : "#main-page",

    posts: null,

    events: {
        "click a": "navigate",
        "scoll document": "scroll"
    },

    initialize: function() {
        console.log("Initialize feed");

        var self = this;
        var users = [];

        this.posts = new PostsCollection();

        $(window.document).scroll(function (e) {
            self.scroll (e);
        });

        this.feed = new FeedModel();

        Twister.getFollowing(function (err, usernames) {
            console.log('Followers', usernames);

            _.each(usernames, function (u) {
                this.feed.get('users').add(new UserModel({username: u}));
            }, this);

            this.feed.fetchPosts(100, function (err) {
                if (err) {
                    console.log('Error getting user posts for user:', user, err);
                    return;
                }

                this.render();

                this.feed.fetchAvatars(function (err, user, posts) {
                    if (!user.get('avatar')) {
                        console.log(user.get('username'), 'does not have an avatar');
                        return;
                    }
                    _.each(posts, function (post) {
                        this.$el.find('.post[data-id=' + post.cid + '] .left img').attr('src', user.get('avatar'));
                    }, this);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    navigate: function (e) {
        app.router.navigate(e.target.pathname, {trigger: true});
        e.preventDefault();
    },

    scroll: function (e) {
        var bottomOfScreen = $(window).height() + $(window).scrollTop();
        var indexJustOutOfScreen;
        var index = 0;
        $('#main-page .posts .post').each(function () {
            if ($(this).offset().top > bottomOfScreen) {
                indexJustOutOfScreen = index;
                return false;
            }
            index++;
        });
        //console.log(indexJustOutOfScreen);
        // get time of this posts
        // for each user check if it has posts in memory after this time
        //      if so, do nothing
        //      if doesnt have posts after the time in memory, fetch more posts 
        //          if there is nothing to fetch save this so that we won't try again all the time
        //  render new fetched posts
    },

    render: function() {
        console.log("Render Feed");
        this.$el.html(feedTemplate({
            user: this.model,
            posts: this.feed.get('posts')
        }));
        return this;
    }
});

