var EventEmitter = require('events').EventEmitter
var util = require('util')
var isString = util.isString
var isError = util.isError
var isObject = util.isObject
var R = require('ramda')
var extend = require('deep-extend')
var Sequence = require('./handlers/Sequence')

function Logger(_options) {

    var options = extend({ message: '', level: 'info', maxListeners: 100 }, _options)
    var listeners = {}
    var children = []
    var self = this

    this.log = function log(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments))
    }

    this.trace = function trace(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('trace'))
    }

    this.debug = function debug(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('debug'))
    }

    this.info = function info(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('info'))
    }

    this.warn = function warn(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('warn'))
    }

    this.error = function error(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('error'))
    }

    this.fatal = function fatal(arg1, arg2, arg3) {
        logEvent.apply(self, toArray(arguments).concat('fatal'))
    }

    function logEvent(arg1, arg2, arg3, arg4) {
        // message, error, context, level
        if (arguments.length === 4) {
            return self.emit('message', R.mergeAll([
                { message: options.message, level: options.level },
                arg3,
                toError(arg2),
                toMessage(arg1),
                toLevel(arg1, arg2, arg3, arg4)
            ]))
        // message, error, level
        } else if (arguments.length === 3 && isString(arg1) && isError(arg2) && isString(arg3)) {
            return logEvent(arg1, arg2, null, arg3)
        // message, error, context
        } else if (arguments.length === 3 && isString(arg1) && isError(arg2) && isObject(arg3)) {
            return logEvent(arg1, arg2, arg3, null)
        // message, context, level
        } else if (arguments.length === 3 && isString(arg1) && isObject(arg2) && isString(arg3)) {
            return logEvent(arg1, null, arg2, arg3)
        // error, context, level
        } else if (arguments.length === 3 && isError(arg1) && isObject(arg2) && isString(arg3)) {
            return logEvent(null, arg1, arg2, arg3)
        // message, level
        } else if (arguments.length === 2 && isString(arg1) && isString(arg2)) {
            return logEvent(arg1, null, null, arg2)
        // message, error
        } else if (arguments.length === 2 && isString(arg1) && isError(arg2)) {
            return logEvent(arg1, arg2, null, null)
        // message, context
        } else if (arguments.length === 2 && isString(arg1) && isObject(arg2)) {
            return logEvent(arg1, null, arg2, null)
        // error, level
        } else if (arguments.length === 2 && isError(arg1) && isString(arg2)) {
            return logEvent(null, arg1, null, arg2)
        // error, context
        } else if (arguments.length === 2 && isError(arg1) && isObject(arg2)) {
            return logEvent(null, arg1, arg2, null)
        // context, level
        } else if (arguments.length === 2 && isObject(arg1) && isString(arg2)) {
            return logEvent(null, null, arg1, arg2)
        // message
        } else if (arguments.length === 1 && isString(arg1)) {
            return logEvent(arg1, null, null, null)
        // error
        } else if (arguments.length === 1 && isError(arg1)) {
            return logEvent(null, arg1, null, null)
        // context
        } else if (arguments.length === 1 && isObject(arg1)) {
            return logEvent(null, null, arg1, null)
        // usage error
        } else {
            return logEvent(null, toError(new Error('Logger usage error')), { arguments: toArray(arguments) }, 'error')
        }
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

    this.connect = function() {
        self.on('message', new Sequence(toArray(arguments)).handle)
    }

    this.child = function child(_childOptions) {
        var child = new Logger(extend(R.clone(_options || {}), R.clone(_childOptions)))
        R.keys(listeners).forEach(function(eventName) {
            R.forEach(function(listener) {
                child.on(eventName, listener)
            }, listeners[eventName])
        }, listeners)
        children.push(child)
        return child
    }

    EventEmitter.call(this);
    this.setMaxListeners(options.maxListeners)

    // Node 4 doesn't provide a mechanism to get all event listeners :()
    this.on('newListener', function __ernie_newListener(eventName, listener) {
        if (listener.name.startsWith('__ernie_')) return
        listeners[eventName] = listeners[eventName] || []
        listeners[eventName].push(listener)
        children.forEach(function(child) {
            child.on(eventName, listener)
        })
    })
    this.on('removeListener', function __ernie_removeListener(eventName, listener) {
        if (listener.name.startsWith('__ernie_')) return
        R.remove(listeners[eventName], listener)
        children.forEach(function(child) {
            child.removeListener(eventName, listener)
        })
    })
}

util.inherits(Logger, EventEmitter)

module.exports = Logger
