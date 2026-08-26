'use client'

import { useEffect, useRef, useState } from 'react'
import { T3 } from './t3'

/* The third link on the card. No phone joins a network from a plain web
   link, so "connect" is built per platform: iPhones get a one-tap Wi-Fi
   profile (installed once, the phone joins and rejoins on its own) and
   Androids get the password put on the clipboard and the Wi-Fi settings
   panel opened on top of it. The credential rows stay for everyone else —
   and for in-app browsers where neither trick is allowed. */
export default function WifiCard({ ssid, password }: { ssid: string; password: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'ssid' | 'pass' | null>(null)
  const [failed, setFailed] = useState(false)
  // resolved after mount so the server render stays platform-neutral
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')
  const [connectHint, setConnectHint] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setPlatform('ios')
    } else if (/Android/i.test(ua)) {
      setPlatform('android')
    }
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [])

  async function copy(which: 'ssid' | 'pass', text: string) {
    if (timer.current) clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      timer.current = setTimeout(() => setCopied(null), 1800)
      return true
    } catch {
      /* clipboard blocked — the values stay selectable, the hint says so */
      setFailed(true)
      setCopied(null)
      return false
    }
  }

  /* Android: password onto the clipboard, then the system Wi-Fi panel on
     top of it — the guest picks the network and pastes. The intent URL is
     a no-op outside Chrome-likes; the copied password still stands. */
  async function connectAndroid() {
    await copy('pass', password)
    setConnectHint(true)
    try {
      window.location.href = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end'
    } catch {
      /* unsupported browser — the hint + copied password carry it */
    }
  }

  return (
    <div className={`cg-link cg-wifi${open ? ' open' : ''}`}>
      <button
        type="button"
        className="cg-wifi-head"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="cg-ico cg-ico-org"><WifiIcon /></span>
        <span className="cg-txt">
          <b>Wi-Fi</b>
          <small>
            <T3 ka="დაუკავშირდი ინტერნეტს" en="Connect to the internet" ru="Подключитесь к интернету" />
          </small>
        </span>
        <ChevDown />
      </button>

      {open && (
        <div className="cg-wifi-body">
          {platform === 'ios' && (
            <>
              <a className="cg-wifi-connect" href="/chito-gvrito/wifi.mobileconfig">
                <WifiIcon />
                <T3 ka="დაკავშირება" en="Connect" ru="Подключиться" />
              </a>
              <p className="cg-wifi-hint">
                <T3
                  ka="ჩამოიტვირთება Wi-Fi პროფილი — დააჭირე „დაშვება“-ს, შემდეგ Settings → Profile Downloaded → Install, და ტელეფონი თავად დაუკავშირდება."
                  en="A Wi-Fi profile will download — tap Allow, then Settings → Profile Downloaded → Install, and your phone joins on its own."
                  ru="Загрузится Wi-Fi профиль — нажмите «Разрешить», затем Настройки → Профиль загружен → Установить, и телефон подключится сам."
                />
              </p>
            </>
          )}
          {platform === 'android' && (
            <>
              <button type="button" className="cg-wifi-connect" onClick={connectAndroid}>
                <WifiIcon />
                <T3 ka="დაკავშირება" en="Connect" ru="Подключиться" />
              </button>
              {connectHint && (
                <p className="cg-wifi-hint">
                  <T3
                    ka="პაროლი დაკოპირდა — გახსნილ ფანჯარაში აირჩიე ქსელი და ჩასვი."
                    en="Password copied — pick the network in the panel that opens and paste."
                    ru="Пароль скопирован — выберите сеть в открывшемся окне и вставьте."
                  />
                </p>
              )}
            </>
          )}

          <div className="cg-wifi-row">
            <span className="cg-wifi-lab"><T3 ka="ქსელი" en="Network" ru="Сеть" /></span>
            <code>{ssid}</code>
            <button type="button" onClick={() => copy('ssid', ssid)}>
              {copied === 'ssid'
                ? <T3 ka="დაკოპირდა ✓" en="Copied ✓" ru="Скопировано ✓" />
                : <T3 ka="კოპირება" en="Copy" ru="Копировать" />}
            </button>
          </div>
          <div className="cg-wifi-row">
            <span className="cg-wifi-lab"><T3 ka="პაროლი" en="Password" ru="Пароль" /></span>
            <code>{password}</code>
            <button type="button" onClick={() => copy('pass', password)}>
              {copied === 'pass'
                ? <T3 ka="დაკოპირდა ✓" en="Copied ✓" ru="Скопировано ✓" />
                : <T3 ka="კოპირება" en="Copy" ru="Копировать" />}
            </button>
          </div>
          <p className="cg-wifi-hint">
            {failed ? (
              <T3
                ka="ვერ დაკოპირდა — ხანგრძლივად დააჭირე პაროლს და მონიშნე."
                en="Couldn't copy — long-press the password to select it."
                ru="Не удалось скопировать — удерживайте пароль, чтобы выделить его."
              />
            ) : (
              <T3
                ka="ან დააკოპირე პაროლი, გახსენი პარამეტრებში Wi-Fi და აირჩიე ქსელი."
                en="Or copy the password, open Wi-Fi in Settings and pick the network."
                ru="Или скопируйте пароль, откройте Wi-Fi в настройках и выберите сеть."
              />
            )}
          </p>
          {/* what just happened, for ears instead of eyes */}
          <p className="sr-only" role="status">
            {copied === 'ssid' && <T3 ka="ქსელის სახელი დაკოპირდა" en="Network name copied" ru="Имя сети скопировано" />}
            {copied === 'pass' && <T3 ka="პაროლი დაკოპირდა" en="Password copied" ru="Пароль скопирован" />}
            {failed && <T3 ka="კოპირება ვერ მოხერხდა" en="Copy failed" ru="Не удалось скопировать" />}
          </p>
        </div>
      )}
    </div>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <path d="M2.5 9a14.5 14.5 0 0 1 19 0" />
      <path d="M5.8 12.5a10 10 0 0 1 12.4 0" />
      <path d="M9 16a5.3 5.3 0 0 1 6 0" />
      <circle cx="12" cy="19.4" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ChevDown() {
  return (
    <svg className="cg-chev" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}
