define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var PostModel = require("models/Post");

    module.exports = Backbone.Collection.extend({
        model: PostModel,
        comparator: function(model){ return model.get('time') * -1 },
        
        hasPostsAfter: function (time)
        {
            return models.at(models.length).get('time') < time;
        }
    });
});
