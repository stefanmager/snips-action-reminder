const { logger } = require('../utils')

// Wrap handlers to gracefully capture errors
const handlerWrapper = handler => (
    async (message, flow, ...args) => {
        //logger.debug('message: %o', message)
        try {
            // Run handler until completion
            logger.debug('------------------') 
            const tts = await handler(message, flow, ...args)
            // And make the TTS speak
            return tts
        } catch (error) {
            // If an error occurs, end the flow gracefully
            flow.end()
            // And make the TTS output the proper error message
            logger.error(error)
            return 'Sorry, I dont quite understood, please try again'
            //return await translation.errorMessage(error)
        }
    }
)

// Add handlers here, and wrap them.
module.exports = {
    yes: handlerWrapper(require('./yes')),
    no: handlerWrapper(require('./no')),
    stop: handlerWrapper(require('./stop')),
    silence: handlerWrapper(require('./silence')),
    cancel: handlerWrapper(require('./cancel')),
    setReminder: handlerWrapper(require('./setReminder')),
    getReminder: handlerWrapper(require('./getReminder')),
    rescheduleReminder: handlerWrapper(require('./rescheduleReminder')),
    renameReminder: handlerWrapper(require('./renameReminder')),
    cancelReminder: handlerWrapper(require('./cancelReminder'))
}