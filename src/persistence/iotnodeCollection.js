import { getOrAddCollection, setupTransforms } from './utilities'
import generateDocId from './idGeneration'

/**
 * @type {Collection<import('./typedefs').IoTNodeDBDoc>}
 */
let collection
const parpre = '[%lktxp]'

/**
 * Get or create configured Loki Collection for Preset documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection<import('./typedefs').IoTNodeDBDoc>} initialized collection
 */
export default function setupIoTNodeCollection(database) {
  collection = getOrAddCollection(database, 'iotnode', {
    unique: ['id'],
    disableMeta: true
  })
  collection.on('pre-insert', generateOutputIds)
  return setupTransforms(collection, requiredTransforms)
}

/**
 * @param {import('./typedefs').IoTNodeDBDoc} doc
 */
export function generateOutputIds(doc) {
  doc.outputs.forEach(generateDocId)
}

const requiredTransforms = {
  findIotNodesByOutput: [
    {
      type: 'find',
      value: {
        'outputs.id': `${parpre}id`
      }
    }
  ]
}
