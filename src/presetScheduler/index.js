import nodeShedule from 'node-schedule'

export default function initScheduler() {
  presetCollection.addListener('delete', collDeletedHandler)
  presetCollection.addListener('insert', collInsertHandler)
  presetCollection.addListener('update', collUpdateHandler)
}

  presetCollection
    .chain('findRunnablePresets')
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
    logJobCount()
  }
}

function collUpdateHandler(docPreset) {
  collDeletedHandler(docPreset)
  collInsertHandler(docPreset)
}

  nodeShedule.scheduleJob(id.toString(), schedule, fireDate => {
  })
}

function logJobCount() {
  console.log(
    'presetsScheduler: active Job count is',
    Object.keys(nodeShedule.scheduledJobs).length
  )
}
