import { getOrAddCollection } from './utilities'

export default function setupLampCollection(database) {
  return getOrAddCollection(database, 'room_lamps')
}
