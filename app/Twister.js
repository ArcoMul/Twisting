"use strict";

var _ = require("underscore"),
    rpc = require('json-rpc2'),
    fs = require("fs"),
    exec = require('child_process').exec,
    dir = __dirname.replace('\app', ''),
    config = require("./config.js");

console.log('DIR', dir);

module.exports = (function () {

    var status = {
        NOCONNECTION: "Have no response object"
    };

    var twisterRpc = function (method, params, callback) {

        var client = rpc.Client.$create(28332, 'localhost', 'user', 'pwd');

        console.log('CALL:', method, params);
         
        // Call add function on the server 
        client.call(method, params, function(err, result) {
            console.log('RESULT:', method, arguments);
            callback(err, result);
        });
    }

    var checkError = function (error) {
        if (error.message == status.NOCONNECTION) {
            console.log('No connection detected! Restart deamon');
            startDeamon();
        }
    }

    // getposts <count> '[{"username":username,"max_id":max_id,"since_id":since_id},...]' [flags]
    var getPosts = function (username, amount, callback) {
        var users = [];

        // It is one user
        if (_.isString(username)) {
            users.push({username: username});
        }

        // It is a list of users
        if (_.isArray(username)) {
            if (_.isObject(username[0])) {
                // It is a list of username with max ids
                users = username;
            } else {
                // It is a list of usernames
                _.each(username, function (u) {
                    users.push({username: u});
                });
            }
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

    var getFollowing = function (username, callback)
    {
        twisterRpc("getfollowing", [username], function (err, data) {
            if (err) callback(err);
            console.log("getfollowing", arguments);
            callback (err, data);
        });
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
                        return callback(null, config.DEFAULT_AVATAR);
                    } else {
                        console.log('No jpg or png for', username, img);
                        return callback(null, config.DEFAULT_AVATAR);
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

    var getStatus = function (callback) {
        twisterRpc("getinfo", [], function (err, data) {
            if (err) {
                checkError(err);
                if (err.message == status.NOCONNECTION) {
                    return callback(status.NOCONNECTION);
                }
            } else if (data) {
                callback();
            }
        });
    }

    var getInfo = function (callback) {
        twisterRpc("getinfo", [], function (err, data) {
            if (err) {
                checkError(err);
                return callback(err);
            }
            callback(null, {
                dhtNodes: data.dht_nodes,
                connections: data.connections,
                peers: data.addrman_total,
                blocks: data.blocks
            });
        });
    }


    var getBestBlock = function (callback) {
        twisterRpc("getbestblockhash", [], function (err, hash) {
            if (err) {
                checkError(err);
                return callback(err);
            }
            twisterRpc("getblock", [hash], function (err, data) {
                if (err) {
                    checkError(err);
                    return callback(err);
                }
                callback(null, {
                    hash: data.hash,
                    time: data.time
                });
            });
        });
    }

    var getUsers = function (callback) {
        twisterRpc("listwalletusers", [], function (err, users) {
            callback(err, users);
        });
    }

    var importUser = function (username, key, callback) {
        twisterRpc("importprivkey", [key, username], function (err, data) {
            console.log("importprivkey data", err, data);
            callback(err, data);
        });
    }

    var getFollowersFromDht = function (username, callback) {
        twisterRpc("dhtget", [username, "following1", "s"], function (err, data) {
            console.log("getfollowersfromdht data", err, data);
            if (err) return callback(err);
            if (!data) callback(null, null);
            if (data.length == 0) callback(null, data);
            callback(err, data[0].p.v);
        });
    }

    var getTrendingHashtags = function (count, callback) {
        twisterRpc("gettrendinghashtags", [count], function (err, data) {
            callback(err, data);
        });
    }

    var getReplies = function (username, k, callback) {
        twisterRpc("dhtget", [username, "replies" + k, "m"], function (err, data) {
            callback(err, data);
        });
    }

    var getPost = function (username, k, callback) {
        twisterRpc("dhtget", [username, "post" + k, "s"], function (err, data) {
            callback(err, data);
        });
    }

    var follow = function (username, users, callback) {
        twisterRpc("follow", [username, users], function (err, data) {
            callback(err, data);
        });
    }

    var post = function (username, text, callback) {
        var k;
        getPosts(username, 1, function (err, posts) {
            if (err) return callback(err);
            if (posts.length == 0) {
                k = 0;
            } else {
                k = posts[0].k + 1;
            }
            twisterRpc("newpostmsg", [username, k, text], function (err, data) {
                callback(err, data);
            });
        });
    }

    var startDeamon = function () {
        var path = dir.replace(/\\/g, "\\");
        var cmd = path + 'twister\\twisterd.exe -daemon -rpcuser=user -rpcpassword=pwd -rpcallowip=127.0.0.1 -datadir=' + path.replace('C:', '/cygdrive/c') + 'twister/data';
        console.log('execute', cmd);
        exec(cmd, function (error, stdout, stderr) {
            console.log(arguments);
        });
    }

    var stopDeamon = function (callback) {
        twisterRpc("stop", [], function (err, data) {
            callback(err, data);
        });
    }

    return {
        getPosts: getPosts,
        getFollowing: getFollowing,
        getAvatar: getAvatar,
        getStatus: getStatus,
        getInfo: getInfo,
        getBestBlock: getBestBlock,
        getUsers: getUsers,
        importUser: importUser,
        getFollowersFromDht: getFollowersFromDht,
        getTrendingHashtags: getTrendingHashtags,
        getReplies: getReplies,
        getPost: getPost,
        follow: follow,
        post: post,
        startDeamon: startDeamon,
        stopDeamon: stopDeamon,
        status: status
    };
})();
