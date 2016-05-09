var assert = require('chai').assert
var lib = require('..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo

describe('Logger', function() {

    var repo = new Repo()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', repo.handle)
    })

    afterEach(function() {
        repo.removeAllListeners().clear()
        logger.removeAllListeners()
    })

    it('should report usage errors safely', function() {
        logger.log(null)
        logger.log(null, null)
        logger.log(null, null, null)
        logger.log(null, null, null, null)
        logger.log(1)
        logger.log(1, 1)
        logger.log(1, 1, 1)
        logger.log('', 1)
        logger.log(new Error(), 1)
        logger.log({}, '')
        logger.log('', {}, new Error())
        logger.log('', new Error(), {}, {})

        var events = repo.list()
        assert.equal(events.length, 12)
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].message, 'Logger usage error')
        assert.deepEqual(events[0].arguments, [null])
    })

    it('should log message, error, context and level', function() {
        logger.warn('meh', new Error('Oh Noes'), { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
        assert.equal(events[0].user.id, 1234)
    })

    it('should log message, error and level', function() {
        logger.warn('meh', new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log message, error and context', function() {
        logger.log('meh', new Error('Oh Noes'), { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
        assert.equal(events[0].user.id, 1234)
    })

    it('should log message, context and level', function() {
        logger.warn('meh', { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].user.id, 1234)
    })

    it('should log error, context and level', function() {
        logger.warn(new Error('Oh Noes'), { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
        assert.equal(events[0].user.id, 1234)
    })

    it('should log message and level', function() {
        logger.warn('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'warn')
    })

    it('should log message and error', function() {
        logger.log('meh', new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log message and context', function() {
        logger.log('meh', { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].user.id, 1234)
    })

    it('should log error and level', function() {
        logger.warn(new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log error and context', function() {
        logger.log(new Error('Oh Noes'), { user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
        assert.equal(events[0].user.id, 1234)
    })

    it('should log context and level', function() {
        logger.warn({ user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, '')
        assert.equal(events[0].level, 'warn')
        assert.equal(events[0].user.id, 1234)
    })

    it('should log message', function() {
        logger.log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].level, 'info')
    })

    it('should log error', function() {
        logger.log(new Error('Oh Noes'))

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
        assert.equal(events[0].level, 'error')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
    })

    it('should log context', function() {
        logger.log({ user: { id: 1234 }} )

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, '')
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].user.id, 1234)
    })

    it('should log errors with custom properties', function() {
        var err = new Error('Oh Noes')
        err.code = 1000
        logger.log(err)

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].message, 'Oh Noes')
        assert.equal(events[0].error.message, 'Oh Noes')
        assert.equal(events[0].error.code, 1000)
        assert.match(events[0].error.stack, /Error: Oh Noes\n    at Context.<anonymous>/)
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

    it('should prefer explicit error level to implicit error level', function() {
        var err = new Error('Oh Noes')
        err.level = 'warn'
        logger.log(err)

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'warn')
    })

    it('should use a default error message when none is supplied', function() {
        logger.log('', new Error(), {})
        logger.log('', new Error(''), {})
        logger.log('', new Error(null), {})
        logger.log('', new Error(undefined), {})

        var events = repo.list()
        assert.equal(events.length, 4)
        assert.equal(events[0].message, 'An unspecified error occurred')
        assert.equal(events[1].message, 'An unspecified error occurred')
        assert.equal(events[2].message, 'An unspecified error occurred')
        assert.equal(events[3].message, 'An unspecified error occurred')
    })

    it('should support common log levels', function() {
        logger.trace('meh')
        logger.debug('meh')
        logger.info('meh')
        logger.warn('meh')
        logger.error('meh')
        logger.fatal('meh')

        assert.equal(repo.findBy('level', 'trace').length, 1)
        assert.equal(repo.findBy('level', 'debug').length, 1)
        assert.equal(repo.findBy('level', 'info').length, 1)
        assert.equal(repo.findBy('level', 'warn').length, 1)
        assert.equal(repo.findBy('level', 'error').length, 1)
        assert.equal(repo.findBy('level', 'fatal').length, 1)
    })

    it('should prefer method levels to object levels', function() {
        logger.trace({ message: 'meh', level: 'error' })
        assert.equal(repo.findBy('level', 'trace').length, 1)
    })

    it('should prefer method levels to explicit error levels', function() {
        var err = new Error('Oh Noes')
        err.level = 'warn'

        logger.trace(err)
        assert.equal(repo.findBy('level', 'trace').length, 1)
    })

    it('should merge error and context', function() {
        logger.log(new Error('Oh Noes'), { error: { code: 123 }})
        assert.equal(repo.first().error.code, 123)
    })

    it('should support custom max listeners', function() {
        var logger = new Logger({ maxListeners: 200 })
        for (var i = 0; i < 200; i++) logger.on('message', function() {})
    })

    it('should route events emitted by child loggers to parents existing listeners', function() {
        logger.child().log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, 'meh')
    })

    it('should route events emitted by child loggers to parents new listeners', function() {
        var logger = new Logger()
        var child = logger.child()
        var repo = new Repo()
        logger.on('message', repo.handle)

        child.log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'info')
        assert.equal(events[0].message, 'meh')
    })

    it('should route events emitted by child loggers to childs listeners', function() {
        var child = new Logger().child()
        var repo = new Repo()
        child.on('message', repo.handle)

        child.log('meh')

        assert.equal(repo.count(), 1)
    })

    it('should not route events emitted by parents loggers to childs listeners', function() {
        var logger = new Logger()
        var child = logger.child()
        var repo = new Repo()
        child.on('message', repo.handle)

        logger.log('meh')

        assert.ok(repo.isEmpty())
    })

    it('should allow child loggers to override library defaults', function() {
        logger.child({ level: 'trace' }).log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'trace')
        assert.equal(events[0].message, 'meh')
    })

    it('should allow child loggers to override parental defaults', function() {
        var logger = new Logger({ level: 'debug' })
        var repo = new Repo()
        logger.on('message', repo.handle)
        logger.child({ level: 'trace' }).log('meh')

        var events = repo.list()
        assert.equal(events.length, 1)
        assert.equal(events[0].level, 'trace')
        assert.equal(events[0].message, 'meh')
    })

    it('should remove listeners from child loggers when they are removed from their parent', function() {
        var logger = new Logger({ name: 'Parent' })
        var repo = new Repo()
        logger.on('message', repo.handle)

        var child = logger.child({ name: 'Child' })
        child.log('meh')
        assert.equal(repo.count(), 1)

        logger.removeAllListeners()
        child.log('meh')
        assert.equal(repo.count(), 1)
    })

    it('should pause logger', function() {
        logger.pause().debug('meh')
        assert.equal(repo.count(), 0)
    })

    it('should propagate pause to child loggers created before pausing', function() {
        var child = logger.child()
        logger.pause()
        child.debug('meh')

        assert.equal(repo.count(), 0)
    })

    it('should propagate pause to child loggers created after pausing', function() {
        logger.pause().child().debug('meh')
        assert.equal(repo.count(), 0)
    })

    it('should resume logger', function() {
        logger.pause().resume().debug('meh')
        assert.equal(repo.count(), 1)
    })

    it('should propagate resume to child loggers created before pausing', function() {
        var child = logger.child()
        logger.pause().resume()
        child.debug('meh')

        assert.equal(repo.count(), 1)
    })

    it('should propagate resume to child loggers created after pausing', function() {
        logger.resume().child().debug('meh')

        assert.equal(repo.count(), 1)
    })
})
