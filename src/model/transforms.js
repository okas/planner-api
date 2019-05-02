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
