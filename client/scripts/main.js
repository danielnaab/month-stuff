'use strict';

var document = require('global/document')
var window = require('global/window')

var hg = require('mercury')

var rafListen = require('./lib/raf-listen.js')
var App = require('./app.js')


function createApp() {
    /*var storedState = window.localStorage.getItem('monthstuff@1')
    var initialState = storedState ? JSON.parse(storedState) : {
        products: [{
            asin: 'asdfasd',
            title: 'Title',
            description: 'Description',
            image: 'https://www.google.com/images/srpr/logo11w.png',
            price: '$12.99'
        }, {
            asin: 'fdsa',
            title: 'Title2',
            description: 'Description2',
            image: 'https://www.google.com/images/srpr/logo11w.png',
            price: '$13.99'
        }]
    }*/
    var app = App({})

    rafListen(app, function onChange(value) {
        window.localStorage.setItem('monthstuff@1', JSON.stringify(value))
    })

    return app
}


hg.app(document.body, createApp(), App.render)
