import { presets, roomLamps, roomBlinds } from '../persistence'
import { transformItems } from './transforms'

/**
 * Takes new object, saves to database, or returns `{error}`,
 * if `{id}` exists, is numeric and `!== 0`.
 * @param preset preset to insert to database.
 * @returns new preset's `{id}` or `{error}`.
 */
export function add({ id, ...preset }) {
  if (id && Number.parseInt(id) !== 0) {
    return { error: `attempted object has {id} other than 0` }
  }
  const doc = sanitize(preset)
  // ToDo error check
  return { id: presets.insertOne(doc).$loki }
}

export function update({ id, ...preset }) {
  const doc = sanitize(preset)
  // ToDo add error handling (Loki, sync vs async update!)
  presets.update(Object.assign(presets.get(id), doc))
  return { status: 'ok' }
}

function sanitize({ name, schedule, active, setorder, devices: rawDevices }) {
  return {
    name,
    schedule,
    active,
    setorder,
    devices: rawDevices.map(({ id, type, value }) => ({ id, type, value }))
  }
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
