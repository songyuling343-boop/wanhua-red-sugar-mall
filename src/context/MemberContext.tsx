import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { blindCharacters, demoActions, levelFor, levels, memberConfig, personalities } from '../data/member'
import { useDayKey } from '../hooks/useDayKey'
import { couponStatus, dayKey, initialMember, issueCoupon, recordPoints, restoreMember } from '../utils/member'
import type { MemberCoupon, MemberState } from '../utils/member'
import { readStorage, writeStorage } from '../utils/storage'
import { uniqueId } from '../utils/orders'
type PaidOrder = { orderId:string; createdAt:string; finalAmount:number; discountAmount:number; couponId:string|null; couponInstanceId?:string|null }
type Reward = { title:string; points:number; growth:number; upgrade?:string; characterId?:string; duplicate?:boolean }
type Member = {
  state:MemberState; today:string; level:typeof levels[number]; reward:Reward|null; error:string;
  dismissReward:()=>void; visitActivity:(type:'quiz'|'blindbox')=>void; claimQuiz:()=>void; sign:()=>void;
  choosePersonality:(id:string)=>void; draw:()=>void; exchangeCoupon:(kindId:string)=>void;
  availableCoupons:()=>MemberCoupon[]; settleOrders:(orders:PaidOrder[])=>void;
  resetDemo:(action:string,existingOrderIds:string[])=>void;
}
const Context=createContext<Member|null>(null)
export function MemberProvider({children}:{children:ReactNode}){
  const [state,setState]=useState(()=>restoreMember(readStorage<unknown>(memberConfig.storage,null)))
  const ref=useRef(state), [reward,setReward]=useState<Reward|null>(null), [error,setError]=useState(''), today=useDayKey()
  const mutate=useCallback((action:(next:MemberState)=>Reward|boolean|undefined,animate=true)=>{
    const latest=restoreMember(readStorage<unknown>(memberConfig.storage,ref.current))
    const next=structuredClone(latest),result=action(next)
    if(result===false){ref.current=latest;setState(latest);return}
    if(!writeStorage(memberConfig.storage,next))throw new Error('会员数据未能保存，请允许浏览器本地存储后重试')
    const before=levelFor(latest.growth),after=levelFor(next.growth)
    ref.current=next;setState(next);setError('')
    if(animate&&typeof result==='object')setReward({...result,upgrade:after.threshold>before.threshold?after.name:undefined})
  },[])
  useEffect(()=>{if(readStorage<unknown>(memberConfig.storage,null)===null)writeStorage(memberConfig.storage,ref.current)},[])
  const availableCoupons=useCallback(()=>restoreMember(readStorage<unknown>(memberConfig.storage,ref.current)).coupons.filter(c=>couponStatus(c)==='available'),[])
  const visitActivity=useCallback((type:'quiz'|'blindbox')=>mutate(next=>{
    if(type==='quiz'){if(next.quizVisited)return false;next.quizVisited=true;return true}
    if(next.blindboxVisitRewardClaimed)return false
    next.blindboxVisitRewardClaimed=true;recordPoints(next,'首次访问万巧巧盲盒活动',memberConfig.rewards.blindVisitPoints,0,'blind-visit')
    return true
  },false),[mutate])
  const claimQuiz=useCallback(()=>mutate(next=>{
    if(!next.quizVisited)throw new Error('请先从商城进入红糖属性测试')
    if(next.quizRewardClaimed)throw new Error('首次测试奖励已领取')
    next.quizRewardClaimed=true;recordPoints(next,'首次完成红糖属性测试',memberConfig.rewards.quizPoints,memberConfig.rewards.quizGrowth,'quiz')
    return {title:'甜蜜属性奖励到账',points:memberConfig.rewards.quizPoints,growth:memberConfig.rewards.quizGrowth}
  }),[mutate])
  const sign=useCallback(()=>mutate(next=>{
    const date=dayKey();if(next.signedDates.includes(date))throw new Error('今日已签到，明天再来收一份甜')
    next.signedDates.push(date);recordPoints(next,'每日签到',memberConfig.rewards.signPoints,0,`sign:${date}`)
    return {title:'签到成功，今天也甜甜的',points:memberConfig.rewards.signPoints,growth:0}
  }),[mutate])
  const choosePersonality=useCallback((id:string)=>mutate(next=>{if(!personalities.some(p=>p.id===id))throw new Error('请选择一个演示属性');next.sugarPersonality=id;return true},false),[mutate])
  const draw=useCallback(()=>mutate(next=>{
    if(next.points<memberConfig.blindboxCost)throw new Error('积分不足100，先去签到或挑选好糖吧')
    const total=blindCharacters.reduce((sum,c)=>sum+c.weight,0)
    const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);let roll=bytes[0]/4294967296*total
    const character=blindCharacters.find(c=>{roll-=c.weight;return roll<0})||blindCharacters[0]
    const duplicate=next.blindboxCollection.includes(character.id)
    if(!duplicate)next.blindboxCollection.push(character.id)
    next.draws.unshift({id:uniqueId(),characterId:character.id,createdAt:new Date().toISOString(),duplicate})
    recordPoints(next,'万巧巧收藏抽取',-memberConfig.blindboxCost,0,'draw:'+next.draws[0].id)
    return {title:duplicate?'获得重复款，也是一份甜':'解锁新朋友！',points:-memberConfig.blindboxCost,growth:0,characterId:character.id,duplicate}
  }),[mutate])
  const exchangeCoupon=useCallback((kindId:string)=>mutate(next=>{
    const rule=memberConfig.couponRules.find(c=>c.id===kindId),cost=memberConfig.couponCosts[kindId]
    if(!rule||!cost)throw new Error('兑换券不存在')
    if(next.points<cost)throw new Error('积分不足，先去积攒甜蜜吧')
    const coupon=issueCoupon(kindId,'积分兑换');next.coupons.push(coupon)
    recordPoints(next,'积分兑换优惠券 · '+rule.title,-cost,0,'coupon:'+coupon.id)
    return {title:'兑换成功，优惠券已存入券包',points:-cost,growth:0}
  }),[mutate])
  const settleOrders=useCallback((orders:PaidOrder[])=>{
    try{mutate(next=>{
      let changed=false
      for(const order of [...orders].sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt))){
        if(Object.prototype.hasOwnProperty.call(next.orderRewards,order.orderId))continue
        const previousLevel=levelFor(next.growth)
        const base=Math.floor(Math.round(order.finalAmount*100)/100),first=!next.firstOrderRewardClaimed
        recordPoints(next,'商城购物',base,base,'order:'+order.orderId)
        if(first)recordPoints(next,'首次完成订单额外奖励',memberConfig.rewards.firstOrderPoints,memberConfig.rewards.firstOrderGrowth,'first-order:'+order.orderId)
        next.firstOrderRewardClaimed=true;next.orderRewards[order.orderId]={points:base+(first?memberConfig.rewards.firstOrderPoints:0),growth:base+(first?memberConfig.rewards.firstOrderGrowth:0),upgrade:levelFor(next.growth).threshold>previousLevel.threshold?levelFor(next.growth).name:undefined}
        const coupon=next.coupons.find(c=>c.id===(order.couponInstanceId||order.couponId))
        if(coupon&&order.discountAmount!==0){coupon.status='used';coupon.usedOrderId=order.orderId}
        changed=true
      }
      return changed
    },false)}catch(e){setError((e as Error).message);throw e}
  },[mutate])
  const resetDemo=useCallback((action:string,existingOrderIds:string[])=>mutate(next=>{
    if(!demoActions.some(a=>a.id===action))throw new Error('演示设置无效')
    if(action==='reset-account'||action==='restore'){
      Object.assign(next,initialMember());next.orderRewards=Object.fromEntries(existingOrderIds.map(id=>[id,{points:0,growth:0}]))
    }else if(action==='points')recordPoints(next,'演示设置：恢复默认积分',memberConfig.initialPoints-next.points)
    else if(action.startsWith('level-'))next.growth=levels.find(l=>`level-${l.id}`===action)!.threshold
    else if(action==='signs')next.signedDates=[]
    else if(action==='collection'){next.blindboxCollection=[];next.draws=[]}
    else if(action==='quiz'){next.quizVisited=false;next.quizRewardClaimed=false}
    return true
  },false),[mutate])
  return <Context.Provider value={{state,today,level:levelFor(state.growth),reward,error,dismissReward:()=>setReward(null),visitActivity,claimQuiz,sign,choosePersonality,draw,exchangeCoupon,availableCoupons,settleOrders,resetDemo}}>{children}</Context.Provider>
}
export function useMember(){const value=useContext(Context);if(!value)throw new Error('MemberProvider missing');return value}
