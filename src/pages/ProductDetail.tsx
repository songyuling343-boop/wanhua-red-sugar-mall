import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Heart, Minus, Plus, ShoppingBag, Check, MapPin } from 'lucide-react'
import { products } from '../data/products'
import { brandById } from '../data/site'
import { useShop } from '../context/ShopContext'
import { useOrders } from '../context/OrderContext'
import { money } from '../utils/storage'
import { EmptyState, Header, PriceNotice, ProductCard, SectionTitle } from '../components/ShopUI'
export default function ProductDetail() {
  const {id}=useParams();const product=products.find(p=>p.id===id)
  const [flavor,setFlavor]=useState(product?.flavors[0]||'');const [quantity,setQuantity]=useState(1)
  const {add,favorites,toggleFavorite,notify}=useShop();const navigate=useNavigate();const {startCheckout}=useOrders()
  useEffect(()=>{setFlavor(product?.flavors[0]||'');setQuantity(1)},[product])
  if(!product)return <><Header title="商品详情" back/><EmptyState title="这份甜暂时找不到" text="去看看其他好糖吧。"/></>
  const brand=brandById(product.brand);const related=products.filter(p=>p.brand===product.brand&&p.id!==id).slice(0,2)
  function buyNow(){try{const token=startCheckout('buyNow',[{productId:product!.id,flavor,quantity}]);navigate(`/checkout/${token}`)}catch(error){notify((error as Error).message)}}
  return <><Header title="好糖详情" back/><main className="detail-page"><div className="detail-image"><img src={product.image} alt={`${product.name}企业产品册展示图`}/><span className={`product-brand ${product.brand}`}>{brand.name}</span><span className="image-source">企业产品册展示图</span></div><section className="detail-summary"><div className="detail-price"><span><small>¥</small>{money(product.price)}</span><span className="demo-price-label">比赛演示价</span><button className={`favorite-detail ${favorites.includes(product.id)?'saved':''}`} aria-label="收藏商品" aria-pressed={favorites.includes(product.id)} onClick={()=>toggleFavorite(product.id)}><Heart size={22} fill={favorites.includes(product.id)?'currentColor':'none'}/><small>{favorites.includes(product.id)?'已收藏':'收藏'}</small></button></div><h1>{product.name}</h1><p className="detail-spec">{brand.name}<span>·</span>{product.spec}</p><div className="tags">{product.tags.map(t=><span key={t}><Check size={12}/>{t}</span>)}</div><PriceNotice/></section>
    <section className="selection-panel"><div className="selection-heading"><h2>选择{product.flavorKind}</h2><span>已选：{flavor}</span></div><div className="flavor-options">{product.flavors.map(f=><button key={f} aria-pressed={flavor===f} className={flavor===f?'active':''} onClick={()=>setFlavor(f)}>{f}</button>)}</div><div className="quantity-row"><h2>购买数量</h2><div className="quantity-control"><button aria-label="减少数量" disabled={quantity<=1} onClick={()=>setQuantity(n=>Math.max(1,n-1))}><Minus size={15}/></button><output aria-label="购买数量" aria-live="polite">{quantity}</output><button aria-label="增加数量" disabled={quantity>=99} onClick={()=>setQuantity(n=>Math.min(99,n+1))}><Plus size={15}/></button></div></div><p className="subtle-note">规格：{product.spec} · 演示选择上限 99 件</p></section>
    <section className="detail-info"><span className="eyebrow">A LITTLE MORE ABOUT IT</span><h2>这一份甜，值得慢慢了解</h2><p>{product.description}</p><dl><div><dt>所属品牌</dt><dd>{brand.name}</dd></div><div><dt>净含量／包装</dt><dd>{product.spec}</dd></div><div><dt>{product.flavorKind}</dt><dd>{product.flavors.join('、')}</dd></div><div><dt>资料来源</dt><dd>企业产品展示册 · 第 {product.page} 页</dd></div></dl><p className="source-note">图片取自企业资料，展示系列包装；不代表所选口味或规格的单独实拍。商品介绍以已有资料为基础，完整标签信息以实际包装为准。</p></section>
    <section className="scene-panel"><SectionTitle title="让甜蜜融入日常" english="YOUR SWEET MOMENTS"/><div className="scene-list">{product.scenes.map(s=><span key={s}><MapPin size={14}/>{s}</span>)}</div></section>
    <section className={`brand-story ${brand.className}`}><span className="eyebrow">{brand.english}</span><h2>{brand.name}</h2><p>{brand.story}</p><Link to={`/category?brand=${brand.id}`}>探索品牌好糖<ArrowUpRight size={15}/></Link></section>
    {!!related.length&&<section className="related-section"><SectionTitle title="你可能也会喜欢" english="MORE SWEET DISCOVERIES"/><div className="product-grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}
    <div className="purchase-bar"><Link to="/cart" className="purchase-cart" aria-label="查看购物车"><ShoppingBag size={22}/><span>购物车</span></Link><button className="add-cart-button" onClick={()=>add(product.id,flavor,quantity)}>加入购物车</button><button className="buy-button" onClick={buyNow}>立即购买</button></div>
  </main></>
}
