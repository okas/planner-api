export function getOrAddCollection(database, name, config = null) {
  return database.getCollection(name) || database.addCollection(name, config)
}
