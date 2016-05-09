var R = require('ramda')
var Logger = require('../../').Logger
var handlers = require('../../').handlers
var pkg = require('../../package.json')

module.exports = function(app, appender) {
    var logger = new Logger()
    var sequence = new handlers.Sequence([
        new handlers.EnvDecorator(),
        new handlers.SystemDecorator(),
        new handlers.ProcessDecorator(),
        new handlers.TimestampDecorator(),
        new handlers.Merge(pkg, { key: 'package'}),
        new handlers.Flatten(),
        new handlers.KeyFilter({ include: [
            'timestamp',
            'tracer',
            'message',
            'level',
            'error',
            'process',
            'package.name',
            'package.version',
            'os',
            'env.NODE_ENV',
            'env.USER',
            'env.PWD',
            'request',
            'response'
        ], exclude: [
            'password',
            'secret',
            'token',
            'dependencies',
            'devDependencies',
        ]}),
        new handlers.Unflatten()
    ])
    logger.on('message', sequence.handle)

    sequence.on('message', appender)
    app.locals.logger = logger
}
