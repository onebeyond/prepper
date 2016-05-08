var EventEmitter = require('events').EventEmitter
var util = require('util')
var os = require('os')
var R = require('ramda')

function Pkg() {

    var self = this

    this.handle = function(event) {
        self.emit('message', R.merge({ os: { hostname: os.hostname(), loadavg: os.loadavg, mem: { total: os.totalmem(), free: os.freemem() }, type: os.type(), platform: os.platform(), release: os.release() } }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Pkg, EventEmitter)

module.exports = Pkg