'use strict';

var hg = require('mercury'),
    document = require('global/document'),
    window = require('global/window')

var App = require('./app.js'),
    config = require('./config.js'),
    rafListen = require('./lib/raf-listen.js')


var CLUB_STATE_KEY = 'monthstuff-build-club@' + config.STATE_VERSION


/**
 * The initial state will be determined by:
 * - the presence of a global, `window.initialState`, set by the server-render
 * - additional state stored in localStorage
 */
function getInitialState() {
    var initialState = window.initialState || {}

    if (window.localStorage !== undefined) {
        var initialClub = window.localStorage.getItem(CLUB_STATE_KEY)
        if (initialClub) {
            initialState.club = JSON.parse(initialClub)
        }
    }

    return initialState
}


function createApp() {
    var app = App(getInitialState())

    rafListen(app, function onChange(value) {
        window.localStorage.setItem('CLUB_STATE_KEY', JSON.stringify(value.club))
    })

    return app
}


var elem = document.getElementById('app')
elem.innerHTML = ''
hg.app(elem, createApp(), App.render)
