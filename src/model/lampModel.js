import { lampCollection, presetCollection } from '../persistence'

export function getDependendtPresets(id) {
  return presetCollection
    .chain('findPresetsByDevice', { id, type: 'lamp' })
    .simplesort('name')
    .data()
    .map(({ $loki, name }) => ({ id: $loki, name }))
}

export function getAll() {
  return lampCollection.data.map(({ $loki: id, ...rest }) => ({ id, ...rest }))
}

/**
 * Takes new object, saves to database, or returns `{errors:[]}`,
 * if validation fails.
 * @param lamp entity data to insert to database, provided `{id}` prop will be ignored.
 * @returns new lamp document or `{errors:[]}`.
 */
export function add(lamp) {
  const doc = sanitize(lamp)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  const { $loki: id, ...docRest } = lampCollection.insert(doc)
  // ToDo handle db level errors and return them
  return { id, ...docRest }
}

export function update(lamp) {
  const doc = sanitize(lamp)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  // ToDo add error handling (Loki, sync vs async update!)
  const dbDoc = lampCollection.get(lamp.id)
  if (!dbDoc) {
    return {
      errors: [
        `didn't found a Lamp document from database with {id}: "${lamp.id}"`
      ]
    }
  }
  Object.assign(dbDoc, doc)
  const { $loki: id, ...docRest } = lampCollection.update(dbDoc)
  return { id, ...docRest }
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
  if (lampCollection.remove(id)) {
    return { id }
  } else {
    return { errors: [{ no_exist: id }] }
  }
}
