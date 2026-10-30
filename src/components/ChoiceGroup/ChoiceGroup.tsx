import { useId } from 'react'
import type { Option } from '../../data/profileOptions'
import styles from './ChoiceGroup.module.css'

interface ChoiceGroupProps<T extends string> {
  legend: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  /** "cards": large options with descriptions. "inline": a compact row. */
  layout?: 'cards' | 'inline'
  /** Hide the legend visually (it is still read aloud) */
  hideLegend?: boolean
}

// A group of choices where only one can be picked. It uses real radio
// buttons, so arrow keys, screen readers and forms all work as expected.
export function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  layout = 'cards',
  hideLegend = false,
}: ChoiceGroupProps<T>) {
  const name = useId()
  return (
    <fieldset className={`${styles.group} ${styles[layout]}`}>
      <legend className={hideLegend ? 'visually-hidden' : styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.input}
            />
            <span className={styles.text}>
              <span className={styles.label}>{option.label}</span>
              {layout === 'cards' && option.description && (
                <span className={styles.description}>{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
