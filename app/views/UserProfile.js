"use strict";

// External dependencies.
var $ = require("jquery");
var Backbone = require("backbone");
var async = require("async");
var app = require("../app");
var _ = require("underscore");
var userProfileTemplate = _.template(require("../templates/user-profile.html"));
var PostsCollection = require("../collections/posts");
var UserCollection = require("../collections/users");
var PostModel = require("../models/Post");
var UserModel = require("../models/User");
var FeedModel = require("../models/Feed");
var Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        console.log("Initialize user profile");
        
        this.posts = new PostsCollection();
        this.users = new UserCollection();

        this.feed = new FeedModel();

        this.feed.get('users').add(new UserModel({username: this.model.get('username')}));

        this.feed.fetchPosts(100, function (err, user) {
            this.render();
            this.feed.fetchAvatars(function (err, user, posts) {
                console.log('set avatar of user for post', user, posts);
                _.each(posts, function (post) {
                    this.$el.find('.post[data-id=' + post.cid + '] .left img').attr('src', user.get('avatar'));
                }, this);
            }.bind(this));
        }.bind(this));

        /*j
        this.feed.fetchPosts(100, function (err) {
            if (err) {
                console.log('Error getting user posts for user:', user, err);
                return;
            }

            console.log(this.feed);

            this.render();

        }.bind(this));
        */

        /*
        Twister.getPosts(this.model.get('username'), 10, function (err, data) {
            if (err) {
                console.log('Error getting user posts:', err);
                return;
            }

            _.each(data, function (item) {
                var user = this.users.findWhere({username: item.n});
                if (!user) {
                    user = new UserModel({username: item.n}); 
                    this.users.add(user);
                }
                this.posts.add([new PostModel({message: item.msg, user: user, time: item.time})]);
            }, this);

            this.render();

            async.eachSeries(this.users.models, function (user, callback) {
                user.fetchAvatar(function (err) {
                    callback();
                    _.each(this.posts.where({user: user}), function (post) {
                        console.log('set avatar of post', user.get('avatar'));
                        this.$el.find(".post[data-id="+post.cid+"] .left img").attr('src', user.get('avatar'));
                    }, this);
                }.bind(this));
            }.bind(this),
            function () {
                console.log('All avatars fetched');
            });
        }.bind(this));
        */

        this.setElement($("#main-page"));
    },

    navigate: function (e) {
        console.log (arguments);
        app.router.navigate(e.target.pathname, {trigger: true});
        e.preventDefault();
    },

    render: function() {
        console.log("Render user profile");
        this.$el.html(userProfileTemplate({user: this.model, posts: this.feed.get('posts')}));
        return this;
    }
});
