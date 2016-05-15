var express = require('express')
var app = express()
var appLogger = require('./appLogger')
var reqLogger = require('./reqLogger')
var server

module.exports = {
    start: function(appender, cb) {

        app.get('/hello-world', logRequest, function (req, res) {
          res.locals.logger.debug('Hello World')
          res.send('Hello World!')
        })

        app.get('/hello-world-no-logging', function (req, res) {
          res.send('Hello World!')
        })

        app.get('/oh-noes', logRequest, function (req, res, next) {
          next(new Error('Oh Noes'))
        })

        app.use(function(err, req, res, next) {
            res.locals.logger.error(new Error('Oh Noes'))
            res.status(500).send(err.message)
        })

        function logRequest(req, res, next) {
            reqLogger(req, res)
            next()
        }

        appLogger(app, appender)

        server = app.listen(3000, function() {
            app.locals.logger.info('Server started', { server: server.address() })
            cb && cb()
        })
    },
    stop: function(cb) {
        if (!server) return cb()
        server.close(cb)
    }
}

