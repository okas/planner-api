/**
 * Transform returning function.
 * @param fnGetStateVal Function that gets item's id as argument and returns value for state property.
 * [State] property is added to object.
 * @returns function for Loki object mapping function. Removes most of Loki meta properties, renames $loki=>id,
 * optionally adds custom property if property mapper function is provided.
 */
export function transformItems(fnGetStateVal) {
  return ({ meta, $loki: id, ...item }) => ({
    id,
    ...item,
    ...(fnGetStateVal && { state: fnGetStateVal(id) })
  })
}
