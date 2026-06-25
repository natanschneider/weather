import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)

  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }

  document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initialMode =
      stored === 'light' || stored === 'dark' || stored === 'auto'
        ? stored
        : 'auto'
    setMode(initialMode)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(nextMode)
    applyThemeMode(nextMode)
    localStorage.setItem('theme', nextMode)
  }

  if (!mounted) return null

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-md border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) transition hover:-translate-y-0.5"
    >
      {mode === 'auto' && <Monitor size={20} />}
      {mode === 'dark' && <Moon size={20} />}
      {mode === 'light' && <Sun size={20} />}
    </button>
  )
}
