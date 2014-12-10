'use strict';

var Amazon = require('apac').OperationHelper,
    async = require('async'),
    chunk = require('chunk')

var config = require('./config')


var AMAZON = new Amazon({
    awsId: config.amazon.awsId,
    awsSecret: config.amazon.awsSecret,
    assocId: config.amazon.assocId
})


function doSearch(operation, options, callback) {
    AMAZON.execute(operation, options, function(err, results) {
        if (err) {
            callback('There was an error searching Amazon Products.')
            return
        }

        var response = results[operation + 'Response']

        var items = response.Items[0].Item

        if (items === undefined) {
            callback('We are sad.')
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

        // The API will only allow retreiving a maximum of 10 pages.
        // If the "All" SearchIndex is used, it will only return 5 pages.
        callback(false, products, Math.min(
            options.SearchIndex === 'All' ? 5 : 10,
            parseInt(response.Items[0].TotalPages)))
    })
}


function getItems(asins, callback) {
    // We can only get 10 items at a time, so group them into chunks, and
    // append the results into the `products` array.
    var products = []
    async.each(chunk(asins, 10), function (itemIDs, cb) {
        var searchOptions = {
            ResponseGroup: 'ItemAttributes,OfferSummary,Images',
            ItemId: itemIDs.join(','),
            IdType: 'ASIN'
        }
        doSearch('ItemLookup', searchOptions, function (err, chunkedProducts) {
            if (err) {
                cb(err)
                return
            }
            products = products.concat(chunkedProducts)
            cb()
        })
    }, function (err) {
        if (err) {
            callback('Error retreiving matching ItemIDs.')
            return
        }
        callback(false, products)
    })
}


function itemSearch(options, callback) {
    var searchOptions = {
        // Global options:
        ResponseGroup: 'ItemAttributes,OfferSummary,Images',
        Condition: 'New',
        SearchIndex: 'All',
        // User options:
        ItemPage: options.page,
        Keywords: options.keywords
    }
    doSearch('ItemSearch', searchOptions, callback)
}


module.exports = {
    itemSearch: itemSearch,
    getItems: getItems
}
