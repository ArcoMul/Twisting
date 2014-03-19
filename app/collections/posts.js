define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var PostModel = require("models/Post");

    module.exports = Backbone.Collection.extend({
      model: PostModel 
    });
});
