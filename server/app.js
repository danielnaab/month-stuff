'use strict';

var app = require('express')(),
    h = require('mercury').h,
    Joi = require('Joi'),
    stringify = require('virtual-dom-stringify')

var ClientApp = require('../client/scripts/app.js'),
    api = require('./api.js')


var SEARCH_SCHEMA = {
    keywords: Joi.string().required(),
    page: Joi.number().integer().default(1)
}
var SCHEDULE_STUFF_NOTIFICATIONS = {
    ASINs:  Joi.array().includes(Joi.string()).required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
}
var DEBUG = false


app.get('/api/search', function (req, res) {
    // Validate query parameters.
    var info = Joi.validate(req.query, SEARCH_SCHEMA)
    if (info.error) {
        res.end(JSON.stringify({
            status: {
                success: false,
                info: info.error
            }
        }))
        return
    }

    var params = info.value
    api.search(params.keywords, params.page, function (err, products, numPages) {
        if (err) {
            res.end(JSON.stringify({
                status: {
                    success: false,
                    info: err
                }
            }))
            return
        }

        res.end(JSON.stringify({
            status: {
                success: true
            },
            products: products,
            numPages: numPages
        }))
    })
})


app.get('/api/products/:ASINs', function (req, res) {
    var ASINs = req.params.ASINs.split(',')
    api.getProducts(ASINs, function (err, products) {
        if (err) {
            res.end(JSON.stringify({
                status: {
                    success: false,
                    info: err
                }
            }))
            return
        }
        res.end(JSON.stringify({
            status: {
                success: true
            },
            products: products
        }))
    })
})


/*app.get('/api/club/:clubId', function (req, res) {
    db.getClub(req.params.clubId, function (club) {
        if (!club) {
            res.status(404).end('Club not found')
            return
        }

        res.end(JSON.stringify({
            status: {
                success: true
            },
            club: res.end(JSON.stringify(club))
        }))
    })
})*/


app.post('/api/scheduleNotifications', function (req, res) {
    // Validate query parameters.
    var info = Joi.validate(req.query, SCHEDULE_STUFF_NOTIFICATIONS)
    if (info.error) {
        res.end(JSON.stringify({
            status: {
                success: false
            }
        }))
        return
    }

    var params = info.value
    api.scheduleNotifications(params.ASINs, params.description, params.startDate,
                              function (err) {
        if (err) {
            res.end(JSON.stringify({
                status: {
                    success: false,
                    info: err
                }
            }))
            return
        }
        res.end(JSON.stringify({
            status: {
                success: true
            }
        }))
    })
})


function serverRenderRoute(state, req, res) {
    var vtree = h('html', {lang: 'en'}, [
        h('head', [
            h('meta', {charset: 'utf-8'}),
            h('title', 'Month Stuff'),
            h('link', {
                href: 'http://localhost:9000/styles/app.css',
                rel: 'stylesheet',
                media: 'screen'
            })
        ]),
        h('body', [
            h('#app', ClientApp.render(state)),
            h('script', 'var initialState = ' + JSON.stringify(state)),
            h('script', {src: 'http://localhost:9000/scripts/main.js'})
        ])
    ])

    res.setHeader('Content-Type', 'text/html')
    res.end('<!DOCTYPE html>' + stringify(vtree))
}


/*
 * Attempt at server rendering. The general idea works, but observ is behaving
 * differently on node than in-browser, causing some issues.
 */
app.get('/build-club', function (req, res) {
    var state = ClientApp({route: 'build-club'})()
    serverRenderRoute(state, req, res)
})


/*
 * Attempt at server rendering. The general idea works, but observ is behaving
 * differently on node than in-browser, causing some issues.
 */
app.get('/club/:description/:startDate/:ASINs', function (req, res) {
    var state = ClientApp({
        route: 'club',
        club: {
            description: req.params.description,
            products: [{
                ASIN: 'B000HMB0IM'
            }],
            startDate: new Date(req.params.startDate)
        }
    })()
    serverRenderRoute(state, req, res)
})


function createServer(port, debug) {
    DEBUG = debug
    var server = app.listen(port, function () {
        var host = server.address().address
        var port = server.address().port
        console.log('Server listening at http://%s:%s', host, port)
    })
    return server
}


module.exports = createServer
