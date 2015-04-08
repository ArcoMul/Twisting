"use strict";

var _ = require("underscore");
var rpc = require('json-rpc2');
var fs = require("fs");

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


    var getAvatarFromFileSystem = function (username, callback) {
    }
    
    var getAvatar = function (username, callback)
    {
        var filename = "app/avatars/" + username;

        // TODO: don't check for both file in this spagetti code
        fs.exists(filename + ".png", function (result) {
            // It excists, return the path
            if (result) {
                filename += ".png";
                return callback(null, filename);
            }

            fs.exists(filename + ".jpg", function (result) {
                // It excists, return the path
                if (result) {
                    filename += ".jpg";
                    return callback(null, filename);
                }

                twisterRpc("dhtget", [username, "avatar", "s"], function (err, data) {
                    if (err) return callback(err);
                    if (!data || data.length == 0 || !data[0]) return callback();

                    var img = data[0].p.v;

                    // Got an avatar, cache it on the filesystem
                    var base64;
                    if (img.indexOf("data:image/jpeg;base64,") != -1) {
                        base64 = img.replace(/^data:image\/jpeg;base64,/, "");
                        filename += ".jpg";
                    } else if (img.indexOf("data:image/png;base64,") != -1) {
                        base64 = img.replace(/^data:image\/png;base64,/, "");
                        filename += ".png";
                    } else if (img == "img/genericPerson.png") {
                        // This is some sort of default image? Anyway, return like there is no image
                        callback(null, null);
                    } else {
                        console.log('No jpg or png for', username, img);
                    }
                    fs.writeFile(filename, base64, 'base64', function(err) {
                        if (err) {
                            console.log('Error saving avatar:', err);
                        }
                        callback (err, filename);
                    });
                });
            });
        });
    }

    return {
        getPosts: getPosts,
        getFollowing: getFollowing,
        getAvatar: getAvatar
    };
})();
