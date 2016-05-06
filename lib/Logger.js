var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')
var extend = require('deep-extend')

function Logger(_options) {

    var options = extend(R.clone(_options) || {}, { defaults: { level: 'info' } })

    this.connect = function connect(other) {
        this.on('message', function(event) {
            other.onMessage(event)
        })
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
            defaults = { message: '', level: options.defaults.level }
        } else if (arguments.length === 2 && util.isError(arg1) && util.isObject(arg2)) {
            text = { level: 'error'}
            error = fromError(arg1)
            context = arg2
            defaults = { message: 'An unspecified error occured', level: 'error' }
        } else if (arguments.length === 1 && util.isString(arg1)) {
            text = { message: arg1 }
            error = {}
            context = {}
            defaults = { message: '', level: options.defaults.level }
        } else if (arguments.length === 1 && util.isError(arg1)) {
            text = {}
            error = fromError(arg1)
            context = {}
            defaults = { message: 'An unspecified error occured', level: 'error' }
        } else if (arguments.length === 1 && util.isObject(arg1)) {
            text = {}
            error = {}
            context = arg1
            defaults = { message: '', level: options.defaults.level }
        } else {
            text = {}
            error = fromError(new Error('Invalid call to log'))
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
        return R.pick(Object.getOwnPropertyNames(err), err)
    }

    EventEmitter.call(this);
}

util.inherits(Logger, EventEmitter)

module.exports = Logger
