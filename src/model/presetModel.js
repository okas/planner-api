import messageBus, {
  PERSISTENCE__COLLECTIONS_READY,
  PRESET__UPDATED_DEVICE_DELETED
} from '../messageBus'
import {
  presetCollection,
  lampCollection,
  blindCollection
} from '../persistence'
import cronParser from 'cron-parser'

/**
 * Takes new object, saves to database; or returns `{errors:[]}`,
 * if `{id}` exists, is numeric and `!== 0`.
 * @param preset entity to insert to database, provided `{id}` prop will be ignored.
 * @returns new Preset document or `{errors:[]}`.
 */
export function add(preset) {
  const doc = sanitize(preset)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  const { $loki, ...docRest } = presetCollection.insertOne(doc)
  // ToDo error check
  return docRest
}

export function update({ id, ...presetRest }) {
  const doc = sanitize(presetRest)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo add error handling (Loki, sync vs async update!)
  const dbDoc = getById(id)
  if (!dbDoc) {
    return {
      errors: [
        `didn't found a Preset document from database with {id}: "${id}"`
      ]
    }
  }
  Object.assign(dbDoc, doc)
  const { $loki, ...docRest } = presetCollection.update(dbDoc)
  return docRest
}

function getById(id) {
  return presetCollection.by('id', id)
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

/**
 * @param {{ name: string; schedule: string; active: boolean; devices:{id:number, type:string, value:number}[]; }} doc
 */
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

/**
 * @param {string} schedule
 * @param {string[]} errors
 */
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

/**
 * @param {string | boolean} active
 * @param {string[]} errors
 */
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

/**
 * @param {{ id: number; type: string; value: number; }[]} devices
 * @param {string[]} errors
 */
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

/**
 * @param {number} id
 */
export function remove(id) {
  const dbDoc = getById(id)
  if (presetCollection.remove(dbDoc)) {
    return { id }
  } else {
    return { errors: [{ no_exist: id }] }
  }
}

export function setActive({ id, active }) {
  const doc = getById(id)
  const errors = validateActiveStateChange(doc, active)
  if (errors) {
    return errors
  }
  doc.active = active
  presetCollection.update(doc)
  return {}
}

function validateActiveStateChange(doc, newState) {
  if (!doc) {
    return {
      errors: [`didn't found a Preset from database with {id:${doc.id}}`]
    }
  }
  if (!doc.devices || doc.devices.length < 1) {
    return {
      errors: [
        `cannot change {active} state, because Preset with {id:${doc.id}} has no devices`
      ]
    }
  }
  return null
}

export function getAll() {
  return presetCollection.chain().data({ removeMeta: true })
}

/**
 * @param {string} lang
 */
export function getDevicesSelection(lang) {
  const i18n = translations[lang] || translations.en
  return [
    {
      type: 'lamp',
      name: i18n.lampGroupId,
      items: lampCollection.chain().data({ removeMeta: true })
    },
    {
      type: 'blind',
      name: i18n.blindsGroupId,
      items: blindCollection.chain().data({ removeMeta: true })
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

messageBus.once(PERSISTENCE__COLLECTIONS_READY, () => {
  lampCollection.on('delete', doc =>
    notifyChangedPresets(removeDeviceFomAllPresets(doc, 'lamp'))
  )
  blindCollection.on('delete', doc =>
    notifyChangedPresets(removeDeviceFomAllPresets(doc, 'blind'))
  )
})

/**
 * @typedef ChangedDevice
 * @property {Number} id of changed device.
 * @param {ChangedDevice} device changed device.
 * @param {String} type of changed device.
 * @returns {Array} changed Presets.
 */
function removeDeviceFomAllPresets({ id }, type) {
  return presetCollection
    .chain('findPresetsByDevice', { id, type })
    .update(p => {
      p.devices.splice(p.devices.findIndex(d => d.id === id), 1)
      if (p.devices.length === 0) {
        p.active = false
      }
    })
    .data({
      removeMeta: true
    })
}

/**
 * @param {Array} changedPresets updated Presets, after device deletion.
 */
function notifyChangedPresets(changedPresets) {
  setImmediate(() => {
    changedPresets.forEach(doc => {
      messageBus.emit(PRESET__UPDATED_DEVICE_DELETED, doc)
    })
  })
}
