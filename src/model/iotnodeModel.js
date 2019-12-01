import { iotnodeCollection } from '../persistence'
import { ValidationErrors, ExistingDocumentError } from './errors'

/**
 * Upsert object to database; or return `{errors:[]}`, if validation fails.
 * @param {import('./typedefs').IoTNodeDoc} iotnode entity data to upinsert to database, provided `{id}` wil be used and it must be unique!
 * @returns {import('./typedefs').IoTNodeDoc}
 */
export function addOrUpdate(iotnode) {
  const doc = sanitize(iotnode)
  const errors = validateInitial(doc)
  if (errors.length) {
    throw new ValidationErrors('', errors)
  }
  let dbDoc = getById(doc.id)
  if (!dbDoc) {
    /* New IoTNod, need to save; persistence layer will generate Ids for Outputs. */
    // @ts-ignore
    dbDoc = iotnodeCollection.insertOne(doc)
  } else if (validateOnlyOutputsUsageCanDiffer(errors, doc, dbDoc).length) {
    /* Error path: document exists, but source and database versions differs in prohibited way. */
    throw new ExistingDocumentError('', trim$loki(dbDoc), errors)
  } else {
    /* Update path */
    Object.assign(dbDoc, doc)
    dbDoc = iotnodeCollection.update(dbDoc)
  }
  return trim$loki(dbDoc)
}

/**
 * @param {import('./typedefs').IoTNodeDoc} iotnode entity data to upinsert to database, provided `{id}` wil be used and it must be unique!
 * @returns {import('./typedefs').IoTNodeDoc}
 */
export function updateForced(iotnode) {
  const doc = sanitize(iotnode)
  const errors = validateInitial(doc)
  validateOutputsRequireId(errors, doc.outputs)
  if (errors.length) {
    throw new ValidationErrors('', errors)
  }
  let dbDoc = getById(doc.id)
  if (!dbDoc) {
    errors.push(`{id} do not exist in database: ${dbDoc.id}`)
    throw new ValidationErrors('', errors)
  }
  Object.assign(dbDoc, doc)
  dbDoc = iotnodeCollection.update(dbDoc)
  return trim$loki(dbDoc)
}

/**
 * @param {string} id
 */
export function getById(id) {
  return iotnodeCollection.by('id', id)
}

/**
 * @param {number} id
 * @returns {{id:number;}|{errors:[{ no_exist:number}]}} where `no_exist` equals to `id` attempted to remove.
 */
export function remove(id) {
  const dbDoc = getById(id.toString())
  if (iotnodeCollection.remove(dbDoc)) {
    return { id }
  } else {
    return { errors: [{ no_exist: id }] }
  }
}

/**
 * Takes object from API request and sanitizes according to model.
 * @param {Object} sourceDoc source document.
 * @returns {import('./typedefs').IoTNodeDoc} new object that only has properties defined by model.
 */
function sanitize({ id, iottype, outputs: rawOutputs }) {
  return {
    id,
    iottype,
    outputs: rawOutputs.map(({ id, usage }) => ({ id, usage }))
  }
}

/**
 * @param {import('./typedefs').IoTNodeDoc} sourceDoc Incoming data to update database.
 */
function validateInitial({ id, iottype }) {
  const errors = []
  if (id === undefined || Number(id) < 1) {
    errors.push(getErrorMessagePropValue('id', id))
  }
  if (stringIsEmptyOrWhiteSpace(iottype)) {
    /* Must have any string value. */
    errors.push(getErrorMessagePropValue('iottype', iottype))
  }
  return errors
}

/**
 * @param {string[]} errors
 * @param {import('./typedefs').Output[]} outputs
 */
function validateOutputsRequireId(errors, outputs) {
  if (outputs && outputs.length > 0) {
    outputs.forEach(({ id }) => {
      if (id === undefined || Number(id) < 1) {
        errors.push(getErrorMessagePropValue('outputs.id', id))
      }
    })
  } else {
    errors.push(getErrorMessagePropValue('outputs', JSON.stringify(outputs)))
  }
}

/**
 * @param {string[]} errors
 * @param {import('./typedefs').IoTNodeDoc} sourceDoc Incoming data to update database.
 * @param {import('./typedefs').IoTNodeDoc} dbDoc Current database document.
 */
function validateOnlyOutputsUsageCanDiffer(
  errors,
  { id: srcId, iottype: srcType, outputs: srcOutputs },
  { id: dbId, iottype: dbType, outputs: dbOutputs }
) {
  if (srcId !== dbId) {
    errors.push(getErrorMessageDataMissmatch('id', srcId, dbId))
  }
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
  return errors
}

const getErrorMessagePropValue = (propName, propValue) => {
  return `attempted object didn't have valid {${propName}} value: "${propValue}"`
}

const getErrorMessageDataMissmatch = (propName, srcPropVale, dbPropVale) => {
  return `data mismatch, {${propName}}: incoming has "${srcPropVale}"; database has "${dbPropVale}"`
}

/**
 * @param {string} string
 */
function stringIsEmptyOrWhiteSpace(string) {
  return string === undefined || string === null || !string.trim().length
}

/**
 * Trim the `$loki` property, result is other type.
 * @param {import('../persistence/typedefs').IoTNodeDBDoc} dbDoc Database form of document.
 * @returns {import('./typedefs').IoTNodeDoc} Model form of document.
 */
function trim$loki(dbDoc) {
  const { $loki, ...docRest } = dbDoc
  return docRest
}
