import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Header, SectionTitle } from '../components/ShopUI'
import { IpSprite } from '../components/MemberUI'
import { demoGuide } from '../data/demo'
export default function DemoGuide() {
  return <><Header title="跟着万巧巧逛一逛" back/><main className="guide-page"><section className="guide-hero"><IpSprite pose="tray"/><span className="eyebrow">A LITTLE SWEET JOURNEY</span><h1>一份甜，六种新体验</h1><p>趣味测试 → 挑选好糖 → 模拟下单<br/>积分成长 → IP互动 → 再次相遇</p><span className="guide-demo-badge">比赛互动演示版</span></section><SectionTitle title="用几分钟，体验甜蜜闭环" english="YOUR SWEET DEMO ROUTE"/><ol className="guide-steps">{demoGuide.map((step,i)=><li key={step.to}><span>0{i+1}</span><div><h2>{step.title}</h2><p>{step.text}</p><Link to={step.to}>{step.action}<ArrowUpRight size={14}/></Link></div></li>)}</ol><div className="guide-notice"><h2>这一份甜，留在你的浏览器里</h2><p>演示数据仅保存在本机。无需登录、真实支付或真实收货信息。测试结果不自动同步；商品参考价、积分规则和会员权益均为比赛策划展示。</p></div><Link to="/" className="primary-button guide-start">开始甜蜜旅程<ArrowUpRight size={16}/></Link></main></>
}
