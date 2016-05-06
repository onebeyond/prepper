var Logger = require('..').Logger
var Repo = require('..').Repo
var assert = require('chai').assert

describe('Ernie', function() {

    var repo = new Repo()
    var logger = new Logger()

    before(function() {
        logger.connect(repo)
    })

    afterEach(function() {
        repo.clear()
    })

    it('should report usage errors safely', function() {
        logger.log(undefined)

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].message, 'Invalid call to log')
        assert.deepEqual(events[0].arguments, [undefined])
    })

    it('should log an empty event', function() {
        logger.log({})

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, '')
    })

    it('should log raw events at info by default', function() {
        logger.log({ message: 'meh', user: { id: 123 } })

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].user.id, 123)
    })

    it('should log raw events at the specified level', function() {
        logger.log({ message: 'meh', level: 'debug', user: { id: 123 } })

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'debug')
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].user.id, 123)
    })

    it('should log message at info by default', function() {
        logger.log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, 'meh')
    })

    it('should log errors at error by default', function() {
        logger.log(new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].message, 'Oh Noes')
        assert.match(events[0].stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log errors with custom properties', function() {
        var err = new Error('Oh Noes')
        err.code = 1000
        err.level = 'warn'
        logger.log(err)

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].code, 1000)
        assert.equal(events[0].message, 'Oh Noes')
        assert.match(events[0].stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log message and complex objects at info by default', function() {
        logger.log('meh', { user: { id: 123 }})

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].user.id, 123)
    })

    it('should prefer explicit message to error message', function() {
        logger.log('meh', new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
    })

    it('should prefer explict message to context message', function() {
        logger.log('meh', { message: 'xxx' })

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
    })

    it('should prefer error message to context message', function() {
        logger.log(new Error('Oh Noes'), { message: 'xxx' })

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
    })

    it('should prefer implicit error level to context level', function() {
        logger.log(new Error('Oh Noes'), { message: 'xxx' })

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
    })


    it('should log strings, errors and complex objects at info by default', function() {
        logger.log('meh', new Error('Oh Noes'), { user: { id: 123 }})

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].message, 'meh')
        assert.match(events[0].stack, /Error: Oh Noes\n    at Context.<anonymous>/)
        assert.equal(events[0].user.id, 123)
    })

    it('should support common log levels', function() {
        logger.trace({ message: 'meh' })
        logger.debug({ message: 'meh' })
        logger.info({ message: 'meh' })
        logger.warn({ message: 'meh' })
        logger.warning({ message: 'meh' })
        logger.error({ message: 'meh' })
        logger.fatal({ message: 'meh' })

        assert.equal(repo.findBy('level', 'trace').length, 1)
        assert.equal(repo.findBy('level', 'debug').length, 1)
        assert.equal(repo.findBy('level', 'info').length, 1)
        assert.equal(repo.findBy('level', 'warn').length, 2)
        assert.equal(repo.findBy('level', 'error').length, 1)
        assert.equal(repo.findBy('level', 'fatal').length, 1)
    })

    it('should prefer method levels to object levels', function() {
        logger.trace({ message: 'meh', level: 'error' })
        assert.equal(repo.findBy('level', 'trace').length, 1)
    })
})