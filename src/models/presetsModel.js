import messageBus from '../messageBus'
import {
  presetsCollection,
  roomLampsCollection,
  roomBlindsCollection
} from '../persistence'
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
  return { id: presetsCollection.insertOne(doc).$loki }
}

export function update({ id, ...preset }) {
  const doc = sanitize(preset)
  // ToDo add error handling (Loki, sync vs async update!)
  presetsCollection.update(Object.assign(presetsCollection.get(id), doc))
  return { status: 'ok' }
}

/**
 * Takes object from API request and sanitizes according to model.
 * @returns new object that only has properties defined by model.
 */
function sanitize({
  name,
  schedule,
  active,
  // setorder,
  devices: rawDevices
}) {
  return {
    name,
    schedule,
    active,
    // setorder,
    devices: rawDevices.map(({ id, type, value }) => ({ id, type, value }))
  }
}

export function remove(id) {
  // ToDo error check
  let doc = presetsCollection.get(id)
  if (doc) {
    presetsCollection.remove(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function setActive(id, newState) {
  let doc = presetsCollection.get(id)
  if (doc) {
    doc.active = newState
    presetsCollection.update(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function getAll() {
  return presetsCollection.data.map(transformItems())
}

export function getDevicesSelection(lang) {
  const i18n = translations[lang] || translations['en']
  return [
    {
      type: 'room_lamps',
      name: i18n.lampGroupId,
      items: roomLampsCollection.data.map(transformItems())
    },
    {
      type: 'room_blinds',
      name: i18n.blindsGroupId,
      items: roomBlindsCollection.data.map(transformItems())
    }
  ]
}

const translations = {
  en: {
    lampGroupId: 'Lamps',
    blindsGroupId: 'Blinds'
  },
  et: {
    lampGroupId: 'Lambid',
    blindsGroupId: 'Rulood'
  }
}

messageBus.on('persistence:ready', () => {
  roomLampsCollection.addListener('delete', removeDeviceFomAllPresets)
  roomBlindsCollection.addListener('delete', removeDeviceFomAllPresets)
})

function removeDeviceFomAllPresets({ $loki }) {
  presetsCollection.findAndUpdate({ 'devices.id': $loki }, p => {
    p.devices.splice(p.devices.findIndex(d => d.id === $loki), 1)
  })
}
