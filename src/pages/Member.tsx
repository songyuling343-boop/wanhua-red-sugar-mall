import { Link } from 'react-router-dom'
import { Heart, Gift, Sparkles, PackageCheck, Ticket, CalendarCheck, Coins, Crown, ArrowUpRight } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useMember } from '../context/MemberContext'
import { useOrders } from '../context/OrderContext'
import { products } from '../data/products'
import { levels,memberConfig } from '../data/member'
import { Header, ProductCard, SectionTitle } from '../components/ShopUI'
import { IpSprite, MemberNotice, PersonalityCard, QuizRewardCard } from '../components/MemberUI'
const entries=[{to:'/orders',label:'我的订单',icon:PackageCheck},{to:'/member/favorites',label:'我的收藏',icon:Heart},{to:'/member/coupons',label:'我的优惠券',icon:Ticket},{to:'/member/sign',label:'每日签到',icon:CalendarCheck},{to:'/member/points',label:'我的积分',icon:Coins},{to:'/member/blindbox',label:'我的盲盒',icon:Gift},{to:'/member/benefits',label:'会员权益',icon:Crown},{to:'/member/activities',label:'活动中心',icon:Sparkles}]
export default function Member(){
  const {favorites}=useShop(),{state,level,today,sign}=useMember(),{notify}=useShop(),{orders}=useOrders()
  const next=levels.find(l=>l.threshold>state.growth),progress=next?Math.min(100,(state.growth-level.threshold)/(next.threshold-level.threshold)*100):100
  const saved=products.filter(p=>favorites.includes(p.id))
  return <><Header title="我的甜蜜日常"/><main className="member-page member-upgraded"><section className={`membership-card ${level.className}`}><div className="member-identity"><IpSprite className="member-avatar"/><div><span>万巧巧欢迎你</span><h1>{memberConfig.nickname}</h1><small>本地演示会员 · 无需登录</small></div><IpSprite pose="cane" className="member-welcome-ip"/></div><div className="member-tier"><Crown size={15}/><strong>{level.name}</strong><Link to="/member/benefits">查看权益<ArrowUpRight size={12}/></Link></div><div className="member-stats"><Link to="/member/points"><strong data-testid="member-points">{state.points}</strong><span>可用积分</span></Link><div><strong data-testid="member-growth">{state.growth}</strong><span>累计成长值</span></div><Link to="/member/blindbox"><strong>{state.blindboxCollection.length}/6</strong><span>盲盒收藏</span></Link></div><div className="growth-caption"><span>{next?`距离${next.name}还差 ${next.threshold-state.growth} 成长值`:'已达最高等级，继续收集甜蜜'}</span><small>{next?`${state.growth} / ${next.threshold}`:'臻享满格'}</small></div><div className="growth-track" role="progressbar" aria-label="会员成长进度" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${progress}%`}}/></div></section><MemberNotice/>
    <div className="member-shortcuts">{entries.map(({to,label,icon:Icon})=><Link key={to} to={to}><span><Icon size={22}/></span><strong>{label}</strong></Link>)}</div>
    <section className="member-sign-strip"><CalendarCheck size={25}/><div><strong>给每天的甜蜜，盖个章</strong><p>每日签到 +5积分，不增加成长值</p></div><button disabled={state.signedDates.includes(today)} onClick={()=>{try{sign()}catch(e){notify((e as Error).message)}}}>{state.signedDates.includes(today)?'今日已签到':'立即签到'}</button></section>
    <Link className="member-orders-entry" to="/orders"><span className="member-order-icon"><PackageCheck size={25}/></span><div><strong>我的订单</strong><small>{orders.length?`${orders.length} 笔甜蜜记录`:'开启一次甜蜜下单体验'}</small></div><span>全部订单</span><ArrowUpRight size={16}/></Link>
    <QuizRewardCard/><PersonalityCard/>
    <section className="member-favorites-preview"><SectionTitle title={`我的收藏 · ${saved.length}`} english="MY SWEET FAVORITES" to="/member/favorites"/>{saved.length?<div className="product-grid">{saved.slice(0,2).map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="favorites-empty"><Heart size={25}/><p>点击商品上的爱心，把喜欢留在这里。</p><Link to="/category">去发现喜欢<ArrowUpRight size={14}/></Link></div>}</section>
    <Link className="member-blind-teaser" to="/member/blindbox"><IpSprite pose="scroll"/><div><span className="eyebrow">WAN QIAOQIAO CLUB</span><h2>六份甜蜜，等你收集</h2><p>100积分开启一次收藏抽取</p><strong>进入万巧巧盲盒中心 →</strong></div></Link><p className="member-notice">积分用于兑换，成长值用于升级，兑换积分不会降低会员等级。</p><Link className="demo-settings-link" to="/member/demo">{memberConfig.version}</Link>
  </main></>
}
