import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { cartKey, useCart } from '../context/CartContext'
import { useMember } from '../context/MemberContext'
import { checkoutLines, useOrders } from '../context/OrderContext'
import { brandById } from '../data/site'
import { products } from '../data/products'
import { commerce } from '../data/commerce'
import { calculateAmounts, toCents } from '../utils/pricing'
import { money } from '../utils/storage'
import { EmptyState, Header, PriceNotice } from '../components/ShopUI'
import { AmountBreakdown, DemoNotice, QuantityControl } from '../components/CommerceUI'
export default function Cart() {
  const {cart,count,selectedItems,changeQuantity,removeItem,selectItem,selectAll}=useCart()
  const {notify}=useShop(), {startCheckout}=useOrders(), navigate=useNavigate()
  const [deleteKey,setDeleteKey]=useState<string | null>(null)
  const {availableCoupons}=useMember()
  const lines=checkoutLines(selectedItems), goods=lines.reduce((sum,line)=>sum+toCents(line.unitPrice)*line.quantity,0)
  const best=availableCoupons().map(c=>commerce.coupons.find(rule=>rule.id===c.kindId)!).filter(rule=>goods>=rule.threshold).sort((a,b)=>b.discount-a.discount)[0]
  const amounts=calculateAmounts(lines,best?.id||null)
  const allSelected=cart.length>0&&selectedItems.length===cart.length
  function mutate(action: () => void){try{action()}catch(error){notify((error as Error).message)}}
  function checkout(){try{navigate(`/checkout/${startCheckout('cart',selectedItems)}`)}catch(error){notify((error as Error).message)}}
  return <><Header title="你的甜蜜购物袋"/><main className="cart-page commerce-page"><div className="page-intro"><span className="eyebrow">SAVED FOR A SWEET DAY</span><h1>把喜欢的甜，先收好。</h1><p>共 {count} 件心意，等你慢慢挑。</p></div><DemoNotice/>{cart.length ? <>
    <div className="cart-toolbar"><label className="check-label"><input type="checkbox" aria-label="全选商品" checked={allSelected} onChange={e=>mutate(()=>selectAll(e.target.checked))} ref={el=>{if(el)el.indeterminate=selectedItems.length>0&&!allSelected}}/>全选</label><span>已选 {amounts.quantity} 件</span></div>
    <div className="cart-list">{cart.map(item=>{const p=products.find(p=>p.id===item.productId)!, key=cartKey(item);return <article className="cart-row cart-row-editable" key={key} data-cart-key={key}>
      <input className="cart-checkbox" type="checkbox" aria-label={`选择${p.name} ${item.flavor}`} checked={item.selected!==false} onChange={e=>mutate(()=>selectItem(key,e.target.checked))}/>
      <Link to={`/product/${p.id}`}><img src={p.image} alt={p.name}/></Link><div className="cart-item-copy"><span className="order-brand">{brandById(p.brand).name}</span><Link to={`/product/${p.id}`}><h2>{p.name}</h2></Link><p>{p.spec}</p><p>{item.flavor} · 数量 {item.quantity}</p><strong>¥{money(p.price)}<span> / 件</span></strong><div className="cart-item-controls"><QuantityControl quantity={item.quantity} onChange={n=>mutate(()=>changeQuantity(key,n))}/><button className="delete-item" aria-label={`删除${p.name} ${item.flavor}`} onClick={()=>setDeleteKey(deleteKey===key?null:key)}><Trash2 size={16}/></button></div><p className="cart-subtotal">小计 <b>¥{money(p.price*item.quantity)}</b></p></div>
      {deleteKey===key&&<div className="delete-confirm" role="group" aria-label="删除确认"><span>要把这份甜移出购物袋吗？</span><div><button onClick={()=>setDeleteKey(null)}>保留</button><button onClick={()=>mutate(()=>{removeItem(key);setDeleteKey(null);notify('已删除商品')})}>确认删除</button></div></div>}
    </article>})}</div>
    <section className="commerce-panel cart-estimate"><h2><ShoppingBag size={17}/>本次心意清单</h2><AmountBreakdown {...amounts} estimated/><p className="subtle-note">演示规则：满 ¥{money(commerce.shipping.freeThreshold/100)} 包邮，未满收取 ¥{money(commerce.shipping.fee/100)} 运费；按商品原总额判断包邮。最终优惠可在订单确认页选择。</p><PriceNotice/></section>
    <div className="commerce-fixed-bar"><label className="check-label"><input type="checkbox" aria-label="底栏全选商品" checked={allSelected} onChange={e=>mutate(()=>selectAll(e.target.checked))}/>全选</label><div className="bar-amount"><span>预计应付</span><strong>¥{money(amounts.finalAmount)}</strong></div><button className="buy-button" disabled={!selectedItems.length} onClick={checkout}>去结算（{amounts.quantity}）<ArrowRight size={14}/></button></div>
  </> : <EmptyState title="购物袋里，还缺一点甜" text="挑一份好糖，为今天添一点温暖。" action="去逛逛"/>}</main></>
}
