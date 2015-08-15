"use strict";

// External dependencies.
var $ = require("jquery"),
    _ = require("underscore"),
    async = require("async"),
    Backbone = require("backbone"),
    Twister = require("../Twister"),
    PostsCollection = require("../collections/posts"),
    UserModel = require("../models/User"),
    PostModel = require("../models/Post");

Backbone.$ = $;

module.exports = Backbone.Collection.extend({
    model: UserModel,

    /**
     * Recursive function to retrieve an amount of Twists of a user using DHT
     * All the time retrieves a Twist and then based on lastk retrieves the
     * next one
     */
    fetchPostFromDht: function (user, posts, till, callback) {
        var self = this;

        // If we don't know the last post of this user, get its status
        if (_.isUndefined(user.get('last_twister_id'))) {
            user.getStatus(function (err, post) {
                var post = new PostModel().parse({userpost: post}, self);
                posts.push(post);
                self.fetchPostFromDht(user, posts, till, callback);
            });
            return;
        }

        // Get the next post
        Twister.getPostFromDht(user.get('username'), user.get('last_twister_id'), function (err, item) {
            if (!item) return callback();
            var post = new PostModel().parse(item, self);
            posts.push(post);

            // No more posts in DHT? Or the last post of this user?
            if (posts.length == till || user.get('last_twister_id') === 0) {
                callback();
            } else {
                self.fetchPostFromDht(user, posts, till, callback);
            }
        });
    },

    /**
     * Get a certain amount of all the users the active users doens't follow using DHT
     */
    fetchPostsFromDht: function (amount, options, callback) {
        var self = this,
            posts = [];

        // All the users in this collection which are NOT followed
        var notFollowing = this.filter(function (user) { return user.get('isFollowing') == false });

        // Loop through the users which should still be included
        // although they are not followed. Only include them
        // if they indeed are not followed
        var notFollowingFiltered = [];
        _.each(options.includeNotFollowers, function (user) {
            if (notFollowing.indexOf(user) != -1) {
                notFollowingFiltered.push(user);
            }
        });

        // Loop one by one, because DHT can't handle too many calls at once
        async.eachSeries(notFollowingFiltered, function (user, callback) {
            self.fetchPostFromDht(user, posts, amount, callback);
        }, function (result) {
            callback(null, posts);
        });
    },

    /**
     * Gets a certain amount of posts for the users in this collection
     * options:
     *      includeNotFollowers: If posts of users we don't follow also should be retrieved using DHT
     *      includeMaxId: If the last post we have of the user should be taken in account to retrieve the rest of the posts
     *                    so that only posts after a certain point get fetched (for lazy loading purposes)
     */
    fetchPosts: function (amount, options, callback) {

        // Get the posts of the users we don't follow using DHT
        if (options.includeNotFollowers) {
            this.fetchPostsFromDht(amount, options, callback);
        }

        // Build request object array
        var users = [];
        var following = this.filter(function (user) { return user.get('isFollowing') });

        // Probably only fetching posts using DHT
        if (following.length == 0) return;

        _.each(following, function (user) {
            var data = {};
            data.username = user.get('username');
            if (options.includeMaxId && user.get('lowest_id')) {
                data.max_id = user.get('lowest_id') - 1;
            }
            users.push(data);
        });

        // Request!
        Twister.getPosts(users, amount, function (err, posts_data) {
            if (err) {
                console.error('Error getting user posts for user collection', err);
                callback(err);
                return;
            }
            var posts = [];
            _.each(posts_data, function (item) {
                var post = new PostModel().parse(item, this);
                posts.push(post);
            }, this);
            callback(null, posts);
        }.bind(this));
    },

    fetchMentions: function (amount, options, callback) {
        var self = this;
        this.each(function (user) {
            async.parallel([
                function (callback) {
                    Twister.getMentions(user.get('username'), amount, null, function (err, mentions_data) {
                        if (err) {
                            console.error('Error getting mentions for user ', err);
                            return callback(err);
                        }
                        var posts = [];
                        _.each(mentions_data, function (item) {
                            var post = new PostModel().parse(item, self);
                            posts.push(post);
                        });
                        callback(null, posts);
                    });
                },
                function (callback) {
                    Twister.getMentionsFromDHT(user.get('username'), function (err, mentions_data) {
                        if (err) {
                            console.error('Error getting mentions for user ', err);
                            return callback(err);
                        }
                        var posts = [];
                        _.each(mentions_data, function (item) {
                            var post = new PostModel().parse(item.p.v, self);
                            posts.push(post);
                        });
                        callback(null, posts);
                    });
                }
            ], function (err, results) {
                if (err) return callback(err);
                callback(null, results[0].concat(results[1]));
            });
        });
    },

    newUser: function (data) {
        var user = new UserModel(data);
        this.add(user);
        return user;
    }

});
