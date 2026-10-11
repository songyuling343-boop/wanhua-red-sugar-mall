import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles, ArrowUpRight, LockKeyhole, Check } from 'lucide-react'
import { useMember } from '../context/MemberContext'
import { useShop } from '../context/ShopContext'
import { blindCharacters, personalities } from '../data/member'
import { products } from '../data/products'
import { site } from '../data/site'
import { ProductCard, SectionTitle } from './ShopUI'
export function MemberNotice(){return <p className="member-notice">比赛会员互动演示 · 积分与权益均为策划方案</p>}
const poses:Record<string,{x:number;y:number;size:number}>={main:{x:5,y:30,size:720},cane:{x:620,y:10,size:350},tray:{x:1260,y:340,size:370},scroll:{x:620,y:335,size:370},drink:{x:960,y:335,size:350},gold:{x:1245,y:625,size:390}}
export function IpSprite({pose='main',className=''}:{pose?:string;className?:string}){
  const rect=poses[pose]||poses.main
  return <div className={`ip-sprite ${className}`}><img src={site.assets.ip} alt={`万巧巧${pose==='scroll'?'卷轴':pose==='drink'?'饮品':pose==='tray'?'托盘':'欢迎'}姿态`} style={{width:`${1672/rect.size*100}%`,left:`${-rect.x/rect.size*100}%`,top:`${-rect.y/rect.size*100}%`}}/></div>
}
export function Dialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
  const ref=useRef<HTMLDivElement>(null), close=useRef(onClose);close.current=onClose
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow
    document.body.style.overflow='hidden';ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
    function keys(e:KeyboardEvent){if(e.key==='Escape')close.current();if(e.key==='Tab'){const els=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]');if(!els?.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
    document.addEventListener('keydown',keys);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keys);previous?.focus()}
  },[])
  return <div className="modal-backdrop"><div className="member-dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref}><button className="modal-close icon-button" aria-label="关闭弹窗" onClick={onClose}><X size={18}/></button>{children}</div></div>
}
export function MemberReward(){
  const {reward,dismissReward}=useMember()
  if(!reward)return null
  const character=blindCharacters.find(c=>c.id===reward.characterId)
  return <Dialog title="会员互动奖励" onClose={dismissReward}><span className="eyebrow">A SWEET LITTLE REWARD</span>{character?<IpSprite pose={character.pose}/>:<><IpSprite pose={reward.upgrade?'gold':'cane'} className="reward-ip"/><div className="reward-spark"><Sparkles size={24}/></div></>}<h2>{reward.title}</h2>{character&&<><strong className="draw-character-name">{character.name}</strong><span className="draw-rarity">{character.rarity}</span><p>{character.caption}</p><p>{reward.duplicate?'获得重复款，收集进度不变':'已存入你的盲盒收藏'}</p></>}{(reward.points!==0||reward.growth>0)&&<div className="reward-values"><strong>{reward.points>=0?'+':''}{reward.points}<small>积分</small></strong>{reward.growth>0&&<strong>+{reward.growth}<small>成长值</small></strong>}</div>}{reward.upgrade&&<p className="upgrade-announcement"><span className="upgrade-medal">✦</span>你已成为 {reward.upgrade}</p>}<p className="member-notice">比赛演示互动 · 无现金交易</p><button className="primary-button" onClick={dismissReward}>{character?'收好这份甜':'开心收下'}</button></Dialog>
}
export function QuizRewardCard(){
  const {state,claimQuiz}=useMember(),{notify}=useShop()
  return <section className="quiz-reward-card"><span className="eyebrow">FIND YOUR SWEET SIDE</span><h2>发现藏在甜蜜里的你</h2><p>首次完成红糖属性测试，领取 20 积分与 10 成长值。</p><a className="quiz-enter-link" href={site.links.quiz} target="_blank" rel="noopener noreferrer" title={site.activityNotice}>进入红糖属性测试<ArrowUpRight size={15}/></a><small>{site.activityNotice}</small><button className="primary-button" disabled={!state.quizVisited||state.quizRewardClaimed} onClick={()=>{try{claimQuiz()}catch(e){notify((e as Error).message)}}}>{state.quizRewardClaimed?'测试奖励已领取':'我已完成测试，领取20积分'}</button><small>{!state.quizVisited?'请先从商城进入测试，再回来手动确认。':'比赛演示联动奖励 · 完成状态由你手动确认'}</small><small>商城未读取外部测试结果，也未实时同步。</small></section>
}
export function PersonalityCard(){
  const {state,choosePersonality}=useMember(),{notify}=useShop()
  const personality=personalities.find(p=>p.id===state.sugarPersonality)
  return <section className="personality-section"><SectionTitle title="我的红糖属性" subtitle="手动选择演示结果，发现你的甜蜜偏好" english="YOUR SUGAR PERSONALITY"/><div className="personality-options">{personalities.map(p=><button key={p.id} className={p.id===state.sugarPersonality?'active':''} aria-pressed={p.id===state.sugarPersonality} onClick={()=>{try{choosePersonality(p.id)}catch(e){notify((e as Error).message)}}}><span>{p.emoji}</span><strong>{p.name}</strong><small>{p.caption}</small>{p.id===state.sugarPersonality&&<Check size={12}/>}</button>)}</div><a href={site.links.quiz} target="_blank" rel="noopener noreferrer" title={site.activityNotice} className="personality-retest">重新去测试<ArrowUpRight size={14}/></a><p className="external-activity-note">{site.activityNotice}</p><p className="member-notice">比赛策划推荐，与真实测试结果无自动关联，不涉及医学功效。</p>{personality&&<><p className="personality-description">{personality.description}</p><div className="product-grid">{personality.products.slice(0,2).map(id=>{const p=products.find(p=>p.id===id);return p?<ProductCard key={id} product={p}/>:null})}</div></>}</section>
}
export function LockedCharacter({id}:{id:string}){
  const {state}=useMember(),character=blindCharacters.find(c=>c.id===id)!,unlocked=state.blindboxCollection.includes(id)
  return <article className={`collection-card ${unlocked?'unlocked':'locked'} ${character.id==='gold'?'gold-card':''}`}><span className="collection-rarity">{character.rarity}</span><IpSprite pose={character.pose}/>{!unlocked&&<span className="collection-lock"><LockKeyhole size={22}/></span>}<h3>{character.name}</h3><p>{unlocked?'已解锁':'未解锁'}</p></article>
}
export function MemberWayBack(){return <Link className="text-link member-way-back" to="/member">返回会员中心</Link>}
