var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')

function Env() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge({}, { env: process.env }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Env, EventEmitter)

module.exports = Env