/**
 * Either gets existing or creates a collection by `name`.
 * @param {Loki} database
 * @param {string} name
 * @param {Object} config Loki Colleciton configuration
 * @returns {Collection} Loki Collection instance
 */
export function getOrAddCollection(database, name, config = null) {
  return database.getCollection(name) || database.addCollection(name, config)
}

/**
 * @param {Collection<any>} collection
 * @param {Object} transforms an object those keys are names of tansforms and values are Loki Collection transform definitions.
 */
export function setupTransforms(collection, transforms) {
  const transformsKeys = Object.keys(transforms)
  Object.keys(collection.transforms)
    .filter(x => !transformsKeys.includes(x))
    .forEach(x => collection.removeTransform(x))
  transformsKeys.forEach(x => collection.setTransform(x, transforms[x]))
  return collection
}
