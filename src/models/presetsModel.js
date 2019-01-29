import { presets, roomLamps, roomBlinds } from '../persistence'
import { transformItems, groupByRooms } from './transforms'

/**
 * Takes new object, saves to database, or returns `{error}`,
 * if `{id}` exists, is numeric and `> 0`.
 * @param preset preset to insert to database.
 * @returns new preset's `{id}` or `{error}`.
 */
export function addPreset({ id, preset }) {
  if (id && Number.parseInt(id) < 0) {
    return { error: `attempted object has {id} other than 0` }
  }
  // ToDo error check
  return { id: presets.insertOne(preset).$loki }
}

export function update({ id, preset }) {
  // ToDo add error handling (Loki, sync vs async update!)
  Object.assign(presets.get(id), preset)
  return { status: 'ok' }
}

export function getAll() {
  return presets.data.map(transformItems())
}

export function getDevices(lang) {
  const i18n = translations[lang] || translations['en']
  return [
    {
      type: 'room_lamps',
      name: i18n.lampGroupId,
      items: roomLamps.mapReduce(transformItems(), groupByRooms)
    },
    {
      type: 'room_blinds',
      name: i18n.blindsGroupId,
      items: roomBlinds.mapReduce(transformItems(), groupByRooms)
    }
  ]
}

const translations = {
  en: {
    lampGroupId: 'Lamps',
    blindsGroupId: 'Blinds'
  },
  ee: {
    lampGroupId: 'Lambid',
    blindsGroupId: 'Rulood'
  }
}
