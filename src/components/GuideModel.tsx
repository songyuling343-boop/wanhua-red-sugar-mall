import { useEffect, useRef } from 'react'

type Point = [number, number, number]
type Part = { center: Point, size: Point, color: Point, tilt?: number, bowl?: boolean }

export default function GuideModel() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const node = canvas.current
    const ctx = node?.getContext('2d')
    if (!node || !ctx) return
    const link = node.closest('a')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let peek = 0, target = 0, frame = 0, previous = -100
    const enter = () => { target = 1 }
    const leave = () => { target = 0 }
    link?.addEventListener('pointerenter', enter)
    link?.addEventListener('pointerleave', leave)
    link?.addEventListener('focus', enter)
    link?.addEventListener('blur', leave)
    function render(ms: number) {
      if (!ctx || !node) return
      frame = requestAnimationFrame(render)
      if (ms - previous < 45) return
      previous = ms
      const t = reduced.matches ? 0 : ms / 1000
      peek += ((reduced.matches ? 0 : target) - peek) * 0.22
      const turn = -0.2 + peek * 0.48
      const blink = Math.min(1, 0.11 + Math.abs(t % 4.2 - 3.3) * 9)
      const phase = t % 7
      const wave = phase < 2 ? Math.sin(phase * Math.PI / 2) ** 2 : 0
      const arm = 0.3 + wave * (1.45 + 0.36 * Math.sin(t * 16))
      const brown: Point = [164,85,43], green: Point = [102,153,69]
      const parts: Part[] = []
      function add(center: Point,size: Point,color: Point,tilt=0,bowl=false) {
        parts.push({center,size,color,tilt,bowl})
      }
      for (const side of [-1,1]) add([side*.37,-.78,.1],[.25,.19,.3],brown)
      add([0,-.52,0],[.59,.33,.52],[41,125,117])
      add([0,-.42,.02],[.61,.09,.54],[226,169,62])
      add([0,-.29,.01],[.7,.13,.6],[181,53,35])
      add([-.64,-.41,.19],[.12,.31,.1],[183,49,31],-.55)
      add([0,.15,0],[.86,.55,.68],brown,0,true)
      add([-.22,.91,0],[.14,.43,.07],green,.65)
      add([.18,.99,-.03],[.14,.52,.08],[70,127,56],-.48)
      add([.44,.84,-.05],[.11,.34,.07],green,-.94)
      add([-.75,-.17,.05],[.16,.32,.17],brown,-.5)
      add([.73+.22*Math.cos(arm),-.15+.25*Math.sin(arm),.18],[.29,.14,.15],brown,arm)
      add([.73+.43*Math.cos(arm),-.15+.46*Math.sin(arm),.19],[.15,.17,.15],[189,112,63])
      for(const side of [-1,1]){
        add([side*.32,.22,.63],[.112,.155*blink,.065],[47,27,21])
        if(blink>.45)add([side*.32-.028,.22+.06*blink,.69],[.034,.038*blink,.018],[255,242,210])
        add([side*.48,.035,.56],[.105,.05,.03],[210,110,80])
      }
      add([0,-.015,.68],[.095,.053,.024],[80,38,27])
      const faces: {points:Point[],depth:number,fill:string}[]=[]
      for(const part of parts){
        const grid:Point[][]=[]
        for(let j=0;j<=10;j++){
          const lat=Math.PI*(j/10-.5), row:Point[]=[]
          for(let i=0;i<=20;i++){
            const lon=i*Math.PI/10, y0=Math.sin(lat)
            const radius=part.bowl ? (1+.22*y0)*Math.pow(Math.max(0,Math.cos(lat)),.43) : Math.cos(lat)
            const x=part.size[0]*radius*Math.cos(lon), y=part.size[1]*y0, angle=part.tilt||0
            const wx=x*Math.cos(angle)-y*Math.sin(angle)+part.center[0], wy=x*Math.sin(angle)+y*Math.cos(angle)+part.center[1]
            const wz=part.center[2]+part.size[2]*radius*Math.sin(lon)
            const z=wz*Math.cos(turn)-wx*Math.sin(turn)
            row.push([wx*Math.cos(turn)+wz*Math.sin(turn),wy*.98-z*.2,z*.98+wy*.2])
          }
          grid.push(row)
        }
        for(let j=0;j<10;j++)for(let i=0;i<20;i++){
          const a=grid[j][i],b=grid[j+1][i],c=grid[j][i+1],d=grid[j+1][i+1]
          const u=b.map((v,k)=>v-a[k]),v=c.map((n,k)=>n-a[k])
          const nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0]
          if(nz<=0)continue
          const light=.68+.45*Math.max(0,(-.42*nx+.67*ny+.61*nz)/Math.hypot(nx,ny,nz))
          faces.push({points:[a,b,d,c],depth:(a[2]+d[2])/2,fill:'rgb('+part.color.map(n=>Math.round(n*light)).join(',')+')'})
        }
      }
      ctx.clearRect(0,0,node.width,node.height)
      ctx.save()
      ctx.scale(2,2)
      ctx.fillStyle='rgba(86,53,27,.14)'
      ctx.beginPath();ctx.ellipse(44,86,23,4,0,0,Math.PI*2);ctx.fill()
      ctx.translate(43-peek*4,55-peek*3)
      ctx.rotate(-peek*.12)
      for(const face of faces.sort((a,b)=>a.depth-b.depth)){
        ctx.beginPath()
        face.points.forEach(([x,y],i)=>i?ctx.lineTo(x*32,-y*32):ctx.moveTo(x*32,-y*32))
        ctx.closePath();ctx.fillStyle=ctx.strokeStyle=face.fill;ctx.lineWidth=.42;ctx.fill();ctx.stroke()
      }
      ctx.restore()
    }
    frame=requestAnimationFrame(render)
    return ()=>{cancelAnimationFrame(frame);link?.removeEventListener('pointerenter',enter);link?.removeEventListener('pointerleave',leave);link?.removeEventListener('focus',enter);link?.removeEventListener('blur',leave)}
  },[])
  return <canvas ref={canvas} width={176} height={184} style={{width:88,height:92,display:'block'}} aria-hidden="true"/>
}
