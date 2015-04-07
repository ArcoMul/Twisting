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

    el: "#main-page",

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
                _.each(posts, function (post) {
                    this.$el.find('.post[data-id=' + post.cid + '] .left img').attr('src', user.get('avatar'));
                }, this);
            }.bind(this));
        }.bind(this));
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate(e.target.pathname, {trigger: true});
    },

    render: function() {
        console.log("Render user profile");
        this.$el.html(userProfileTemplate({user: this.model, posts: this.feed.get('posts')}));
        return this;
    }
});
