import { useEffect } from 'react'
import { useMember } from '../context/MemberContext'
import { useShop } from '../context/ShopContext'
import { site } from '../data/site'
export default function ExternalActivityTracker(){
  const {visitActivity}=useMember(),{notify}=useShop()
  useEffect(()=>{
    function click(event:MouseEvent){
      const link=(event.target as Element|null)?.closest<HTMLAnchorElement>('a[href]')
      if(!link)return
      const type=new URL(link.href).pathname===site.links.quiz?'quiz':new URL(link.href).pathname===site.links.blindbox?'blindbox':null
      if(!type)return
      try{visitActivity(type)}catch(e){event.preventDefault();notify((e as Error).message)}
    }
    document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true)
  },[visitActivity,notify])
  return null
}
