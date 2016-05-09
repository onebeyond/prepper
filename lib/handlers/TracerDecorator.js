var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('merge')
var uuid = require('node-uuid').v4

function TracerDecorator() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge.recursive(true, { tracer: uuid() }, event))
    }

    EventEmitter.call(this);
}

util.inherits(TracerDecorator, EventEmitter)

module.exports = TracerDecorator