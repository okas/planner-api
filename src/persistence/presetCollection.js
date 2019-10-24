import { getOrAddCollection, setupTransforms } from './utilities'
import generateDocId from './idGeneration'

let collection
const parpre = '[%lktxp]'

/**
 * Get or create configured Loki Collection for Preset documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection<{
 *  id:number;
 *  $loki: number;
 *  name: string;
 *  schedule: string;
 *  active:boolean;
 *  devices:{id:number,type: string; value: number}[];
 * }>}  Collection for Preset documents
 */
export default function setupPresetCollection(database) {
  collection = getOrAddCollection(database, 'preset', {
    unique: ['id'],
    disableMeta: true
  })
  collection.on('pre-insert', generateDocId)
  return setupTransforms(collection, requiredTransforms)
}

const requiredTransforms = {
  findPresetsByDevice: [
    {
      type: 'find',
      value: {
        'devices.id': `${parpre}id`,
        'devices.type': `${parpre}type`
      }
    }
  ],
  findRunnablePresets: [
    {
      type: 'find',
      value: {
        active: true,
        devices: { $size: { $gt: 0 } }
      }
    }
  ]
}
