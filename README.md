# Decorators

## Why write another logger
1. The two most popular loggers (winston and bunyan) aren't event based
2. There are so many other loggers available I didn't have time to go through them all

## Why is event based logging important?
Event based logging decouples your logging code from your application code. This is important because it makes certain things easy to test which would otherwise be hard.

1. You can test that your logging statements don't cause your application to crash
```
if (err) logger.log(`Oh Noes:' + user.id) // but what happens if user is undefined?
```
2. You can test for events with no side-effects
```
if (err.code === DUPLICATE_KEY) {
    logger.info('Ignoring duplicate record')
    cb()
}
```

## The API
The api was designed to support common use cases for logging messages and errors with context
```js
logger.log([message], [error], [context])
```
For example:
```js
// Emits { message: 'some message', level: 'info' }
logger.log('some message')

// Emits { message: 'some message', level: 'info', user: { ... }}
logger.log('some message', { user: user })

// Emits { message: 'On Noes', level: 'error', error: { message: 'On Noes', stack: ... }}
logger.log(new Error('Oh Noes'))

// Emits { message: 'An error occurred', level: 'error', error: { message: 'On Noes', stack: ... }}
logger.log('An error occurred', new Error('Oh Noes'))
```
The log level is derived from the parameters, but can also be forced
```js
// Emits { message: 'On Noes', level: 'warn', error: { message: 'On Noes', stack: ... }}
logger.warn(new Error('On Noes'))
```
The default log level for messages is 'info', but can be overriden in the constructor options
```js
new Logger({ level: 'trace' }).log('will be logged at trace')
```

## Log Levels
The supported log levels are trace, debug, info, warn, error and fatal. You can add additional log levels by extending the Logger class, e.g.

```js
Logger.catastrophic = function catastrophic(arg1, arg2, arg3) {
    __logEvent.apply(self, toArray(arguments).concat('catastrophic'))
    return self
}
```

## Child Loggers



Clone

