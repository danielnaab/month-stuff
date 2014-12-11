'use strict';

var hg = require('mercury'),
    h = hg.h

var Club = require('./components/club.js'),
    ClubBuild = require('./components/club-build.js'),
    a = require('./lib/router/anchor'),
    getRouter = require('./lib/router/getRouter')


//var ROOT_URI = String(document.location.pathname)
var HOME_URI = '/',
    PRODUCTS_URI = '/products',
    BUILD_CLUB_URI = '/build-club',
    CLUB_URI = '/club',
    ABOUT_URI = 'http://blog.crushingpennies.com/month-stuff-mercury'


function App(initialState, serverRoute) {
    return hg.state({
        clubBuild: ClubBuild(initialState.clubBuild),
        club: Club(initialState.club),
        route: (serverRoute ? getRouter(serverRoute, false) :
                              getRouter()),
        handles: {}
    })
}


function renderHeader(state) {
    return h('nav', [
        h('h1', 'Month Stuff'),
        h('h2', '... build your own gift of the month club.'),
        h('ul', [
            h('li', a({href: HOME_URI}, 'Browse')),
            h('li', a({href: BUILD_CLUB_URI}, 'Build')),
            h('li', a({href: ABOUT_URI}, 'About'))
        ])
    ])
}


function renderRoute(state) {
    if (state.route === BUILD_CLUB_URI) {
        return ClubBuild.render(state.clubBuild)
    }

    // #club-asin/:description/:ASINs/:startDate
    else if (state.route.indexOf(CLUB_URI) === 0) {
        var parts = state.route.slice(CLUB_URI.length + 1, state.route.length)
        parts = parts.split('/')

        // Get parameters. Allow any to be missing or malformed, and still
        // render the view with them nulled out.
        var description, ASINs, startDate
        try {
            description = parts[0]
            ASINs = parts[1].split(',')
            startDate = new Date(parts[2])
        }
        finally {
            return Club.render(state.club)
        }
    }

    else if (state.route === PRODUCTS_URI) {
    }

    else {
        throw 'Unknown route: "' + state.route + '"'
    }
}


App.render = function render(state) {
    return h('div', [
        renderHeader(state),
        renderRoute(state)
    ])
}


module.exports = App
