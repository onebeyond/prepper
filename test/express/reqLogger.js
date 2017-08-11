var handlers = require('../../').handlers
var R = require('ramda')
var onHeaders = require('on-headers')

module.exports = function(req, res) {
    var requestLogger = req.app.locals.logger.child({ handlers: [
        new handlers.Tracer(),
        new handlers.Merge(R.pick(['url', 'headers', 'params'], req), { key: 'request' })
    ]})

    onHeaders(res, function() {
        var response = { response: { statusCode: res.statusCode } }
        if (res.statusCode < 400) requestLogger.info(req.url, response)
        else if (res.statusCode < 500) requestLogger.warn(req.url, response)
        else requestLogger.error(req.url, response)
    })

    res.locals.logger = requestLogger
}
