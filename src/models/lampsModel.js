import { transformItems, groupByRooms } from './transforms'
import { roomLamps } from '../persistence'
import { getRandomIntInclusive } from '../utilities'

export function getGroupedLamps() {
  return roomLamps
    .chain()
    .mapReduce(transformItems(id => getState(id)), groupByRooms)
}

// Mockup function. This funtion will retreive physical state in future.
function getState(lampId) {
  // About 1/3 of calls will be 1, otherwize 0.
  // Dimmed lamps might have value 0..1 ? ;-)
  return +(getRandomIntInclusive(lampId, lampId + 2) % (lampId + 2) === 0)
}

/**
 * Takes new object, saves to database, or returns `{errors}`,
 * if validation fails.
 * @param lamp preset to insert to database, provided `{id}` prop will be ignored.
 * @returns new preset's `{id}` or `{errors:[]}`.
 */
export function lampAdd(lamp) {
  // We will ignor sent id, because db will assign id for a document and returns it to the conumer
  delete lamp.id
  const erros = validate(lamp)
  if (erros) {
    return erros
  }
  // ToDo handle db level errors and return them
  return { id: roomLamps.insertOne(lamp).$loki }
}

function validate({ name, room, valuestep }) {
  let errors = []
  if (!name) {
    errors.push(`attempted object didn't have valid {name} value: [${name}]`)
  }
  if (!room) {
    errors.push(`attempted object didn't have valid {room} value: [${room}]`)
  }
  if (!(valuestep === 1 || (valuestep > 0 && valuestep <= 0.5))) {
    errors.push(
      `attempted object didn't have valid {valuestep} value; must be 1 or > 0 and <= 0.5: [${valuestep}]`
    )
  }
  return errors.length ? { errors } : null
}
