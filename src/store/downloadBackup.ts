import { backupFileName, createBackup } from './backup'
import { rememberBackup } from './backupReminder'
import { useLearnerStore } from './learnerStore'

/** Downloads a backup file of everything on this device, and remembers when */
export function downloadBackup() {
  const now = new Date()
  const backup = createBackup(useLearnerStore.getState(), now)
  // Make a file in memory, "click" a hidden link to save it, then free the memory
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = backupFileName(now)
  link.click()
  // Wait a moment: some browsers cancel the download if the memory is freed at once
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  rememberBackup(now)
}
