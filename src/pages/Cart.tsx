import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowUpRight } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { products } from '../data/products'
import { money } from '../utils/storage'
import { EmptyState, Header, PriceNotice } from '../components/ShopUI'
export default function Cart() {
  const {cart}=useShop();const count=cart.reduce((n,x)=>n+x.quantity,0)
  return <><Header title="你的甜蜜购物袋"/><main className="cart-page"><div className="page-intro"><span className="eyebrow">SAVED FOR A SWEET DAY</span><h1>把喜欢的甜，先收好。</h1><p>共 {count} 件心意，等你慢慢挑。</p></div>{cart.length ? <><div className="cart-list">{cart.map(item=>{const p=products.find(p=>p.id===item.productId)!;return <article className="cart-row" key={`${item.productId}-${item.flavor}`}><Link to={`/product/${p.id}`}><img src={p.image} alt={p.name}/></Link><div><Link to={`/product/${p.id}`}><h2>{p.name}</h2></Link><p>{p.spec}</p><p>{item.flavor} · 数量 {item.quantity}</p><strong>¥{money(p.price)}<span> / 件</span></strong></div><span className="cart-quantity">×{item.quantity}</span></article>})}</div><div className="cart-summary"><span>演示商品总额</span><strong>¥{money(cart.reduce((n,item)=>n+products.find(p=>p.id===item.productId)!.price*item.quantity,0))}</strong></div><PriceNotice/><div className="phase-note"><ShoppingBag size={22}/><h2>这份甜，已为你记住</h2><p>当前为购物车展示框架，可查看已选商品。结算服务将在后续阶段开放。</p><Link to="/category">继续挑选<ArrowUpRight size={15}/></Link></div></> : <EmptyState title="购物袋里，还缺一点甜" text="挑一份好糖，为今天添一点温暖。"/>}</main></>
}
