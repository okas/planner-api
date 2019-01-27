import { roomLamps, roomBlinds } from '../persistence'
import { transformItems, groupByRooms } from './transforms'

const translations = {
  en: {
    lampGroupId: 'Lamps',
    blindsGroupId: 'Blinds'
  },
  ee: {
    lampGroupId: 'Lambid',
    blindsGroupId: 'Rulood'
  }
}

export function getDevices(lang) {
  const i18n = translations[lang] || translations['en']
  return [
    {
      type: 'room_lamps',
      name: i18n.lampGroupId,
      items: roomLamps.chain().mapReduce(transformItems(), groupByRooms)
    },
    {
      type: 'room_blinds',
      name: i18n.blindsGroupId,
      items: roomBlinds.chain().mapReduce(transformItems(), groupByRooms)
    }
  ]
}
