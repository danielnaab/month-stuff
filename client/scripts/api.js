'use strict';

var document = require('global/document')
var window = require('global/window')
var xhr = require('xhr')
var querystring = require('querystring')

var config = require('./config.js')


var ENDPOINTS = {
    autocomplete: 'http://completion.amazon.com/search/complete',
    club: config.API_ROOT + 'club',
    search: config.API_ROOT + 'search'
}


function autocomplete(keywords, callback) {
    // Do a little homebrew jsonp so we can auto-complete without proxying,
    // direct from Amazon's servers.

    // Add the callback function to the globals.
    var callbackName = 'autocomplete_' + Math.round(100000 * Math.random())
    window[callbackName] = function () {
        delete window[callbackName]
        document.body.removeChild(script)
        // The response places the `completion` object as a global.
        callback(window.completion[1])
    }

    // Create a script tag for the completion URL.
    var script = document.createElement('script')
    script.src = ENDPOINTS.autocomplete + '?' + querystring.stringify({
        'search-alias': 'aps',
        client: 'amazon-search-ui',
        mkt: 1,
        q: keywords,
        x: callbackName
    })
    document.body.appendChild(script)
}


function search(keywords, page, callback) {
    xhr({
        url: ENDPOINTS.search + '?' + querystring.stringify({
            keywords: keywords,
            page: page || 1
        }),
        json: true,
        response: true,
    }, function (error, response, body) {
        if (error) {
            console.log('Search error')
        }
        else {
            callback(body.status, body.products, body.numPages)
        }
    })
}


function saveClub(club, callback) {
    xhr({
        method: 'POST',
        url: ENDPOINTS.club,
        json: {
            ASINs: club.ASINs,
            startDate: club.startDate,
            description: club.description
        },
        response: true,
    }, function (error, response, body) {
        if (error || !(response.status && response.status.success)) {
            console.log('Error saving club')
        }
        else {
            callback(response.clubId)
        }
    })
}


function getClub(clubId, callback) {
    xhr({
        method: 'GET',
        url: ENDPOINTS.club + '/' + clubId,
        json: true,
        response: true,
    }, function (error, response, body) {
        if (error || !(response.status && response.status.success)) {
            console.log('Error getting club')
        }
        else {
            callback(response.clubId)
        }
    })
}


module.exports = {
    search: search,
    autocomplete: autocomplete,
    saveClub: saveClub,
    getClub: getClub
}
