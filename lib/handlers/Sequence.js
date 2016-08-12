var EventEmitter = require('events').EventEmitter
var util = require('util')
var isFunction = require('lodash.isfunction')
var R = require('ramda')
var Noop = require('./Noop')

function Sequence(_handlers) {

    var handlers = R.map(function(handler) {
        if (isFunction(handler.handle) && isFunction(handler.on)) return handler
        throw new Error('Handlers must extend EventEmitter and expose a handle function')
    }, _handlers || [new Noop()])
    var self = this

    this.handle = function(event) {
        R.head(handlers).handle(event)
    }

    R.times(function(i) {
        handlers[i].on('message', function(event) {
            handlers[i+1].handle(event)
        })
    }, handlers.length - 1)

    R.last(handlers).on('message', function(event) {
        self.emit('message', event)
    })

    EventEmitter.call(this);
}

util.inherits(Sequence, EventEmitter)

module.exports = Sequence