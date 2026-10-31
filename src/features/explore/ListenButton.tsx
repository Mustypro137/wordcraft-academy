import styles from './WordPage.module.css'

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

// Reads the word aloud with the browser's built-in voice. Nothing is sent
// to a server. Hidden in browsers that have no voice.
export function ListenButton({ text }: { text: string }) {
  if (!canSpeak) return null

  function speak() {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button type="button" className={`btn btn-secondary ${styles.listen}`} onClick={speak}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
      </svg>
      Listen
      <span className="visually-hidden">: {text}</span>
    </button>
  )
}
