'use strict';

var amazon = require('./amazon.js')


function search(keywords, page, callback) {
    // Query Amazon's `ItemSearch` API.
    amazon.itemSearch({page: page, keywords: keywords},
                      function (err, products, totalPages) {
        if (err) {
            callback(err)
            return
        }
        callback(false, products, totalPages)
    })
}


function getProducts(ASINs, callback) {
    // Query Amazon's `ItemSearch` API.
    amazon.getItems(ASINs, function (err, products) {
        if (err) {
            callback(err)
            return
        }
        callback(false, products)
    })
}


function _getDateOffset(date, monthOffset) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    newDate.setMonth(newDate.getMonth() + monthOffset)
    return newDate
}


function scheduleNotifications(club, emailAddress, callback) {
    var emails = []

    club.ASINs.map(function (ASIN, index) {
        emails.push({
            ASIN: ASIN,
            buyDate: _getDateOffset(club.startDate, index),
            clubDescription: club.clubDescription,
            emailAddress: emailAddress
        })
    })

    callback(null)
}


module.exports = {
    search: search,
    getProducts: getProducts,
    scheduleNotifications: scheduleNotifications
}
