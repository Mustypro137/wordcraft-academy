import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import {
  ageGroupOptions,
  dailyGoalOptions,
  labelOf,
  levelOptions,
  textSizeOptions,
  themeOptions,
} from '../../data/profileOptions'
import { backupFileName, createBackup, protectStorage } from '../../store/backup'
import { useActiveProfile, useLearnerStore } from '../../store/learnerStore'
import { cleanName, isValidName, MAX_NAME_LENGTH } from '../../store/profiles'
import type { DailyGoal, Profile } from '../../types'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const profile = useActiveProfile()
  const updateProfile = useLearnerStore((s) => s.updateProfile)

  // The app only shows Settings when a profile exists
  if (!profile) return null
  const update = (changes: Parameters<typeof updateProfile>[1]) => updateProfile(profile.id, changes)

  return (
    <article className={styles.page}>
      <title>Settings · WordCraft Academy</title>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section} aria-labelledby="settings-profile">
        <h2 id="settings-profile" className={styles.heading}>
          Your profile
        </h2>
        {/* "key" resets the name field when you switch to another profile */}
        <NameForm key={profile.id} profile={profile} onSave={(name) => update({ name })} />
        <ChoiceGroup
          legend="Age group"
          layout="inline"
          options={ageGroupOptions}
          value={profile.ageGroup}
          onChange={(ageGroup) => update({ ageGroup })}
        />
        <ChoiceGroup
          legend="English level"
          layout="inline"
          options={levelOptions}
          value={profile.level}
          onChange={(level) => update({ level })}
        />
        <ChoiceGroup
          legend="Daily goal"
          layout="inline"
          options={dailyGoalOptions}
          value={`${profile.dailyGoal}`}
          onChange={(goal) => update({ dailyGoal: Number(goal) as DailyGoal })}
        />
        <p className={styles.note}>
          Each review answer, each word you save for the first time and each correct sentence counts as one.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="settings-display">
        <h2 id="settings-display" className={styles.heading}>
          Display
        </h2>
        <ChoiceGroup
          legend="Theme"
          layout="inline"
          options={themeOptions}
          value={profile.theme}
          onChange={(theme) => update({ theme })}
        />
        <ChoiceGroup
          legend="Text size"
          layout="inline"
          options={textSizeOptions}
          value={profile.textSize}
          onChange={(textSize) => update({ textSize })}
        />
        <p className={styles.note}>These choices belong to your profile. Other profiles keep their own.</p>
      </section>

      <section className={styles.section} aria-labelledby="profiles">
        <h2 id="profiles" className={styles.heading} tabIndex={-1}>
          Profiles on this device
        </h2>
        <ProfileList activeId={profile.id} />
        <div>
          <Link to="/profiles/new" className="btn btn-secondary">
            Add a profile
          </Link>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="settings-data">
        <h2 id="settings-data" className={styles.heading}>
          Your data
        </h2>
        <p className={styles.text}>
          Your profiles and progress are saved only in this browser, on this device. Nothing is sent to a server.
        </p>
        <BackupPanel />
      </section>
    </article>
  )
}

function BackupPanel() {
  // null while we ask the browser
  const [isProtected, setIsProtected] = useState<boolean | null>(null)
  useEffect(() => {
    protectStorage().then(setIsProtected, () => setIsProtected(false))
  }, [])

  function download() {
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
  }

  return (
    <>
      <p className={styles.text}>
        {isProtected === null
          ? 'Checking whether this browser keeps your data safe…'
          : isProtected
            ? 'This browser has agreed to keep your data, even when space runs low.'
            : "This browser may delete your data if space runs low or you don't visit for a while (Safari on iPhone can, after about 7 days). Download a backup now and then."}
      </p>
      <p className={styles.text}>
        A backup file holds every profile on this device and all their words. Keep it somewhere safe. Loading a
        backup back into the app arrives in Step 13 of the plan.
      </p>
      <div>
        <button type="button" className="btn btn-secondary" onClick={download}>
          Download my data
        </button>
      </div>
    </>
  )
}

function NameForm({ profile, onSave }: { profile: Profile; onSave: (name: string) => void }) {
  const [draft, setDraft] = useState(profile.name)
  const [saved, setSaved] = useState(false)
  const valid = isValidName(draft)
  const changed = cleanName(draft) !== profile.name

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || !changed) return
    onSave(draft)
    setDraft(cleanName(draft))
    setSaved(true)
  }

  return (
    <form className={styles.nameForm} onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="settings-name" className="field-label">
          Name
        </label>
        <div className={styles.nameRow}>
          <input
            id="settings-name"
            className="input"
            value={draft}
            maxLength={MAX_NAME_LENGTH + 10}
            onChange={(e) => {
              setDraft(e.target.value)
              setSaved(false)
            }}
            aria-invalid={!valid || undefined}
            aria-describedby="settings-name-status"
          />
          <button type="submit" className="btn btn-secondary" disabled={!valid || !changed}>
            Save name
          </button>
        </div>
        <p id="settings-name-status" className={valid ? 'field-hint' : 'field-error'} aria-live="polite">
          {!valid ? 'Please type a name (up to 30 characters).' : saved ? 'Name saved.' : ''}
        </p>
      </div>
    </form>
  )
}

function ProfileList({ activeId }: { activeId: string }) {
  const profiles = useLearnerStore((s) => s.profiles)
  const switchProfile = useLearnerStore((s) => s.switchProfile)
  const removeProfile = useLearnerStore((s) => s.removeProfile)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <ul className={styles.profileList}>
      {profiles.map((p) => {
        const isActive = p.id === activeId
        return (
          <li key={p.id} className={styles.profileRow}>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>
                {p.name}
                {isActive && <span className={styles.current}>Current</span>}
              </span>
              <span className={styles.profileMeta}>
                {labelOf(ageGroupOptions, p.ageGroup)} · {labelOf(levelOptions, p.level)}
              </span>
            </div>

            {confirmingId === p.id ? (
              <div className={styles.confirm} role="group" aria-label={`Delete ${p.name}'s profile?`}>
                <p className={styles.confirmText}>
                  Delete {p.name}'s profile? Their words and progress will be deleted too. This can't be undone.
                </p>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      removeProfile(p.id)
                      // The pressed button disappears, so give keyboard focus a sensible place
                      document.getElementById('profiles')?.focus()
                    }}
                  >
                    Delete
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setConfirmingId(null)} autoFocus>
                    Keep profile
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.rowActions}>
                {!isActive && (
                  <button type="button" className="btn btn-secondary" onClick={() => switchProfile(p.id)}>
                    Switch to {p.name}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmingId(p.id)}
                  aria-label={`Delete ${p.name}'s profile`}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
