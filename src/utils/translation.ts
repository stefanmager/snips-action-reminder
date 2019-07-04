import { i18n } from 'snips-toolkit'
import { Reminder } from '../class/Reminder'
import { beautify } from './index'

/**
 * Return a report tts for found reminders
 * Example:
 *     I found 8 {{ adj }} reminders.
 *     I found 8 {{ adj }} reminders set for {{ time }}, the next one is {{ reminder }} set for {{ time }}.
 *     I found 8 {{ adj }} reminders set for {{ time }}, {{ reminder }} is set for {{ time }}.
 *     I found 8 {{ adj }} reminders named {{ reminder }}, the next one is set for {{ time }}.
 *     I found 8 {{ adj }} reminders named {{ reminder }}, {{ reminder }} is set for {{ time }}.
 *
 * Time can be generated by "datetimeRange" slots value and "recurrence"
 * Example:
 *     every monday at 8 AM
 *     every day at 2 50 PM
 *     3th of May at 8 PM
 *     today at 4 AM
 *     this weeekend at 5 20 PM
 *     next Friday at 3 PM
 *
 * @param reminders
 */
function reportGetReminder(reminders: Reminder[]){
    let tts = ''
    for (let i = 0; i < reminders.length; i++) {
        const reminder = reminders[i]
        if (!reminder.nextExecution) {
            throw new Error('invalideExecutionTime')
        }
        tts += i18n.translate('getReminder.info.reminder_SetFor_', {
            name: reminder.name,
            time: beautify.datetime(reminder.nextExecution)
        })
        tts += ' '
    }
    return tts
}

function reportSetReminder(reminder: Reminder) {
    if (!reminder.nextExecution) {
        throw new Error('invalideExecutionTime')
    }
    return i18n.translate('setReminder.info.reminder_SetFor_', {
        name: reminder.name,
        time: reminder.rawRecurrence ?
              beautify.recurrence(reminder.nextExecution, reminder.rawRecurrence) :
              beautify.datetime(reminder.nextExecution)
    })
}

export const translation = {
    reportSetReminder,
    reportGetReminder
}