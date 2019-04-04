import { getOrAddCollection } from './utilities'

export default function setupBlindsCollection(database) {
  return getOrAddCollection(database, 'room_blinds')
}
