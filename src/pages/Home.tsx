import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Gift, Leaf, Sparkles, Flame, Coffee } from 'lucide-react'
import { brands, culture, site } from '../data/site'
import { homeSections, newArrivals, products } from '../data/products'
import { useMember } from '../context/MemberContext'
import { IpSprite, QuizRewardCard } from '../components/MemberUI'
import { Header, IpPortrait, PriceNotice, ProductCard, SectionTitle } from '../components/ShopUI'
const slides = [
  { eyebrow:'FROM QIAOJIA, WITH LOVE',title:<>甜从巧家来<br/>好糖慢慢熬</>,description:'一碗蔗香，一份来自云南的心意。',action:'遇见巧家的甜',className:'culture-slide',to:'/story',image:'/images/qiaojia-gift.jpeg' },
  { eyebrow:'FIND YOUR SWEET SIDE',title:<>测测你的红糖属性</>,description:'看看你是哪一种甜',action:'立即测试',className:'quiz-slide',href:site.links.quiz },
  { eyebrow:'WAN QIAOQIAO CLUB',title:<>万巧巧<br/>惊喜盲盒</>,description:'收集属于你的甜蜜搭子',action:'去拆甜蜜盲盒',className:'blindbox-slide',href:site.links.blindbox },
]
function Banner() {
  const [index,setIndex]=useState(0); const [paused,setPaused]=useState(false); const [touch,setTouch]=useState<number | null>(null)
  useEffect(() => {if(paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),6500);return()=>clearInterval(timer)},[paused])
  const slide=slides[index]; const change=(amount:number)=>setIndex(i=>(i+amount+slides.length)%slides.length)
  return <section className={`hero-banner ${slide.className}`} aria-label="商城活动轮播" aria-roledescription="轮播" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} onTouchStart={e=>setTouch(e.touches[0].clientX)} onTouchEnd={e=>{if(touch!==null && Math.abs(e.changedTouches[0].clientX-touch)>40)change(e.changedTouches[0].clientX<touch?1:-1);setTouch(null)}}>
    <div className="hero-copy" key={index}><span className="eyebrow">{slide.eyebrow}</span><h1>{slide.title}</h1><p>{slide.description}</p>{slide.to ? <Link className="hero-link" to={slide.to}>{slide.action}<ArrowRight size={15}/></Link> : <a className="hero-link" href={slide.href} target="_blank" rel="noopener noreferrer" title={site.activityNotice}>{slide.action}<ArrowUpRight size={15}/></a>}</div>
    {slide.image ? <div className="hero-product"><img src={slide.image} alt="遇见巧家伴手礼企业产品展示图"/><span>巧家风物 · 一份心意</span></div> : <IpPortrait className="hero-ip"/>}<span className="hero-watermark">甜</span>
    <div className="slider-controls"><button aria-label="上一张 Banner" onClick={()=>change(-1)}><ChevronLeft size={14}/></button><div className="slider-dots">{slides.map((s,i)=><button key={s.className} className={index===i?'selected':''} onClick={()=>setIndex(i)} aria-label={`切换到第${i+1}张 Banner`} aria-pressed={index===i}/>)}</div><span className="slide-count">0{index+1} / 03</span><button aria-label="下一张 Banner" onClick={()=>change(1)}><ChevronRight size={14}/></button></div>
  </section>
}
export default function Home() {
  const {state:member}=useMember()
  return <><Header/><main className="home-page"><div className="home-intro"><span><i/> 云南巧家 · 蔗香日常</span><span>让每一天，都有一点甜</span></div>
    <div className="home-welcome"><span className="eyebrow">LET THE TRADITION FEEL YOUNG</span><h1>让传统红糖，<br/>也有年轻表达。</h1><p>今天也要甜甜的呀！</p><IpSprite pose="main" className="home-welcome-ip"/><span className="home-welcome-seal">巧家<br/>来甜</span></div>
    <Banner/><p className="external-activity-note">{site.activityNotice}</p>
    <div className="welcome-strip"><IpPortrait/><div><strong>今天也要甜甜的呀！</strong><p>万巧巧陪你挑一份属于自己的甜。</p></div><Sparkles size={19}/></div>
    {member.quizVisited&&!member.quizRewardClaimed&&<QuizRewardCard/>}
    <section className="brand-section"><SectionTitle title="四种相遇，一样甜蜜" english="CHOOSE YOUR SWEET"/><div className="brand-grid">{brands.map((brand,i)=><Link key={brand.id} to={`/category?brand=${brand.id}`} className={`brand-card ${brand.className}`}><span className="brand-number">0{i+1}</span><span className="brand-symbol">{i===0?'韵':i===1?'甜':'呵'}</span><strong>{brand.name}</strong><small>{brand.english}</small><p>{brand.description}</p><ArrowUpRight size={17}/></Link>)}<a href={site.links.blindbox} target="_blank" rel="noopener noreferrer" title={site.activityNotice} className="brand-card blindbox"><span className="brand-number">04</span><Gift className="brand-gift" size={38}/><strong>万巧巧盲盒系列</strong><small>WAN QIAOQIAO CLUB</small><p>打开一盒，收获一份惊喜</p><ArrowUpRight size={17}/></a></div><p className="subtle-note">万巧巧盲盒为 IP 互动衍生系列</p></section>
    <section className="home-products"><SectionTitle {...homeSections[0]} to="/category"/><PriceNotice/><div className="product-grid">{products.filter(p=>p.groups.includes('recommend')).slice(0,4).map(p=><ProductCard product={p} key={p.id}/>)}</div></section>
    <section className="activity-section"><SectionTitle title="甜蜜不止一种玩法" subtitle="和万巧巧一起，把日常变有趣" english="SWEET LITTLE MOMENTS"/><p className="external-activity-note">{site.activityNotice}</p><a href={site.links.quiz} target="_blank" rel="noopener noreferrer" title={site.activityNotice} className="activity-card quiz"><Sparkles size={26}/><div><span>红糖属性测试</span><p>你是哪种甜？一测就知道</p></div><ArrowUpRight size={20}/></a><a href={site.links.blindbox} target="_blank" rel="noopener noreferrer" title={site.activityNotice} className="activity-card box"><Gift size={26}/><div><span>万巧巧盲盒</span><p>今天的小惊喜，等你亲手打开</p></div><ArrowUpRight size={20}/></a></section>
    <section className="home-products"><SectionTitle {...homeSections[1]} to="/category?group=popular"/><div className="product-grid">{products.filter(p=>p.groups.includes('popular')).slice(0,4).map(p=><ProductCard product={p} key={p.id}/>)}</div></section>
    <section className="new-section"><SectionTitle title="新品专区" subtitle="企业新品灵感 · 敬请期待" english="SOMETHING NEW"/><div className="new-grid">{newArrivals.map((item,i)=><div key={item.name} className="new-card">{i===0?<Coffee size={32}/>:<Leaf size={32}/>}<span className="mini-tag">新品预告</span><h3>{item.name}</h3><p>{item.description}</p><small>{item.note}</small></div>)}</div></section>
    {homeSections.slice(2).map(section=><section className="home-products" key={section.id}><SectionTitle {...section} to={`/category?group=${section.id}`}/><div className="product-grid">{products.filter(p=>p.groups.includes(section.id)).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>)}
    <section className="culture-section"><span className="eyebrow">THE STORY BEHIND THE SWEET</span><div className="culture-seal">巧家<br/>风物</div><h2>{culture.title}</h2><p>{culture.text}</p><div className="culture-values"><span><Leaf size={17}/>金沙江河谷</span><span><Flame size={17}/>柴火慢熬</span><span><Gift size={17}/>小碗成糖</span></div><blockquote>{culture.motto}</blockquote><Link to="/story" className="culture-story-link">读一读巧家的红糖故事<ArrowUpRight size={16}/></Link><details><summary>认识万华的三个品牌<ChevronRight size={15}/></summary><img src={site.assets.brands} alt="金沙唐韵、呵糖、上古·红糖公主干净版品牌展示图" loading="lazy"/><p className="subtle-note">企业提供的三子品牌干净版展示资料</p></details></section>
    <footer className="site-footer"><div className="footer-links"><Link to="/story">品牌故事</Link><Link to="/guide">演示指南</Link></div><img src={site.assets.logo} alt="万华官方 Logo"/><strong>{site.name}</strong><p>{site.demoNotice}</p><PriceNotice/><span>一份来自巧家的甜，愿你慢慢喜欢。</span></footer>
  </main></>
}
