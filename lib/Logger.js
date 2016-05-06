var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')
var extend = require('deep-extend')

function Logger(_options) {

    var options = extend({ level: 'info', maxListeners: 100 }, _options)
    var listeners = {}
    var children = []
    var self = this

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

    this.log = function log(arg1, arg2, arg3) {
        var text, error, context, level, defaults

        if (arguments.length === 3 && util.isString(arg1) && util.isError(arg2) && util.isObject(arg3)) {
            text = { message: arg1}
            error = fromError(arg2)
            context = arg3
            defaults = { message: 'An unspecified error occurred', level: 'error' }
        } else if (arguments.length === 2 && util.isString(arg1) && util.isError(arg2)) {
            text = { message: arg1 }
            error = fromError(arg2)
            context = {}
            defaults = { message: 'An unspecified error occurred', level: 'error' }
        } else if (arguments.length === 2 && util.isString(arg1) && util.isObject(arg2)) {
            text = { message: arg1 }
            error = {}
            context = arg2
            defaults = { message: '', level: options.level }
        } else if (arguments.length === 2 && util.isError(arg1) && util.isObject(arg2)) {
            text = { level: 'error'}
            error = fromError(arg1)
            context = arg2
            defaults = { message: 'An unspecified error occured', level: 'error' }
        } else if (arguments.length === 1 && util.isString(arg1)) {
            text = { message: arg1 }
            error = {}
            context = {}
            defaults = { message: '', level: options.level }
        } else if (arguments.length === 1 && util.isError(arg1)) {
            text = {}
            error = fromError(arg1)
            context = {}
            defaults = { message: 'An unspecified error occured', level: 'error' }
        } else if (arguments.length === 1 && util.isObject(arg1)) {
            text = {}
            error = {}
            context = arg1
            defaults = { message: '', level: options.level }
        } else {
            text = {}
            error = fromError(new Error('Logger usage error'))
            context = { arguments: Array.prototype.slice.call(arguments) }
            defaults = { message: 'An unspecified error occured', level: 'error' }
        }

        var message = { message: text.message || error.message || context.message || defaults.message }
        var level = { level: error.level || context.level || defaults.level }

        this.emit('message', R.mergeAll([context, error, level, message]))
    }

    this.trace = function trace(event) {
        this.emit('message', R.merge(event, { level: 'trace' }))
    }

    this.debug = function debug(event) {
        this.emit('message', R.merge(event, { level: 'debug' }))
    }

    this.info = function info(event) {
        this.emit('message', R.merge(event, { level: 'info' }))
    }

    this.warn = this.warning = function warn(event) {
        this.emit('message', R.merge(event, { level: 'warn' }))
    }

    this.error = function error(event) {
        this.emit('message', R.merge(event, { level: 'error' }))
    }

    this.fatal = function fatal(event) {
        this.emit('message', R.merge(event, { level: 'fatal' }))
    }

    function fromError(err) {
        var result = R.pick(Object.getOwnPropertyNames(err), err)
        if (result.message === 'null') result.message = undefined
        return result
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
