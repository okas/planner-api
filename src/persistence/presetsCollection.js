import { getOrAddCollection } from './utilities'

const parpre = '[%lktxp]'

export default function setupPresetCollection(database) {
  const collection = getOrAddCollection(database, 'presets')
  collection.setTransform('findPresetsByDevice', [
    {
      type: 'find',
      value: {
        'devices.id': `${parpre}id`,
        'devices.type': `${parpre}type`
      }
    }
  ])
  return collection
}
