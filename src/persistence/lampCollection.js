import { getOrAddCollection } from './utilities'
import generateDocId from './idGeneration'

/**
 * @type {Collection<import('./typedefs').LampDBDoc>}
 */
let collection

/**
 * Get or create configured Loki Collection for Lamp documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection<import('./typedefs').LampDBDoc>} Collection for Lamp documents
 */
export default function setupLampCollection(database) {
  collection = getOrAddCollection(database, 'lamp', {
    unique: ['id'],
    disableMeta: true
  })
  collection.on('pre-insert', generateDocId)
  return collection
}
