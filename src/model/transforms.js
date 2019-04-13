/**
 * Transform returning function.
 * @param {Function} [fnGetStateVal] Function that gets item's id as argument and returns value for state property.
[State] property is added to object.
 * @returns function for Loki object mapping function. Removes Loki meta properties, creates `id`, from `$loki`
optionally adds custom property if property mapper function is provided.
 */
export function transformItems(fnGetStateVal) {
  return ({ meta, $loki: id, ...item }) => ({
    id,
    ...item,
    ...(fnGetStateVal && { state: fnGetStateVal(id) })
  })
}

/**
 * Groups items by room property, using Array.reduce()
 * @param itemsArray array of items to work through.
 * @returns grouped array: [{ id:'roomName', items: [] }]
 */
export function groupByRooms(itemsArray) {
  return itemsArray.reduce((groupS, { room: id, ...item }) => {
    const group = groupS.find(g => g.id === id)
    if (group) {
      group.items.push(item)
    } else {
      groupS.push({ id, items: [item] })
    }
    return groupS
  }, [])
}
