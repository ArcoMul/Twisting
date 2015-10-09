"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    MessageModel = require("../models/Message");

Backbone.$ = $;

module.exports = Backbone.Collection.extend({
    model: MessageModel,
    comparator: function(model){ return model.get('time') * -1 }
});
