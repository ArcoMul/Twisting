define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var app = require("app");
    var userProfileTemplate = _.template(require("text!templates/user-profile.html"));
    var PostsCollection = require("collections/posts");
    var PostModel = require("models/Post");

    module.exports = Backbone.View.extend({

        posts: null,

        events: {
            "click a": "openLink",
        },

        initialize: function() {
            console.log("Initialize user profile");
            
            var self = this;

            this.posts = new PostsCollection();

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

            twisterRpc("getposts", [10, [{username: this.model.get('username')}]], function (err, data) {
                if (err) {
                    console.log('err', err);
                    return;
                }
                _.each(data, function (item) {
                    self.posts.add([new PostModel({message: item.userpost.msg, username: item.userpost.n})]);
                });
                console.log(self.posts);
                self.render();
            });

            this.setElement($("#main-page"));
        },

        openLink: function (e) {
            console.log (arguments);
            app.router.navigate(e.target.pathname, {trigger: true});
            e.preventDefault();
        },

        render: function() {
            console.log("Render user profile");
            this.$el.html(userProfileTemplate({user: this.model, posts: this.posts}));
            return this;
        }
    });
});

