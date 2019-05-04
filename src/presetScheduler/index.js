import nodeShedule from 'node-schedule'
import { presetCollection } from '../persistence'
import { runPresetTask, queryAllRunnableTasks } from './sharedFunctions'

export default function initScheduler() {
  runAllPesetTasks()
  presetCollection.addListener('delete', collDeletedHandler)
  presetCollection.addListener('insert', collInsertHandler)
  presetCollection.addListener('update', collUpdateHandler)
}

function runAllPesetTasks() {
  queryAllRunnableTasks().forEach(createScheduledJob)
  logJobCount()
}

function collDeletedHandler({ id }) {
  const job = nodeShedule.scheduledJobs[id]
  if (job) {
    job.cancel()
    logJobCount()
  }
}

function collInsertHandler(docPreset) {
  if (docPreset.active && docPreset.devices.length > 0) {
    createScheduledJob(docPreset)
    logJobCount()
  }
}

function collUpdateHandler(docPreset) {
  collDeletedHandler(docPreset)
  collInsertHandler(docPreset)
}

function createScheduledJob({ id, schedule, devices }) {
  nodeShedule.scheduleJob(id.toString(), schedule, fireDate => {
    runPresetTask(devices, 'presetScheduler', fireDate)
  })
}

function logJobCount() {
  console.log(
    'presetsScheduler: active Job count is',
    Object.keys(nodeShedule.scheduledJobs).length
  )
}
