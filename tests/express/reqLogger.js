var Logger = require('../../').Logger
var handlers = require('../../').handlers
var R = require('ramda')
var onHeaders = require('on-headers')

module.exports = function(req, res) {
    var logger = new Logger()
    var sequence = new handlers.Sequence([
        new handlers.TracerDecorator(),
        new handlers.Merge(R.pick(['url', 'headers', 'params'], req), { key: 'request' }),
        new handlers.Flatten(),
        new handlers.KeyFilter({ include: [
            'error',
            'message',
            'level',
            'tracer',
            'request.url',
            'request.headers',
            'response.statusCode',
        ]}),
        new handlers.Unflatten()
    ])
    logger.on('message', sequence.handle)
    sequence.on('message', req.app.locals.logger.log)

    onHeaders(res, function() {
        if (res.statusCode < 400) logger.log(req.url, { level: 'info', response: { statusCode: res.statusCode } })
        else if (res.statusCode < 500) logger.log(req.url, { level: 'warn', response: { statusCode: res.statusCode } })
        else logger.log(req.url, { level: 'error', response: { statusCode: res.statusCode } })
    })

    res.locals.logger = logger
}