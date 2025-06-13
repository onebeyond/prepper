var EventEmitter = require('events').EventEmitter
var util = require('util')
var _ = require('lodash')

function Process() {

    var self = this

    this.handle = function(event) {
        self.emit('message', _.merge({}, { process: { title: process.title, version: process.version, pid: process.pid, memory: process.memoryUsage() }}, event))
    }

    EventEmitter.call(this);
}

util.inherits(Process, EventEmitter)

module.exports = Process