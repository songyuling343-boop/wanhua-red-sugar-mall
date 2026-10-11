import { ArrowLeft, ArrowUpRight, ChevronRight, Heart, Home, LayoutGrid, Search, ShoppingBag, UserRound } from 'lucide-react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import type { Product } from '../data/products'
import { brandById, site } from '../data/site'
import { useShop } from '../context/ShopContext'
import { money } from '../utils/storage'
export function IpPortrait({ className = '' }: { className?: string }) {
  return <div className={`ip-portrait ${className}`}><img src={site.assets.ip} alt="万巧巧红糖 IP" /></div>
}
export function Header({ title, back = false }: { title?: string; back?: boolean }) {
  const navigate = useNavigate(); const { cart } = useShop(); const count = cart.reduce((n,x) => n+x.quantity,0)
  return <header className="shop-header">{back ? <button className="icon-button" aria-label="返回" onClick={() => window.history.state?.idx > 0 ? navigate(-1) : navigate('/category')}><ArrowLeft size={21} /></button> : <Link to="/" className="logo-link"><img src={site.assets.logo} alt="万华官方 Logo" /></Link>}
    <div className="header-copy"><strong>{title || site.name}</strong><span>{title ? 'WANHUA · A LITTLE SWEET' : site.subtitle}</span></div>
    <Link className="icon-button" to="/category?search=1" aria-label="搜索商品"><Search size={20} /></Link><Link className="icon-button cart-icon" to="/cart" aria-label="购物车"><ShoppingBag size={20} />{count > 0 && <span className="badge" aria-label={`购物车共${count}件`}>{count > 99 ? '99+' : count}</span>}</Link>
  </header>
}
export function BottomNav() {
  const {pathname}=useLocation()
  const {cart} = useShop(); const count = cart.reduce((n,x)=>n+x.quantity,0)
  return <nav className="bottom-nav" aria-label="底部导航">{[
    { path:'/', label:'首页', icon:Home }, { path:'/category', label:'分类', icon:LayoutGrid }, { path:'/cart', label:'购物车', icon:ShoppingBag }, { path:'/member', label:'会员中心', icon:UserRound },
  ].map(({ path,label,icon:Icon }) => <NavLink key={path} to={path} end className={({isActive}) => (isActive || (path==='/member' && (pathname.startsWith('/orders')||pathname.startsWith('/member/')))) ? 'nav-item active' : 'nav-item'}><span className="relative"><Icon size={21} strokeWidth={1.7}/>{path==='/cart' && count>0 && <span className="nav-badge" aria-label={`购物车共${count}件`}>{count>99?'99+':count}</span>}</span><span>{label}</span></NavLink>)}</nav>
}
export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite } = useShop()
  return <article className="product-card"><div className="product-media"><Link to={`/product/${product.id}`} aria-label={`查看${product.name} ${product.spec}`}><img src={product.image} alt={`${product.name}企业产品册展示图`} loading="lazy" /></Link><span className={`product-brand ${product.brand}`}>{brandById(product.brand).name}</span><button className={`save-button ${favorites.includes(product.id) ? 'saved' : ''}`} aria-label={`收藏${product.name}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart size={16} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button></div>
    <Link to={`/product/${product.id}`} className="product-copy"><h3>{product.name}</h3><p>{product.spec}</p><span className="mini-tag">{product.tags[0]}</span><div className="product-price"><span><small>¥</small>{money(product.price)}</span><ArrowUpRight size={17}/></div></Link></article>
}
export function SectionTitle({ title, subtitle, english, to }: { title: string; subtitle?: string; english?: string; to?: string }) {
  return <div className="section-title"><div>{english && <span className="eyebrow">{english}</span>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{to && <Link to={to} className="more-link">更多<ChevronRight size={14}/></Link>}</div>
}
export function PriceNotice() { return <p className="price-notice">{site.priceNotice}</p> }
export function EmptyState({ title, text, action = '去挑一份甜', to = '/category' }: { title:string; text:string; action?:string; to?:string }) {
  return <div className="empty-state"><IpPortrait/><h2>{title}</h2><p>{text}</p><Link className="primary-button" to={to}>{action}<ArrowUpRight size={16}/></Link></div>
}
