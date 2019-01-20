/**
 * Transform returning function.
 * @param fnStateMapper Function that gets item's id as argument and return property and value map { prop: val }.
 * This map is added to object.
 * @returns function for Loki object mapping function. Removes most of Loki meta properties, renames $loki=>id,
 * optionally adds custom property if property mapper function is provided.
 */
export function transformItems(fnStateMapper) {
  return ({ meta, $loki: id, ...item }) => ({
    id,
    ...item,
    ...(fnStateMapper && fnStateMapper(id))
  })
}
