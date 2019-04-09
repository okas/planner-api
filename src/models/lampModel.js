import { roomLampCollection, presetCollection } from '../persistence'
import { getRandomIntInclusive } from '../utilities'

export function getDependendtPresets(id) {
  return presetCollection
    .chain('findPresetsByDevice', { id, type: 'lamp' })
    .simplesort('name')
    .data()
    .map(({ $loki, name }) => ({ id: $loki, name }))
}

export function getAll() {
  return roomLampCollection.data.map(({ $loki, ...rest }) => ({
    id: $loki,
    ...rest,
    state: getState($loki)
  }))
}

// Mockup function. This funtion will retreive physical state in future.
function getState(lampId) {
  // About 1/3 of calls will be 1, otherwize 0.
  // Dimmed lamps might have value 0..1 ? ;-)
  return +(getRandomIntInclusive(lampId, lampId + 2) % (lampId + 2) === 0)
}

/**
 * Takes new object, saves to database, or returns `{errors}`,
 * if validation fails.
 * @param lamp preset to insert to database, provided `{id}` prop will be ignored.
 * @returns new preset's `{id}` or `{errors:[]}`.
 */
export function add(lamp) {
  const doc = sanitize(lamp)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo handle db level errors and return them
  return { id: roomLampCollection.insertOne(doc).$loki }
}

export function update(lamp) {
  const doc = sanitize(lamp)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo add error handling (Loki, sync vs async update!)
  const dbDoc = roomLampCollection.get(lamp.id)
  if (!dbDoc) {
    return {
      errors: [
        `didn't found a Lamp document from database with {id}: "${lamp.id}"`
      ]
    }
  }
  roomLampCollection.update(Object.assign(dbDoc, doc))
  return { status: 'ok' }
}

/**
 * Takes object from API request and sanitizes according to model.
 * @returns new object that only has properties defined by model.
 */
function sanitize({ name, room, valuestep }) {
  return { name, room, valuestep }
}

function validate({ name, room, valuestep }) {
  let errors = []
  if (!name) {
    errors.push(`attempted object didn't have valid {name} value: [${name}]`)
  }
  if (!room) {
    errors.push(`attempted object didn't have valid {room} value: [${room}]`)
  }
  if (!(valuestep === 1 || (valuestep > 0 && valuestep <= 0.5))) {
    errors.push(
      `attempted object didn't have valid {valuestep} value; must be 1 or > 0 and <= 0.5: [${valuestep}]`
    )
  }
  return errors.length ? { errors } : null
}

export function remove(id) {
  // ToDo error check
  let doc = roomLampCollection.get(id)
  if (doc) {
    roomLampCollection.remove(doc)
    return { status: 'ok' }
  } else {
    return { status: 'no-exist' }
  }
}
