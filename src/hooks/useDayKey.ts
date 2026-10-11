import { useEffect, useState } from 'react'
import { dayKey } from '../utils/member'
export function useDayKey(){
  const [today,setToday]=useState(dayKey)
  useEffect(()=>{const update=()=>setToday(dayKey());const timer=setInterval(update,30000);window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);return()=>{clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update)}},[])
  return today
}
