var EventEmitter = require('events').EventEmitter
var util = require('util')
var isString = util.isString
var isError = util.isError
var isObject = util.isObject
var merge = require('lodash.merge')
var R = require('ramda')
var Sequence = require('./handlers/Sequence')

function Logger(_options) {

    var options = merge({}, { message: '', level: 'info', maxListeners: 100 }, _options)
    var children = []
    var self = this

    self.connect = function connect() {
        var args = Array.prototype.slice.apply(arguments)
        var sequence = new Sequence(args)
        self.on('message', sequence.handle)
        return sequence
    }

    self.log = function log(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args)
        return self
    }

    self.trace = function trace(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('trace'))
        return self
    }

    self.debug = function debug(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('debug'))
        return self
    }

    self.info = function info(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('info'))
        return self
    }

    self.warn = function warn(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('warn'))
        return self
    }

    self.error = function error(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('error'))
        return self
    }

    self.fatal = function fatal(arg1, arg2, arg3) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('fatal'))
        return self
    }

    self._logEvent = function(arg1, arg2, arg3, arg4) {
        // message, error, context, level
        if (arguments.length === 4) return self.emit('message', merge({},
            { message: options.message, level: options.level },
            arg3,
            toError(arg2),
            toMessage(arg1),
            toLevel(arg1, arg2, arg3, arg4)
        ))
        // message, error, level
        if (arguments.length === 3 && isString(arg1) && isError(arg2) && isString(arg3)) return self._logEvent(arg1, arg2, null, arg3)
        // message, error, context
        if (arguments.length === 3 && isString(arg1) && isError(arg2) && isObject(arg3)) return self._logEvent(arg1, arg2, arg3, null)
        // message, context, level
        if (arguments.length === 3 && isString(arg1) && isObject(arg2) && isString(arg3)) return self._logEvent(arg1, null, arg2, arg3)
        // error, context, level
        if (arguments.length === 3 && isError(arg1) && isObject(arg2) && isString(arg3)) return self._logEvent(null, arg1, arg2, arg3)
        // message, level
        if (arguments.length === 2 && isString(arg1) && isString(arg2)) return self._logEvent(arg1, null, null, arg2)
        // message, error
        if (arguments.length === 2 && isString(arg1) && isError(arg2)) return self._logEvent(arg1, arg2, null, null)
        // message, context
        if (arguments.length === 2 && isString(arg1) && isObject(arg2)) return self._logEvent(arg1, null, arg2, null)
        // error, level
        if (arguments.length === 2 && isError(arg1) && isString(arg2)) return self._logEvent(null, arg1, null, arg2)
        // error, context
        if (arguments.length === 2 && isError(arg1) && isObject(arg2)) return self._logEvent(null, arg1, arg2, null)
        // context, level
        if (arguments.length === 2 && isObject(arg1) && isString(arg2)) return self._logEvent(null, null, arg1, arg2)
        // message
        if (arguments.length === 1 && isString(arg1)) return self._logEvent(arg1, null, null, null)
        // error
        if (arguments.length === 1 && isError(arg1)) return self._logEvent(null, arg1, null, null)
        // context
        if (arguments.length === 1 && isObject(arg1)) return self._logEvent(null, null, arg1, null)
        // usage error
        return self._logEvent(null, toError(new Error('Logger usage error')), { arguments: toArray(arguments) }, 'error')
    }

    function toMessage(message) {
        return message ? { message: message } : {}
    }

    function toError(error) {
        return error ? {
            message: error.message && error.message !== 'null' ? error.message : 'An unspecified error occurred',
            level: error.level || 'error',
            error: R.pipe(R.pick(Object.getOwnPropertyNames(error)), R.omit('level'))(error)
        } : {}
    }

    function toLevel(message, error, context, level) {
        if (level) return { level: level }
        if (error && error.level) return { level: error.level }
        if (context && context.level) return { level: context.level }
        if (error) return { level: 'error' }
        return {}
    }

    function toArray(arguments) {
        return Array.prototype.slice.call(arguments)
    }

    EventEmitter.call(self);
    self.setMaxListeners(options.maxListeners)
}

util.inherits(Logger, EventEmitter)

module.exports = Logger
