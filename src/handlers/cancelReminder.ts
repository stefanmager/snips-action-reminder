import commonHandler, { flowContinueTerminate, KnownSlots } from './common'
import { Reminder } from '../utils/reminder/reminder'
import { i18n, logger, Handler, config, message } from 'snips-toolkit'
import { SLOT_CONFIDENCE_THRESHOLD } from '../constants'
import { DateRange, getDateRange } from '../utils'
import { NluSlot, slotType } from 'hermes-javascript/types'

export const cancelReminderHandler: Handler = async function(msg, flow, database, knownSlots: KnownSlots = { depth: 2 }) {
    logger.info('CancelReminder')

    const {
        name,
        recurrence
    } = await commonHandler(msg, knownSlots)

    let dateRange: DateRange | undefined

    if (!('dateRange' in knownSlots)) {
        const dateSlot: NluSlot<slotType.instantTime | slotType.timeInterval> | null = message.getSlotsByName(msg, 'datetime', {
            onlyMostConfident: true,
            threshold: SLOT_CONFIDENCE_THRESHOLD
        })

        if (dateSlot) {
            if (dateSlot.value.kind === slotType.timeInterval) {
                dateRange = { min: new Date(dateSlot.value.from), max: new Date(dateSlot.value.to) }
            } else if (dateSlot.value.kind === slotType.instantTime) {
                dateRange = getDateRange(new Date(dateSlot.value.value), dateSlot.value.grain)
            }
        }
    } else {
        dateRange = knownSlots.dateRange
    }

    const reminders: Reminder[] = database.get(name, dateRange, recurrence)
    const length = reminders.length

    // Cancel all the reminder, need to be confirmed
    if (length && (!name && !recurrence && !dateRange)) {
        flow.continue(`${ config.get().assistantPrefix }:Yes`, (_, flow) => {
            reminders.forEach(reminder => {
                database.deleteById(reminder.id)
            })

            flow.end()
            if (length > 1) {
                return i18n.translate('cancelReminder.info.confirmAll', {
                    number: length
                })
            } else {
                return i18n.translate('cancelReminder.info.confirm')
            }
        })
        flow.continue(`${ config.get().assistantPrefix }:No`, (_, flow) => {
            flow.end()
        })
        flowContinueTerminate(flow)

        if (length > 1) {
            return i18n.translate('cancelReminder.ask.confirmAll', {
                number: length
            })
        } else {
            return i18n.translate('cancelReminder.ask.confirm')
        }
    }

    // Found reminders by using some of the constrains, no need to continue just cancel
    if (length && (name || recurrence || dateRange)) {
        reminders.forEach(reminder => {
            database.deleteById(reminder.id)
        })

        flow.end()
        if (length > 1) {
            return i18n.translate('cancelReminder.info.confirmAll', {
                number: length
            })
        } else {
            return i18n.translate('cancelReminder.info.confirm')
        }
    }

    flow.end()
    return i18n.translate('getReminder.info.noReminderFound')
}
