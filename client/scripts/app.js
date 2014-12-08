'use strict';

var hg = require('mercury')
var h = hg.h

var ClubBuild = require('./components/club-build.js')
var Router = require('./lib/router')


//var ROOT_URI = String(document.location.pathname)
var PRODUCTS_URI = '#products'
var BUILD_CLUB_URI = '#build-club'


function App(opts) {
    opts = opts || {}

    var state = hg.state({
        //products: hg.array((opts.products || []).map(Product)),
        clubBuild: ClubBuild(),
        route: Router(),
        handles: {}
    })

    /*Product.onDestroy.asHash(state.todos, function onDestroy(ev) {
        state.products.delete(opts.id)
    })*/

    return state
}

function renderHeader(state) {
    return h('header#header', [
        h('h1', 'Month Stuff'),
        h('h2', '... build your own gift of the month club.'),
        /*h('ul', [
            h('li', h('a', {src: '#'}, 'Item 1')),
            h('li', h('a', {src: '#'}, 'Item 2'))
        ])*/
    ])
}


function renderRoute(state) {
    if (state.route === BUILD_CLUB_URI) {
        return ClubBuild.render(state.clubBuild)
    }
    else if (state.route === PRODUCTS_URI) {
        //return renderMainSection(state.products, state.route, state.handles)
    }
    else {
        throw 'Unknown route'
    }
}


App.render = function render(state) {
    return h('#app', [
        hg.partial(renderHeader, state),
        //renderMainSection(state.products, state.route, state.handles)
        hg.partial(renderRoute, state)
    ])
}


module.exports = App
