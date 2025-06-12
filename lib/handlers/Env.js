var EventEmitter = require('events').EventEmitter
var util = require('util')
var _ = require('lodash')

function Env() {

    var self = this

    this.handle = function(event) {
        self.emit('message', _.merge({}, { env: process.env }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Env, EventEmitter)

module.exports = Env