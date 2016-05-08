var assert = require('chai').assert
var lib = require('../..')
var handlers = lib.handlers
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Clone = lib.handlers.Clone

describe('Clone Decorator', function() {

    var repo = new Repo()
    var clone = new Clone()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', clone.handle)
        clone.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        clone.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should clone event', function() {
        var event = { user: { id: 123 }, timestamp: new Date(1462729914982), pattern: /abc/i }
        logger.debug(event)

        var clone = repo.list()[0]
        clone.user.id = 321
        assert.equal(event.user.id, 123)
        assert.equal(clone.timestamp.getTime(), 1462729914982)
        assert.ok(clone.pattern.test('ABC'))
    })
})