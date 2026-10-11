import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, ArrowUpRight } from 'lucide-react'
import { brands, site } from '../data/site'
import { products } from '../data/products'
import { Header, PriceNotice, ProductCard } from '../components/ShopUI'
export default function Category() {
  const [params,setParams]=useSearchParams(); const input=useRef<HTMLInputElement>(null)
  const brand=params.get('brand')||'all', series=params.get('series')||'all', query=params.get('q')||'', group=params.get('group')||'', sort=params.get('sort')||'default'
  function update(key:string,value:string) {setParams(old=>{const next=new URLSearchParams(old);if(value && value!=='all' && value!=='default')next.set(key,value);else next.delete(key);if(key==='brand')next.delete('series');return next},{replace:true})}
  useEffect(()=>{if(params.get('search'))input.current?.focus()},[params])
  const availableSeries=[...new Set(products.filter(p=>brand==='all'||p.brand===brand).map(p=>p.series))]
  const visible=products.filter(p=>(brand==='all'||p.brand===brand)&&(series==='all'||p.series===series)&&(!group||p.groups.includes(group))&&`${p.name}${p.spec}${p.flavors.join('')}${brands.find(b=>b.id===p.brand)?.name}`.includes(query.trim())).sort((a,b)=>sort==='asc'?a.price-b.price:sort==='desc'?b.price-a.price:0)
  return <><Header title="挑一份你的甜"/><main className="category-page"><div className="category-intro"><span className="eyebrow">THE SWEET COLLECTION</span><h1>好糖，各有滋味。</h1><p>从日常一杯，到一份用心的礼。</p></div><div className="search-field"><Search size={18}/><input ref={input} aria-label="搜索商品" placeholder="搜索商品、品牌或口味" value={query} onChange={e=>update('q',e.target.value)}/>{query&&<button aria-label="清空搜索" onClick={()=>update('q','')}><X size={16}/></button>}</div>
    <div className="brand-tabs" role="group" aria-label="按品牌筛选"><button className={brand==='all'?'active':''} onClick={()=>update('brand','all')}>全部好糖</button>{brands.map(b=><button key={b.id} className={brand===b.id?'active':''} onClick={()=>update('brand',b.id)}>{b.name}</button>)}</div>
    <a className="blindbox-inline" href={site.links.blindbox}>万巧巧盲盒系列<span>IP 趣味互动<ArrowUpRight size={14}/></span></a>
    <div className="filter-row"><label><SlidersHorizontal size={15}/><select aria-label="按系列筛选" value={series} onChange={e=>update('series',e.target.value)}><option value="all">全部系列</option>{availableSeries.map(s=><option key={s} value={s}>{s}</option>)}</select></label><select aria-label="商品排序" value={sort} onChange={e=>update('sort',e.target.value)}><option value="default">推荐排序</option><option value="asc">价格从低到高</option><option value="desc">价格从高到低</option></select></div>
    {group&&<div className="active-filter">{group==='popular'?'本周热销 · 演示排序':group==='gifts'?'人气礼盒':'日常好糖'}<button onClick={()=>update('group','')} aria-label="清除分组筛选"><X size={14}/></button></div>}
    <div className="result-caption">共 {visible.length} 款好糖<PriceNotice/></div>{visible.length?<div className="product-grid">{visible.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="search-empty"><Search size={32}/><h2>还没找到这份甜</h2><p>试试“原味”“礼盒”或其他系列。</p><button className="primary-button" onClick={()=>setParams({})}>重置筛选</button></div>}<p className="category-end">— 好糖慢慢挑，甜蜜慢慢来 —</p><Link className="text-link" to="/">返回首页</Link>
  </main></>
}
