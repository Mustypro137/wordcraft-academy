import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { ageGroupOptions, levelOptions } from '../../data/profileOptions'
import { requestPersistentStorage } from '../../store/displaySettings'
import { useLearnerStore } from '../../store/learnerStore'
import { isValidName, MAX_NAME_LENGTH } from '../../store/profiles'
import type { AgeGroup, LearningLevel } from '../../types'
import styles from './CreateProfile.module.css'

interface CreateProfileProps {
  /** True on the very first visit: shows the welcome text */
  firstVisit?: boolean
  onFinished: () => void
  onCancel?: () => void
}

const STEP_TITLES = ['What should we call you?', 'Who is learning?', 'How good is your English now?']

// Three short steps: name, age group, level. One question per screen.
export function CreateProfile({ firstVisit = false, onFinished, onCancel }: CreateProfileProps) {
  const addProfile = useLearnerStore((s) => s.addProfile)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const [level, setLevel] = useState<LearningLevel | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  // Move focus to the new question, so screen readers read it out
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const nameError = nameTouched && !isValidName(name) ? 'Please type a name (up to 30 characters).' : null
  const canContinue = [isValidName(name), ageGroup !== null, level !== null][step]

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canContinue) {
      setNameTouched(true)
      return
    }
    if (step < 2) {
      setStep(step + 1)
      return
    }
    addProfile({ name, ageGroup: ageGroup!, level: level! })
    requestPersistentStorage()
    onFinished()
  }

  return (
    <div className={styles.page}>
      <title>{firstVisit ? 'Welcome · WordCraft Academy' : 'New profile · WordCraft Academy'}</title>

      {firstVisit && (
        <header className={styles.welcome}>
          <img src="/favicon.svg" alt="" width="40" height="40" />
          <div>
            <p className={styles.welcomeTitle}>Welcome to WordCraft Academy</p>
            <p className={styles.welcomeText}>Your private English notebook. Everything stays on this device.</p>
          </div>
        </header>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          {STEP_TITLES[step]}
        </h1>

        {step === 0 && (
          <div className="field">
            <label htmlFor="profile-name" className="field-label">
              Your name
            </label>
            <input
              id="profile-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              maxLength={MAX_NAME_LENGTH + 10}
              autoComplete="given-name"
              autoFocus={!firstVisit}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? 'profile-name-error' : 'profile-name-hint'}
            />
            {nameError ? (
              <p id="profile-name-error" className="field-error">
                {nameError}
              </p>
            ) : (
              <p id="profile-name-hint" className="field-hint">
                Only people using this device can see it.
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <ChoiceGroup legend="Age group" hideLegend options={ageGroupOptions} value={ageGroup} onChange={setAgeGroup} />
        )}

        {step === 2 && (
          <>
            <p className={styles.note}>Choose the closest one. You can change it any time in Settings.</p>
            <ChoiceGroup legend="English level" hideLegend options={levelOptions} value={level} onChange={setLevel} />
          </>
        )}

        <div className={styles.actions}>
          <button type="submit" className="btn" disabled={step > 0 && !canContinue}>
            {step < 2 ? 'Continue' : 'Start learning'}
          </button>
          {step > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step === 0 && onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <p className={styles.progress} aria-live="polite">
            Step {step + 1} of 3
          </p>
        </div>
      </form>
    </div>
  )
}
