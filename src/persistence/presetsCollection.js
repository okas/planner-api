import { getOrAddCollection, setupTransforms } from './utilities'

const parpre = '[%lktxp]'

/**
 * Get or create configured Loki Collection for Preset documents.
 * @param {Loki} database Loki database instance.
 * @returns {Collection} Presets Collection instance.
 */
export default function setupPresetCollection(database) {
  return setupTransforms(getOrAddCollection(database, 'presets'), appTransforms)
}

const appTransforms = {
  findPresetsByDevice: [
    {
      type: 'find',
      value: {
        'devices.id': `${parpre}id`,
        'devices.type': `${parpre}type`
      }
    }
  ]
}
