import { useEffect, useRef } from 'react'
import { homePoses } from '../data/homePoses'

export default function GuideModel() {
  const portrait = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = portrait.current
    const link = canvas?.closest('a')
    const ctx = canvas?.getContext('2d')
    if (!link || !canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let grip: { id: number; x: number; y: number; left: number; top: number } | null = null
    let moved = false
    let placed = false
    let hovering = false
    let lean = 0
    function place(x: number, y: number) {
      if (!link) return
      const left = Math.max(0, Math.min(x, document.documentElement.clientWidth - link.offsetWidth))
      const top = Math.max(0, Math.min(y, window.innerHeight - link.offsetHeight))
      Object.assign(link.style, {left: left+'px', top: top+'px', right:'auto', bottom:'auto'})
      placed = true
    }
    function down(e: PointerEvent) {
      if (!link || !e.isPrimary || e.button !== 0) return
      const rect = link.getBoundingClientRect()
      moved = false
      grip = {id:e.pointerId, x:e.clientX, y:e.clientY, left:rect.left, top:rect.top}
      link.setPointerCapture(e.pointerId)
    }
    function move(e: PointerEvent) {
      if (!grip || grip.id !== e.pointerId) return
      const dx = e.clientX-grip.x, dy = e.clientY-grip.y
      if (!moved && Math.hypot(dx,dy)<5) return
      moved = true
      place(grip.left+dx,grip.top+dy)
    }
    function end(e: PointerEvent) {
      if (grip?.id !== e.pointerId) return
      grip = null
      if (link?.hasPointerCapture(e.pointerId)) link.releasePointerCapture(e.pointerId)
    }
    function click(e: MouseEvent) {
      if (moved && e.detail !== 0) e.preventDefault()
      moved = false
    }
    function resize() {
      if (!placed || !link) return
      const rect = link.getBoundingClientRect()
      place(rect.left,rect.top)
    }
    const enter = () => { hovering = true }
    const leave = () => { hovering = false }
    const stopDrag = (e: DragEvent) => e.preventDefault()
    link.style.touchAction='none'
    link.style.userSelect='none'
    link.style.cursor='grab'
    link.draggable=false
    link.addEventListener('pointerdown',down)
    link.addEventListener('pointermove',move)
    link.addEventListener('pointerup',end)
    link.addEventListener('pointercancel',end)
    link.addEventListener('lostpointercapture',end)
    link.addEventListener('click',click)
    link.addEventListener('dragstart',stopDrag)
    link.addEventListener('pointerenter',enter)
    link.addEventListener('pointerleave',leave)
    window.addEventListener('resize',resize)

    // Deform narrow strips of the original artwork so the sugar and ribbon keep their texture.
    const art = new Image()
    const size = 302
    const hand = document.createElement('canvas')
    const face = document.createElement('canvas')
    for (const layer of [hand, face]) {layer.width=size;layer.height=300}
    let frame = 0, last = -100
    const smooth = (x:number) => {const v=Math.max(0,Math.min(1,x)); return v*v*(3-2*v)}
    function draw(ms:number) {
      if (!ctx || !canvas) return
      frame=requestAnimationFrame(draw)
      if (ms-last<50) return
      last=ms
      const time=reduced.matches?0:ms/1000
      lean += ((hovering && !reduced.matches && !grip?1:0)-lean)*.22
      const blink=Math.max(0,1-Math.abs(time%4.6-3.6)/.15)
      const phase=time%7.2
      const wave=phase<2?Math.sin(Math.PI*phase/2)**2*(20+12*Math.sin(phase*13)):0
      const h=hand.getContext('2d')!, f=face.getContext('2d')!
      h.clearRect(0,0,size,300)
      h.drawImage(art,0,0)
      // Raise the outer hand only. The displacement fades at the wrist.
      if(wave>0){
        h.clearRect(249,190,53,72)
        for(let x=249;x<size;x++) {
          const lift=wave*smooth((x-249)/38)
          h.drawImage(art,x,190,1,72,x,190-lift,1,72)
        }
      }
      f.clearRect(0,0,size,300)
      f.drawImage(hand,0,0)
      for(const eye of [129,215]){
        if(blink<=0) break
        for(let x=eye-23;x<=eye+23;x++){
          const amount=blink*smooth((23-Math.abs(x-eye))/7)
          const half=20*(1-.93*amount)
          const cy=170, top=143, bottom=196
          f.drawImage(hand,x,top,1,7,x,top,1,cy-half-top)
          f.drawImage(hand,x,150,1,40,x,cy-half,1,2*half)
          f.drawImage(hand,x,190,1,6,x,cy+half,1,bottom-cy-half)
        }
      }
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.save()
      ctx.translate(105-7*lean,191)
      ctx.rotate(-.075*lean)
      ctx.drawImage(face,-89,-178,178,177)
      ctx.restore()
    }
    art.onload=()=>{frame=requestAnimationFrame(draw)}
    art.src=homePoses.welcome
    return ()=>{
      art.onload=null
      cancelAnimationFrame(frame)
      link.removeEventListener('pointerdown',down)
      link.removeEventListener('pointermove',move)
      link.removeEventListener('pointerup',end)
      link.removeEventListener('pointercancel',end)
      link.removeEventListener('lostpointercapture',end)
      link.removeEventListener('click',click)
      link.removeEventListener('dragstart',stopDrag)
      link.removeEventListener('pointerenter',enter)
      link.removeEventListener('pointerleave',leave)
      window.removeEventListener('resize',resize)
    }
  },[])
  return <canvas ref={portrait} width={204} height={196} style={{width:86,height:83,display:'block'}} aria-hidden="true"/>
}
