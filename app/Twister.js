"use strict";

var _ = require("underscore");
var rpc = require('json-rpc2');

module.exports = (function () {

    var twisterRpc = function (method, params, callback) {

        var client = rpc.Client.$create(28332, 'localhost', 'user', 'pwd');
         
        // Call add function on the server 
        client.call(method, params, function(err, result) {
            callback(err, result);
        });
    }

    // getposts <count> '[{"username":username,"max_id":max_id,"since_id":since_id},...]' [flags]
    var getPosts = function (username, amount, callback) {
        var users = [];
        if (_.isString(username)) {
            users.push({username: username});
        }
        if (_.isArray(username)) {
            _.each(username, function (u) {
                users.push({username: u});
            });
        }
        twisterRpc("getposts", [amount, users], function (err, data) {
            if (err) callback(err);
            var posts = [];
            _.each(data, function (item) {
                posts.push(item.userpost);
            });
            callback(err, posts);
        });
    }

    var getFollowing = function (callback)
    {
        twisterRpc("getfollowing", ["arco"], function (err, data) {
            if (err) callback(err);
            console.log("getfollowing", arguments);
            callback (err, data);
        });
    }
    
    var getAvatar = function (username, callback)
    {
        twisterRpc("dhtget", [username, "avatar", "s"], function (err, data) {
            if (err) callback(err);
            if (!data || data.length == 0 || !data[0]) return callback();
            callback (null, data[0].p.v);
        });
    }

    return {
        getPosts: getPosts,
        getFollowing: getFollowing,
        getAvatar: getAvatar
    };
})();
