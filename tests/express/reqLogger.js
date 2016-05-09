var Logger = require('../../').Logger
var handlers = require('../../').handlers
var R = require('ramda')
var onHeaders = require('on-headers')

module.exports = function(req, res) {
    var logger = new Logger()
    var sequence = new handlers.Sequence([
        new handlers.Tracer(),
        new handlers.Merge(R.pick(['url', 'headers', 'params'], req), { key: 'request' }),
    ])
    logger.on('message', sequence.handle)
    sequence.on('message', req.app.locals.logger.log)

    onHeaders(res, function() {
        var response = { response: { statusCode: res.statusCode } }
        if (res.statusCode < 400) logger.info(req.url, response)
        else if (res.statusCode < 500) logger.warn(req.url, response)
        else logger.error(req.url, response)
    })

    res.locals.logger = logger
}