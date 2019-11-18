import { getOrAddCollection, setupTransforms } from './utilities'
import generateDocId from './idGeneration'

/**
 * Output of IoTNode
 * @typedef {{ id: number; usage: string}} Output
 */

/**
 * IoTNode document
 * @typedef {{
 *  id: number;
 *  iottype: string;
 *  outputs: Output[];
 *  }} IoTNodeDoc
 */

/**
 * @type {Collection<IoTNodeDoc>}
 */
let collection
const parpre = '[%lktxp]'

/**
 * Get or create configured Loki Collection for Preset documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection<IoTNodeDoc>} initialized collection
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
 * @param {IoTNodeDoc} doc
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
