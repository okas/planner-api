import { getOrAddCollection } from './utilities'
import generateDocId from './idGeneration'

let collection

/**
 * @param {Loki} database Loki database instance.
 * @returns {Collection<{
 *  id:number;
 *  $loki: number;
 *  name: string;
 *  room: string;
 *  valuestep: number;
 * }>} Collection for Blind documents
 */
export default function setupBlindCollection(database) {
  collection = getOrAddCollection(database, 'blind', {
    unique: ['id'],
    disableMeta: true
  })
  collection.on('pre-insert', generateDocId)
  return collection
}
