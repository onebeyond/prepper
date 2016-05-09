var express = require('express')
var app = express()
var appLogger = require('./appLogger')
var reqLogger = require('./reqLogger')
var server

module.exports = {
    start: function(appender, cb) {
        app.use(function(req, res, next) {
            reqLogger(req, res)
            next()
        })

        app.get('/hello-world', function (req, res) {
          res.locals.logger.debug('Hello World')
          res.send('Hello World!')
        })

        app.get('/oh-noes', function (req, res, next) {
          next(new Error('Oh Noes'))
        })

        app.use(function(err, req, res, next) {
            res.locals.logger.error(new Error('Oh Noes'))
            res.status(500).send(err.message)
        })

        appLogger(app, appender)

        server = app.listen(3000, function() {
            app.locals.logger.info('Server started', { server: { port: 3000 } })
            cb && cb()
        })
    },
    stop: function(cb) {
        if (!server) return cb()
        server.close(cb)
    }
}

