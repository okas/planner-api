import { getOrAddCollection } from './utilities'

export default function setupBlindCollection(database) {
  return getOrAddCollection(database, 'blind')
}
