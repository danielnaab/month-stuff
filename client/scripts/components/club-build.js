'use strict';

var hg = require('mercury')
var h = hg.h

var Club = require('./club.js')
var Search = require('./search.js')


function ClubBuild(initial) {
    initial = initial || {}

    var state = hg.state({
        search: Search(initial.search, function (product) {
            state.club.products.push(product)
        }),
        club: Club(initial.club)
    })

    return state
}


ClubBuild.render = function render(state) {
    return h('.club-build', [
        Search.render(state.search),
        Club.render(state.club, true)
    ])
}


module.exports = ClubBuild
