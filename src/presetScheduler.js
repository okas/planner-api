import nodeShedule from 'node-schedule'
import { presetCollection } from './persistence'

export default function initScheduler() {
  runPresetJobs()
  presetCollection.addListener('delete', collDeletedHandler)
  presetCollection.addListener('insert', collInsertHandler)
  presetCollection.addListener('update', collUpdateHandler)
}

function runPresetJobs() {
  presetCollection
    .chain('findRunnablePresets')
    .data()
    .forEach(initiateJob)
  logJobCount()
}

function collDeletedHandler({ $loki }) {
  const job = nodeShedule.scheduledJobs[$loki]
  if (job) {
    job.cancel()
    logJobCount()
  }
}

function collInsertHandler(docPreset) {
  if (docPreset.active && docPreset.devices.length > 0) {
    initiateJob(docPreset)
    logJobCount()
  }
}

function collUpdateHandler(docPreset) {
  collDeletedHandler(docPreset)
  collInsertHandler(docPreset)
}

function initiateJob(docPreset) {
  nodeShedule.scheduleJob(
    docPreset.$loki.toString(),
    docPreset.schedule,
    fireDate => {
      presetTask(docPreset, fireDate)
    }
  )
}

function presetTask({ devices }, fireDate = new Date()) {
  // ToDo some async way?
  devices.forEach(d =>
    console.log(`at "${fireDate}"`, 'run preset device [hardware] of:', d)
  )
}

function logJobCount() {
  console.log(
    'presetsScheduler: active Job count is',
    Object.keys(nodeShedule.scheduledJobs).length
  )
}
