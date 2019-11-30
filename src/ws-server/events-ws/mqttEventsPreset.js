import {
  queryRunnableTaskById,
  runPresetTask
} from '../../presetScheduler/sharedFunctions'

/**
 * @param {SocketIO.Socket} socket
 */
export default function registerMqttEventsPreset(socket) {
  socket.on('preset__run_taks_manually', (presetId, fn) => {
    const waitForTimeout = 5000
    const startedDevices = []
    const { devices } = queryRunnableTaskById(presetId)

    runPresetTask(devices, socket.id, beforeDoneCallback)
    fn({ status: 'ok', startInitiatedDevicesCount: devices.length })
    const timeout = setTimeout(emitResult, waitForTimeout, true)

    function beforeDoneCallback(startedDevice) {
      if (!timeout.hasRef()) {
        return
      }
      startedDevices.push(startedDevice)
      if (startedDevices.length === devices.length) {
        clearTimeout(timeout)
        emitResult()
      }
    }

    function emitResult(timeoutReached = false) {
      const eventPayload = {
        presetId,
        status: 'ok',
        timeoutReached,
        startedDevices
      }
      socket.emit('preset__api_run_taks_manually', eventPayload)
    }
  })
}
