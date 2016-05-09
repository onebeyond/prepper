var request = require('request')
var app = require('./app')
var Repo = require('../..').handlers.Repo
var assert = require('chai').assert

describe('Example Express Application', function() {

    var repo = new Repo()

    before(function(cb) {
        app.start(repo.handle, cb)
    })

    afterEach(function() {
        repo.clear()
    })

    after(function(cb) {
        app.stop(cb)
    })

    it('should emit route specific log events', function(done) {
        request.get('http://localhost:3000/hello-world', function(err, res, body) {
            if (err) return done(err)
            if (res.statusCode !== 200) return done(new Error('Status: ' + res.statusCode))

            var debugEvents = repo.findBy('level', 'debug')
            assert.equal(debugEvents.length, 1)
            assert.equal(debugEvents[0].request.url, '/hello-world')

            var infoEvents = repo.findBy('level', 'info')
            assert.equal(infoEvents.length, 2)
            assert.equal(infoEvents[1].request.url, '/hello-world')
            assert.equal(infoEvents[1].response.statusCode, 200)
            done()
        })
    })

    it('should emit errors', function(done) {
        request.get('http://localhost:3000/oh-noes', function(err, res, body) {
            if (err) return done(err)
            if (res.statusCode !== 500) return done(new Error('Status: ' + res.statusCode))
            var errorEvents = repo.findBy('level', 'error')

            assert.equal(errorEvents.length, 2)
            assert.equal(errorEvents[0].request.url, '/oh-noes')
            assert.equal(errorEvents[0].error.message, 'Oh Noes')


            assert.equal(errorEvents[1].request.url, '/oh-noes')
            assert.equal(errorEvents[1].response.statusCode, 500)
            done()
        })
    })
})