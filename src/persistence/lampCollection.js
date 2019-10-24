import { getOrAddCollection } from './utilities'
import generateDocId from './idGeneration'

let collection

/**
 * Get or create configured Loki Collection for Lamp documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection<{
 *  id:number;
 *  $loki: number;
 *  name: string;
 *  room: string;
 *  valuestep:number;
 * }>} Collection for Lamp documents
 */
export default function setupLampCollection(database) {
  collection = getOrAddCollection(database, 'lamp', {
    unique: ['id'],
    disableMeta: true
  })
  collection.on('pre-insert', generateDocId)
  return collection
}
