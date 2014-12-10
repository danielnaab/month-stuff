'use strict';

var hg = require('mercury')
var h = hg.h


function Product(item) {
    item = item || {}

    return hg.state({
        asin: hg.value(item.asin),
        url: hg.value(item.url),
        title: hg.value(item.title || ''),
        brand: hg.value(item.brand),
        manufacturer: hg.value(item.manufacturer),
        quantity: hg.value(item.quantity),
        feature: hg.value(item.description || ''),
        image: hg.value(item.image || ''),
        price: hg.value(item.price || '')
    })
}


Product.render = function render(product, date, clearCallback) {
    return h('div', [
        date ? h('.date', [
            h('span.month', date.toLocaleDateString(undefined, {month: 'long'})),
            ' ',
            h('span.day', date.toLocaleDateString(undefined, {day: 'numeric'})),
            ', ',
            h('span.year', date.toLocaleDateString(undefined, {year: 'numeric'}))
        ]) : null,
        clearCallback ? h('.clear', {
            'ev-click': hg.clickEvent(clearCallback, product)
        }, 'Remove') : null,
        product.image ? h('img', {src: product.image.url,
                                  width: product.image.width,
                                  height: product.image.height}) : null,
        h('a', {href: product.url,
                target: '_blank'}, [
            h('h1.title', product.title),
            //h('span.asin', product.ASIN)
        ]),
        h('p.description', product.description)
    ])
}


module.exports = Product
