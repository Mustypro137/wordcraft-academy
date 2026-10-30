import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import {
  ageGroupOptions,
  labelOf,
  levelOptions,
  textSizeOptions,
  themeOptions,
} from '../../data/profileOptions'
import { useActiveProfile, useLearnerStore } from '../../store/learnerStore'
import { cleanName, isValidName, MAX_NAME_LENGTH } from '../../store/profiles'
import type { Profile } from '../../types'
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
        <p className={styles.text}>
          If you clear this browser's data, they are deleted. Saving a backup file arrives in Step 13 of the plan.
        </p>
      </section>
    </article>
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
