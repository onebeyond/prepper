var EventEmitter = require('events').EventEmitter
var util = require('util')
var os = require('os')
var merge = require('lodash.merge')
var R = require('ramda')

function System() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge({}, { os: { hostname: os.hostname(), loadavg: os.loadavg(), mem: { total: os.totalmem(), free: os.freemem() }, type: os.type(), platform: os.platform(), release: os.release() }}, event))
    }

    EventEmitter.call(this);
}

util.inherits(System, EventEmitter)

module.exports = System