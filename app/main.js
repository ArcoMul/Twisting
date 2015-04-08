// Break out the application running from the configuration definition to
// assist with testing.

var fs = require('fs'),
    gui = window.require('nw.gui');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var $ = require('jquery'),
    Backbone = require('backbone'),
    app = require('./app'),
    Router = require('./router');

Backbone.$ = $;

// Define your master router on the application namespace and trigger all
// navigation from this instance.
app.router = new Router();

// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default.  Change in app.js.
Backbone.history.start({ root: app.root });
app.router.navigate('/index.html', {trigger: true});

// Press <d> to open dev tools
$(window.document).on('keypress', function (e) {
    console.log(e);
    if (e.keyCode == 100) {
        gui.Window.get().showDevTools();
    }
});

// Enable shadow
// var win = gui.Window.get();
// win.minimize();
// win.restore();
