var handlers = require('../../').handlers
var R = require('ramda')
var onHeaders = require('on-headers')

module.exports = function(req, res) {
    var logger = req.app.locals.logger.child({ handlers: [
        new handlers.Tracer(),
        new handlers.Merge(R.pick(['url', 'headers', 'params'], req), { key: 'request' })
    ]})

    onHeaders(res, function() {
        var response = { response: { statusCode: res.statusCode } }
        if (res.statusCode < 400) logger.info(req.url, response)
        else if (res.statusCode < 500) logger.warn(req.url, response)
        else logger.error(req.url, response)
    })

    res.locals.logger = logger
}