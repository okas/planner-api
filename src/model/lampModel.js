import { lampCollection, presetCollection } from '../persistence'

export function getDependendtPresets(id) {
  return presetCollection
    .chain('findPresetsByDevice', { id, type: 'lamp' })
    .simplesort('name')
    .data({
      removeMeta: true
    })
    .map(({ id, name }) => ({ id, name }))
}

export function getAll() {
  return lampCollection.chain().data({
    removeMeta: true
  })
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
  const { $loki, ...docRest } = lampCollection.insertOne(doc)
  // ToDo handle db level errors and return them
  return docRest
}

export function update({ id, ...lampRest }) {
  const doc = sanitize(lampRest)
  const errors = validate(doc)
  if (errors) {
    return errors
  }
  const dbDoc = getById(id)
  if (!dbDoc) {
    return {
      errors: [`didn't found a Lamp document from database with {id}: "${id}"`]
    }
  }
  Object.assign(dbDoc, doc)
  // ToDo add error handling (Loki, sync vs async update!)
  const { $loki, ...docRest } = lampCollection.update(dbDoc)
  return docRest
}

function getById(id) {
  return lampCollection.by('id', id)
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
  const dbDoc = getById(id)
  if (lampCollection.remove(dbDoc)) {
    return { id }
  } else {
    return { errors: [{ no_exist: id }] }
  }
}
