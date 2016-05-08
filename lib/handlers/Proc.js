var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')

function Proc() {

    var self = this

    this.handle = function(event) {
        self.emit('message', R.merge({ process: { title: process.title, version: process.version, pid: process.pid, memory: process.memoryUsage() } }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Proc, EventEmitter)

module.exports = Proc