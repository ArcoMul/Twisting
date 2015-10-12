// Break out the application running fr×om the configuration definition to
// assist with testing.

var fs = require('fs'),
    gui = window.require('nw.gui');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

global.document = window.document;
global.navigator = window.navigator;

var $ = require('jquery'),
    Backbone = require('backbone'),
    Twister = require('./Twister'),
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
$(window.document).on('keyup', function (e) {
    if (e.keyCode == 123) {
        gui.Window.get().showDevTools();
    }
});

var win = gui.Window.get();
win.on('close', function() {
    // gui.App.quit();
    Twister.stopDeamon(function (err, data) {
        if (err) return console.log('Error stopping deamon, inspect!', err);
        // TODO: show an overlay that the deamon is exiting + a force close button
        gui.App.quit();
    });
});

// Enable shadow
// var win = gui.Window.get();
// win.minimize();
// win.restore();
