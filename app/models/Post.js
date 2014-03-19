define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var app = require("app");

    // Defining the application router.
    module.exports = Backbone.Model.extend({
        message: null,
        time: null,
        user: null,

        getMessageRegexed: function () {
            if (!this.get('message')) return "";
            return this.get('message').replace( /(^|[^@\w])@(\w{1,15})\b/g, '$1<a href="/user/$2">@$2</a>' );
        }
    });
});
