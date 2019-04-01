import messageBus from '../messageBus'
import {
  presetsCollection,
  roomLampsCollection,
  roomBlindsCollection
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
  return { id: presetsCollection.insertOne(doc).$loki }
}

export function update(preset) {
  // ToDo implement validation
  const doc = sanitize(preset)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo add error handling (Loki, sync vs async update!)
  const dbDoc = presetsCollection.get(preset.id)
  if (!dbDoc) {
    return {
      errors: [
        `didn't found a document from database with {id}: "${preset.id}"`
      ]
    }
  }
  presetsCollection.update(Object.assign(dbDoc, doc))
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
