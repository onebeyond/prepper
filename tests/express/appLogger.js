var R = require('ramda')
var Logger = require('../../').Logger
var handlers = require('../../').handlers
var pkg = require('../../package.json')

module.exports = function(app, appender) {
    var logger = new Logger()
    var sequence = logger.connect(
        new handlers.Env(),
        new handlers.System(),
        new handlers.Process(),
        new handlers.Timestamp(),
        new handlers.Merge(pkg, { key: 'package'}),
        new handlers.Flatten(),
        new handlers.KeyFilter({ include: [
            'server',
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
    )

    sequence.on('message', appender)
    app.locals.logger = logger
}
