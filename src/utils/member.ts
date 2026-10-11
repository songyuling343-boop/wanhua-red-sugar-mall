import { memberConfig,blindCharacters,personalities } from '../data/member'
import { uniqueId } from './orders'
export type PointEntry = { id:string; source:string; delta:number; growthDelta:number; createdAt:string; balance:number; eventKey:string }
export type MemberCoupon = { id:string; kindId:string; source:string; createdAt:string; expiresAt:string; status:'available'|'used'|'expired'; usedOrderId?:string }
export type DrawRecord = { id:string; characterId:string; createdAt:string; duplicate:boolean }
export type MemberState = {
  points:number; growth:number; signedDates:string[]; quizVisited:boolean; quizRewardClaimed:boolean;
  blindboxVisitRewardClaimed:boolean; blindboxCollection:string[]; draws:DrawRecord[];
  pointHistory:PointEntry[]; coupons:MemberCoupon[]; sugarPersonality:string|null;
  firstOrderRewardClaimed:boolean; orderRewards:Record<string,{points:number;growth:number;upgrade?:string}>;
}
export function dayKey(date = new Date()) {
  const parts=new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date)
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type)?.value).join('-')
}
export const couponStatus = (coupon:MemberCoupon) => coupon.status === 'used' ? 'used' : coupon.status==='expired'||Date.parse(coupon.expiresAt)<=Date.now() ? 'expired' : 'available'
export function issueCoupon(kindId:string,source:string,id:string=uniqueId()):MemberCoupon {
  const now=new Date()
  return {id,kindId,source,createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+memberConfig.couponValidityDays*86400000).toISOString(),status:'available'}
}
export function initialMember():MemberState {
  const now=new Date().toISOString()
  const expired=issueCoupon('sweet-5','过期状态展示','expired-example');expired.status='expired';expired.expiresAt=new Date(Date.now()-86400000).toISOString()
  return { points:memberConfig.initialPoints,growth:0,signedDates:[],quizVisited:false,quizRewardClaimed:false,blindboxVisitRewardClaimed:false,blindboxCollection:[],draws:[],pointHistory:[{id:uniqueId(),source:'初始演示积分',delta:memberConfig.initialPoints,growthDelta:0,createdAt:now,balance:memberConfig.initialPoints,eventKey:'initial'}],coupons:[...memberConfig.couponRules.map(rule=>issueCoupon(rule.id,'初始演示券',rule.id)),expired],sugarPersonality:null,firstOrderRewardClaimed:false,orderRewards:{} }
}
export function recordPoints(state:MemberState,source:string,delta:number,growthDelta=0,eventKey:string=uniqueId()) {
  state.points+=delta;state.growth+=growthDelta
  state.pointHistory.unshift({id:uniqueId(),source,delta,growthDelta,createdAt:new Date().toISOString(),balance:state.points,eventKey})
}
export function restoreMember(raw:unknown):MemberState {
  const initial=initialMember()
  if(!raw||typeof raw!=='object')return initial
  const r=raw as Partial<MemberState>
  if(!Number.isInteger(r.points)||r.points!<0||!Number.isInteger(r.growth)||r.growth!<0)return initial
  const strings=(v:unknown):string[]=>Array.isArray(v)?v.filter((s):s is string=>typeof s==='string'):[]
  const validCoupon=(c:MemberCoupon)=>c&&typeof c.id==='string'&&memberConfig.couponRules.some(rule=>rule.id===c.kindId)&&typeof c.source==='string'&&!isNaN(Date.parse(c.createdAt))&&!isNaN(Date.parse(c.expiresAt))&&['available','used','expired'].includes(c.status)
  const history=Array.isArray(r.pointHistory)?r.pointHistory.filter(p=>p&&typeof p.source==='string'&&typeof p.id==='string'&&Number.isInteger(p.delta)&&Number.isInteger(p.balance)&&p.balance>=0&&Number.isInteger(p.growthDelta)&&!isNaN(Date.parse(p.createdAt))):[]
  const orderRewards:MemberState['orderRewards']={}
  if(r.orderRewards&&typeof r.orderRewards==='object')for(const [id,v] of Object.entries(r.orderRewards))if(v&&Number.isInteger(v.points)&&v.points>=0&&Number.isInteger(v.growth)&&v.growth>=0)orderRewards[id]=v
  return {...initial,points:r.points!,growth:r.growth!,signedDates:[...new Set(strings(r.signedDates).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)))],quizVisited:r.quizVisited===true,quizRewardClaimed:r.quizRewardClaimed===true,blindboxVisitRewardClaimed:r.blindboxVisitRewardClaimed===true,blindboxCollection:[...new Set(strings(r.blindboxCollection).filter(id=>blindCharacters.some(c=>c.id===id)))],draws:Array.isArray(r.draws)?r.draws.filter(d=>d&&typeof d.characterId==='string'&&typeof d.id==='string'&&typeof d.duplicate==='boolean'&&!isNaN(Date.parse(d.createdAt))):[],pointHistory:history,coupons:Array.isArray(r.coupons)?r.coupons.filter(validCoupon):initial.coupons,sugarPersonality:personalities.some(p=>p.id===r.sugarPersonality)?r.sugarPersonality!:null,firstOrderRewardClaimed:r.firstOrderRewardClaimed===true,orderRewards}
}
