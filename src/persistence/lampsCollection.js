import { getOrAddCollection } from './utilities'

export default function setupLampsCollection(database) {
  return getOrAddCollection(database, 'room_lamps')
}
