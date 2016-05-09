var EventEmitter = require('events').EventEmitter
var util = require('util')
var isString = util.isString
var isFunction = util.isFunction
var merge = require('merge')
var R = require('ramda')

function Env() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge.recursive(true, { env: process.env }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Env, EventEmitter)

module.exports = Env