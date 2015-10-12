"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    ConversationModel = require("../models/Conversation");

Backbone.$ = $;

module.exports = Backbone.Collection.extend({
    model: ConversationModel,
    comparator: function(model){ return model.get('lastMessage') ? model.get('lastMessage').get('time') * -1 : 0 }
});
