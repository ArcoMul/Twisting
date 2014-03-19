define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var app = require("app");

    // Defining the application router.
    module.exports = Backbone.Model.extend({
        username: null,
    });
});
