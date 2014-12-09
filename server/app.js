'use strict';

var Amazon = require('apac').OperationHelper,
    app = require('express')(),
    Joi = require('Joi')

var config = require('./config')
var db = require('./db')


// Globals
var AMAZON = new Amazon({
    awsId: config.amazon.awsId,
    awsSecret: config.amazon.awsSecret,
    assocId: config.amazon.assocId
})
var SEARCH_SCHEMA = {
    keywords: Joi.string().required(),
    page: Joi.number().integer().default(1)
}
var ADD_CLUB_SCHEMA = {
    ASINs:  Joi.array().includes(Joi.string()).required()
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

    // Query Amazon's `ItemSearch` API.
    var options = {
        // Global options:
        ResponseGroup: 'ItemAttributes,OfferSummary,Images',
        Condition: 'New',
        // User options:
        ItemPage: params.page,
        SearchIndex: 'All',
        Keywords: params.keywords
    }
    AMAZON.execute('ItemSearch', options, function(err, results) {
        if (err) {
            res.end(JSON.stringify({
                status: {
                    success: false,
                    info: 'There was an error searching Amazon Products.'
                }
            }))
            return
        }

        var items = results.ItemSearchResponse.Items[0].Item
        if (items === undefined) {
            res.end(JSON.stringify({
                status: {
                    success: false,
                    info: 'We are sad'
                }
            }))
            return
        }

        var products = items.map(function (item) {
            var summary = item.OfferSummary ? (
                item.OfferSummary[0].LowestNewPrice ||
                item.OfferSummary[0].LowestUsedPrice) : null
            return {
                ASIN: item.ASIN[0],
                url: item.DetailPageURL[0],
                brand: (item.ItemAttributes[0].Brand !== undefined ?
                        item.ItemAttributes[0].Brand[0] : null),
                title: (item.ItemAttributes[0].Title !== undefined ?
                        item.ItemAttributes[0].Title[0] : null),
                feature: (item.ItemAttributes[0].Feature !== undefined ?
                          item.ItemAttributes[0].Feature[0] : null),
                // Available images: SmallImage, MediumImage, LargeImage
                image: item.SmallImage ? {
                    url: item.SmallImage[0].URL[0],
                    width: item.SmallImage[0].Width[0]._,
                    height: item.SmallImage[0].Height[0]._
                } : null,
                manufacturer: item.Manufacturer,
                quantity: item.NumberOfItems,
                price: (summary && summary[0].FormattedPrice ?
                            summary[0].FormattedPrice[0] :
                            'Price Unknown')
            }
        })

        res.end(JSON.stringify({
            status: {
                success: true
            },
            products: products,
            page: params.page,
            // The API will only allow retreiving a maximum of 10 pages.
            // If the "All" SearchIndex is used, it will only return 5 pages.
            numPages: Math.min(
                options.SearchIndex === 'All' ? 5 : 10,
                parseInt(results.ItemSearchResponse.Items[0].TotalPages))
        }))
    })
})


app.get('/api/club/:clubId', function (req, res) {
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
})


app.post('/api/club', function (req, res) {
    // Validate query parameters.
    var info = Joi.validate(req.query, ADD_CLUB_SCHEMA)
    if (info.error) {
        res.end(JSON.stringify({
            status: {
                success: false
            }
        }))
        return
    }
    var params = info.value

    db.createClub(params.clubId, function (club) {
        if (!club) {
            res.status(404).end('Club not found')
            return
        }

        res.end(JSON.stringify({
            status: {
                success: true
            },
            club: club
        }))
    })
})


/*
 * Attempt at server rendering. The general idea works, but observ is behaving
 * differently on node than in-browser, causing some issues.
 */
var h = require('mercury').h
var stringify = require('virtual-dom-stringify')
var ClientApp = require('../client/scripts/app.js')
app.get('/build-club', function (req, res) {
    var state = ClientApp({
        route: 'build-club'
    })()

    var vtree = h('html', {lang: 'en'}, [
        h('head', [
            h('meta', {charset: 'utf-8'}),
            h('title', 'Month Stuff')
        ]),
        h('body', [
            h('link', {
                href: 'http://localhost:9000/styles/app.css',
                rel: 'stylesheet',
                media: 'screen'
            }),
            h('#app', ClientApp.render(state)),
            h('script', 'var initialState = ' + JSON.stringify(state)),
            h('script', {src: 'http://localhost:9000/scripts/main.js'})
        ])
    ])

    res.setHeader('Content-Type', 'text/html')
    res.end('<!DOCTYPE html>' + stringify(vtree))
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
