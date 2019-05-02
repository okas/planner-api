import { getOrAddCollection, setupTransforms } from './utilities'

const parpre = '[%lktxp]'

/**
 * Get or create configured Loki Collection for Preset documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection} Presets Collection instance.
 */
export default function setupPresetCollection(database) {
  const collection = getOrAddCollection(database, 'preset', {
    unique: ['id'],
    disableMeta: true
  })
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
