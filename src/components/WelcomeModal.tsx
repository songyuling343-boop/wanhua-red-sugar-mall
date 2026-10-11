import { useEffect, useRef, useState } from 'react'
import { X, ArrowUpRight, Sparkles } from 'lucide-react'
import { site } from '../data/site'
import { readStorage, writeStorage } from '../utils/storage'
import { IpPortrait } from './ShopUI'
export default function WelcomeModal() {
  const [open, setOpen] = useState(() => readStorage<boolean>(site.storage.welcome, false) !== true)
  const panel = useRef<HTMLDivElement>(null)
  function dismiss() { writeStorage(site.storage.welcome,true); setOpen(false) }
  useEffect(() => {
    if (!open) return
    // Mark displayed, even if the visitor leaves without pressing either action.
    writeStorage(site.storage.welcome,true)
    const before = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'Tab') {
        const nodes = panel.current?.querySelectorAll<HTMLElement>('button, a[href]')
        if (!nodes?.length) return
        const first=nodes[0], last=nodes[nodes.length-1]
        if (event.shiftKey && document.activeElement===first) {event.preventDefault();last.focus()}
        if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus()}
      }
    }
    document.addEventListener('keydown',onKey)
    return () => {document.body.style.overflow=previousOverflow; document.removeEventListener('keydown',onKey);before?.focus()}
  },[open])
  if (!open) return null
  return <div className="modal-backdrop"><div ref={panel} className="welcome-modal" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-subtitle"><button className="modal-close icon-button" aria-label="关闭邀请弹窗" onClick={dismiss}><X size={19}/></button><span className="eyebrow"><Sparkles size={13}/> A LITTLE SWEET SURPRISE</span><IpPortrait/><span className="modal-label">你的甜蜜属性，等待被发现</span><h2 id="welcome-title">万巧巧邀你测测<br/>自己的红糖属性！</h2><p id="welcome-subtitle">发现藏在甜蜜里的另一个自己。</p><a className="primary-button" href={site.links.quiz} onClick={dismiss}>立即测试<ArrowUpRight size={18}/></a><button className="skip-button" onClick={dismiss}>先逛逛商城</button><small className="welcome-brand"><img src={site.assets.logo} alt="万华官方 Logo"/>万华巧家小碗红糖 · 趣味互动</small></div></div>
}
