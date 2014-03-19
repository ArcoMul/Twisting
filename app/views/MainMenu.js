define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var app = require("app");
    var mainMenuTemplate = _.template(require("text!templates/main-menu.html"));

    module.exports = Backbone.View.extend({

        events: {
            "click a": "navigate",
        },

        initialize: function() {
            this.setElement($("#main-menu"));
        },

        navigate: function (e) {
            app.router.navigate(e.target.pathname, {trigger: true});
            e.preventDefault();
        },

        render: function() {
            this.$el.html(mainMenuTemplate({user: this.model}));
            return this;
        }
    });
});

