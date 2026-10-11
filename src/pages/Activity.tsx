import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { site } from '../data/site'

export default function Activity({ type }: { type: 'quiz' | 'blindbox' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = type === 'quiz' ? '测测你的红糖属性' : '万巧巧惊喜盲盒'
  function returnToMall() {
    const origin = location.state?.activityReturn
    const valid = typeof origin?.to === 'string' && origin.to.startsWith('/') && !origin.to.startsWith('//') && !origin.to.startsWith('/activity/')
    navigate(valid ? origin.to : '/', { replace: true, state: { returnScroll: valid && Number.isFinite(origin.scrollY) ? origin.scrollY : 0 } })
  }
  return <main className="activity-carrier">
    <header className="activity-header"><button onClick={returnToMall}><ArrowLeft size={17}/><span>返回商城</span></button><h1>{title}</h1></header>
    <iframe className="activity-frame" src={site.activityUrls[type]} title={title} allow="fullscreen"/>
  </main>
}
