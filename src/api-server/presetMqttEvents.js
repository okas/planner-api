import {
  queryRunnableTaskById,
  runPresetTask
} from '../presetScheduler/sharedFunctions'

export default function registerPresetMqttEvents(socket) {
  socket.on('preset__run_taks_manually', (presetId, fn) => {
    const { devices } = queryRunnableTaskById(presetId)
    runPresetTask(devices, socket.id)
    fn({ status: 'ok', startedDevicesCount: devices.length })
  })
}
