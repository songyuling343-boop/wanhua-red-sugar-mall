import { Link } from 'react-router-dom'
import { ArrowUpRight, Heart, Gift, Sparkles, UserRound, PackageCheck, ChevronRight } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { products } from '../data/products'
import { useOrders } from '../context/OrderContext'
import { site } from '../data/site'
import { Header, IpPortrait, ProductCard, SectionTitle } from '../components/ShopUI'
export default function Member(){
  const {favorites}=useShop();const {orders}=useOrders();const saved=products.filter(p=>favorites.includes(p.id))
  return <><Header title="我的甜蜜日常"/><main className="member-page"><section className="member-card"><IpPortrait/><span className="eyebrow">HELLO, SWEET FRIEND</span><h1>欢迎你，甜蜜体验官</h1><p>今天也要好好照顾自己呀。</p><span className="guest-label"><UserRound size={13}/>演示访客 · 无需登录</span></section><div className="member-actions"><Link to="/category"><Heart size={22}/><strong>发现好糖</strong><small>总有一款适合你</small></Link><a href={site.links.quiz}><Sparkles size={22}/><strong>红糖属性</strong><small>发现另一面的你</small></a><a href={site.links.blindbox}><Gift size={22}/><strong>甜蜜盲盒</strong><small>打开小小惊喜</small></a></div><Link className="member-orders-entry" to="/orders"><span className="member-order-icon"><PackageCheck size={25}/></span><div><strong>我的订单</strong><small>{orders.length ? `${orders.length} 笔甜蜜记录` : '查看你的甜蜜购物记录'}</small></div><span>全部订单</span><ChevronRight size={16}/></Link><SectionTitle title={`我的收藏 · ${saved.length}`} english="MY SWEET FAVORITES"/>{saved.length?<div className="product-grid">{saved.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="favorites-empty"><Heart size={25}/><p>点击商品上的爱心，把喜欢留在这里。</p><Link to="/category">去发现喜欢<ArrowUpRight size={14}/></Link></div>}<div className="phase-note"><h2>{site.member.label}</h2><p>目前支持本地收藏与演示订单记录，会员等级和正式积分体系将在后续阶段开放。</p></div></main></>
}
