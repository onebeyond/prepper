var EventEmitter = require('events').EventEmitter
var util = require('util')
var os = require('os')
var merge = require('merge')
var R = require('ramda')

function SystemDecorator() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge.recursive(true, { os: { hostname: os.hostname(), loadavg: os.loadavg, mem: { total: os.totalmem(), free: os.freemem() }, type: os.type(), platform: os.platform(), release: os.release() }}, event))
    }

    EventEmitter.call(this);
}

util.inherits(SystemDecorator, EventEmitter)

module.exports = SystemDecorator