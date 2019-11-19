import { iotnodeCollection } from '../persistence'

/**
 * Upsert object to database; or return `{errors:[]}`, if validation fails.
 * @param {import('../persistence/iotnodeCollection').IoTNodeDoc} iotnode entity data to upinsert to database, provided `{id}` wil be used and it must be unique!
 */
export function addOrUpdate(iotnode) {
  const doc = sanitize(iotnode)
  let errors = validate(doc)
  if (errors) {
    return errors
  }
  let dbDoc = getById(doc.id)
  if (dbDoc) {
    errors = validateUpdate(doc, dbDoc)
    if (errors) {
      return errors
    }
    Object.assign(dbDoc, doc)
    dbDoc = iotnodeCollection.update(dbDoc)
  } else {
    // @ts-ignore
    dbDoc = iotnodeCollection.insertOne(doc)
  }
  const { $loki, ...docRest } = dbDoc
  return docRest
}

/**
 * @param {import('../persistence/iotnodeCollection').IoTNodeDoc} sourceDoc Incoming data to update database.
 * @param {import('../persistence/iotnodeCollection').IoTNodeDoc} dbDoc Current database document.
 */
function validateUpdate(
  { iottype: srcType, outputs: srcOutputs },
  { iottype: dbType, outputs: dbOutputs }
) {
  const errors = []
  if (srcType !== dbType) {
    errors.push(getErrorMessageDataMissmatch('iottype', srcType, dbType))
  }
  if (srcOutputs.length !== dbOutputs.length) {
    errors.push(
      getErrorMessageDataMissmatch(
        'outputs.length',
        srcOutputs.length,
        dbOutputs.length
      )
    )
  }
  for (let i = 0; i < srcOutputs.length; i++) {
    const srcId = srcOutputs[i].id
    const dbId = dbOutputs[i].id
    if (srcId < 1) {
      errors.push(getErrorMessagePropValue('[output.id]', srcId))
    }
    if (srcId !== dbId) {
      errors.push(getErrorMessageDataMissmatch('[output.id]', srcId, dbId))
    }
  }
  return errors.length ? { errors } : null
}

/**
 * @param {Number} id
 */
export function getById(id) {
  return iotnodeCollection.by('id', id)
}

/**
 * Takes object from API request and sanitizes according to model.
 * @param {Object} sourceDoc source document.
 * @returns {import('../persistence/iotnodeCollection').IoTNodeDoc} new object that only has properties defined by model.
 */
function sanitize({ id, iottype, outputs: rawOutputs }) {
  return {
    id,
    iottype,
    outputs: rawOutputs.map(({ id, usage }) => ({ id, usage }))
  }
}

function validate({ iottype, outputs }) {
  const errors = []
  validateIoTType(iottype, errors)
  validateOutputs(outputs, errors)
  return errors.length ? { errors } : null
}

function validateIoTType(iottype, errors) {
  if (!iottype) {
    errors.push(getErrorMessagePropValue('iottype', iottype))
  }
}

/**
 * @param {import('../persistence/iotnodeCollection').Output[]} outputs
 * @param {string[]} errors
 */
function validateOutputs(outputs, errors) {
  if (outputs && outputs.length > 0) {
    outputs.forEach(({ id, usage }) => {
      if (id === undefined) {
        errors.push(getErrorMessagePropValue('outputs.id', id))
      }
      if (usage === undefined) {
        /* Property must be present, but empty value is allowed! */
        errors.push(getErrorMessagePropValue('output.usage', usage))
      }
    })
  } else {
    errors.push(getErrorMessagePropValue('outputs', JSON.stringify(outputs)))
  }
}

export function remove(id) {
  const dbDoc = getById(id)
  if (iotnodeCollection.remove(dbDoc)) {
    return { id }
  } else {
    return { errors: [{ no_exist: id }] }
  }
}

const getErrorMessagePropValue = (propName, propValue) => {
  return `attempted object didn't have valid {${propName}} value: "${propValue}"`
}

const getErrorMessageDataMissmatch = (propName, srcPropVale, dbPropVale) => {
  return `data mismatch, {${propName}}: incoming has {${srcPropVale}}; database has "${dbPropVale}"`
}
