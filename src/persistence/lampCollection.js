import { getOrAddCollection } from './utilities'

export default function setupLampCollection(database) {
  return getOrAddCollection(database, 'lamp')
}
