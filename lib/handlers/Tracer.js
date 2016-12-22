var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')
var uuid = require('uuid').v4

function Tracer(_options) {

    var options = _options || {}
    var self = this
    var tracer = options.tracer || uuid()

    this.handle = function(event) {
        self.emit('message', merge({}, { tracer: tracer }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Tracer, EventEmitter)

module.exports = Tracer