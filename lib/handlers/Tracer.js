var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')
var uuid = require('node-uuid').v4

function Tracer() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge({}, { tracer: uuid() }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Tracer, EventEmitter)

module.exports = Tracer