import { presets, roomLamps, roomBlinds } from '../persistence'
import { transformItems } from './transforms'

/**
 * Takes new object, saves to database, or returns `{error}`,
 * if `{id}` exists, is numeric and `> 0`.
 * @param preset preset to insert to database.
 * @returns new preset's `{id}` or `{error}`.
 */
export function add({ id, ...preset }) {
  if (id && Number.parseInt(id) < 0) {
    return { error: `attempted object has {id} other than 0` }
  }
  // ToDo error check
  return { id: presets.insertOne(preset).$loki }
}

export function update({ id, ...preset }) {
  // ToDo add error handling (Loki, sync vs async update!)
  presets.update(Object.assign(presets.get(id), preset))
  return { status: 'ok' }
}

export function remove(id) {
  // ToDo error check
  let doc = presets.get(id)
  if (doc) {
    presets.remove(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function setActive(id, newState) {
  let doc = presets.get(id)
  if (doc) {
    doc.active = newState
    presets.update(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function getAll() {
  return presets.data.map(transformItems())
}

export function getDevicesSelection(lang) {
  const i18n = translations[lang] || translations['en']
  return [
    {
      type: 'room_lamps',
      name: i18n.lampGroupId,
      items: roomLamps.data.map(transformItems())
    },
    {
      type: 'room_blinds',
      name: i18n.blindsGroupId,
      items: roomBlinds.data.map(transformItems())
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
