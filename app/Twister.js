define(function(require, exports, module) {
    "use strict";

    var $ = require("jquery.jsonrpcclient");

    module.exports = (function () {

        var twisterRpc = function (method, params, callback) {
            var caller = new $.JsonRpcClient({ ajaxUrl: 'http://192.168.56.1:28332/', username: 'user', password: 'pwd'});
            caller.call(method, params, 
                function (result) {
                    callback (null, result);
                },
                function (error) {
                    callback(error);
                }
            );
        }

        var getPosts = function (username, amount, callback) {
            twisterRpc("getposts", [amount, [{username: username}]], function (err, data) {
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

        return {
            getPosts: getPosts,
            getFollowing: getFollowing 
        };
    })();
});
