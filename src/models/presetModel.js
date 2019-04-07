import messageBus, { PERSISTENCE__COLLECTIONS_READY } from '../messageBus'
import {
  presetCollection,
  roomLampCollection,
  roomBlindCollection
} from '../persistence'
import { transformItems } from './transforms'
import cronParser from 'cron-parser'

/**
 * Takes new object, saves to database, or returns `{error}`,
 * if `{id}` exists, is numeric and `!== 0`.
 * @param preset preset to insert to database.
 * @returns new preset's `{id}` or `{error}`.
 */
export function add(preset) {
  const doc = sanitize(preset)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo error check
  return { id: presetCollection.insertOne(doc).$loki }
}

export function update(preset) {
  // ToDo implement validation
  const doc = sanitize(preset)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo add error handling (Loki, sync vs async update!)
  const dbDoc = presetCollection.get(preset.id)
  if (!dbDoc) {
    return {
      errors: [
        `didn't found a Preset document from database with {id}: "${preset.id}"`
      ]
    }
  }
  presetCollection.update(Object.assign(dbDoc, doc))
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

function validate(doc) {
  const errors = []
  validateName(doc.name, errors)
  validateSchedule(doc.schedule, errors)
  validateActive(doc.active, errors)
  validateDevices(doc.devices, errors)
  return errors.length ? { errors } : null
}

const getErrorMessage = (propName, propValue) => {
  return `attempted object didn't have valid {${propName}} value: "${propValue}"`
}

function validateName(name, errors) {
  if (!name) {
    errors.push(getErrorMessage('name', name))
  }
}

function validateSchedule(schedule, errors) {
  if (!schedule) {
    errors.push(getErrorMessage('schedule', schedule))
  } else {
    const stringResult = cronParser.parseString(schedule)
    if (Object.keys(stringResult.errors).length > 0) {
      errors.push(
        getErrorMessage('schedule', JSON.stringify(stringResult.errors))
      )
    }
  }
}

function validateActive(active, errors) {
  if (
    !(
      active === false ||
      active === true ||
      active === 'false' ||
      active === 'true'
    )
  ) {
    errors.push(getErrorMessage('active', active))
  }
}

function validateDevices(devices, errors) {
  if (devices && devices.length > 0) {
    devices.forEach(({ id, type, value }) => {
      if (!id) {
        errors.push(getErrorMessage('devices.id', id))
      }
      if (!type) {
        errors.push(getErrorMessage('devices.type', type))
      }
      if (value < 0 && value > 1) {
        errors.push(getErrorMessage('devices.value', value))
      }
    })
  } else {
    errors.push(getErrorMessage('devices', JSON.stringify(devices)))
  }
}

export function remove(id) {
  // ToDo error check
  let doc = presetCollection.get(id)
  if (doc) {
    presetCollection.remove(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function setActive(id, newState) {
  let doc = presetCollection.get(id)
  if (doc) {
    doc.active = newState
    presetCollection.update(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}

export function getAll() {
  return presetCollection.data.map(transformItems())
}

export function getDevicesSelection(lang) {
  const i18n = translations[lang] || translations['en']
  return [
    {
      type: 'room_lamps',
      name: i18n.lampGroupId,
      items: roomLampCollection.data.map(transformItems())
    },
    {
      type: 'room_blinds',
      name: i18n.blindsGroupId,
      items: roomBlindCollection.data.map(transformItems())
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

messageBus.on(PERSISTENCE__COLLECTIONS_READY, () => {
  roomLampCollection.addListener('delete', doc =>
    removeDeviceFomAllPresets(doc, 'room_lamps')
  )
  roomBlindCollection.addListener('delete', doc =>
    removeDeviceFomAllPresets(doc, 'room_blinds')
  )
})

/**
 * @typedef ChangedDevice
 * @property {String} $loki of chnaged device.
 * @param {ChangedDevice} device changed device.
 * @param {String} type of changed device.
 */
function removeDeviceFomAllPresets({ $loki }, type) {
  presetCollection
    .chain('findPresetsByDevice', { id: $loki, type })
    .update(p => {
      p.devices.splice(p.devices.findIndex(d => d.id === $loki), 1)
      if (p.devices.length === 0) {
        p.active = false
      }
    })
}
