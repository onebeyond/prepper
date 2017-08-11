var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Tracer = lib.handlers.Tracer

describe('Tracer', function() {

    var repo
    var tracer
    var logger

    beforeEach(function() {
        repo = new Repo()
        tracer = new Tracer()
        logger = new Logger()

        logger.on('message', tracer.handle)
        tracer.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        tracer.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with a tracer', function() {
        logger.debug('meh')
        assert.ok(repo.first()['tracer'])
    })

    it('should reuse the tracer', function() {
        logger.debug('meh')
        logger.debug('blah')
        assert.equal(repo.first()['tracer'], repo.second()['tracer'])
    })
})
