import { Link } from 'react-router-dom'
import { ArrowUpRight, PackageCheck, MapPin, CreditCard } from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { useParams } from 'react-router-dom'
import { commerce, paymentLabel } from '../data/commerce'
import { formatOrderTime } from '../utils/orders'
import { money } from '../utils/storage'
import { EmptyState, Header, PriceNotice } from '../components/ShopUI'
import { AmountBreakdown, DemoNotice, OrderItems } from '../components/CommerceUI'
export function Orders(){
  const {orders}=useOrders()
  return <><Header title="我的甜蜜订单" back/><main className="orders-page"><div className="checkout-heading"><span className="eyebrow">YOUR SWEET MEMORIES</span><h1>每一份甜，都有记录。</h1><p>共 {orders.length} 笔演示订单 · 保存在当前浏览器</p></div><DemoNotice/>{orders.length?<div className="orders-list">{orders.map(order=>{const quantity=order.items.reduce((sum,item)=>sum+item.quantity,0);return <Link to={`/orders/${order.orderId}`} key={order.orderId} className="order-list-card"><div className="order-list-top"><PackageCheck size={15}/><span>{order.status}</span><ArrowUpRight size={16}/></div><p className="order-number">{order.orderId}</p><p className="order-date">{formatOrderTime(order.createdAt)}（北京时间）</p><div className="order-thumbnails">{order.items.slice(0,3).map(item=><img key={`${item.productId}:${item.flavor}`} src={item.image} alt={item.name}/>)}{order.items.length>3&&<span>+{order.items.length-3}</span>}</div><div className="order-list-total"><span>共 {quantity} 件商品</span><span>实付 <strong>¥{money(order.finalAmount)}</strong></span></div></Link>})}</div>:<EmptyState title="第一份甜蜜订单，等你开启" text="去挑选喜欢的好糖，体验一次模拟下单。" action="去逛逛"/>}<PriceNotice/></main></>
}
export function OrderDetail(){
  const {orderId}=useParams(), {orders}=useOrders(), order=orders.find(o=>o.orderId===orderId)
  if(!order)return <><Header title="订单详情" back/><EmptyState title="还没找到这份订单" text="请查看当前浏览器保存的演示订单记录。" action="查看我的订单" to="/orders"/></>
  const quantity=order.items.reduce((sum,item)=>sum+item.quantity,0)
  return <><Header title="甜蜜订单详情" back/><main className="order-detail-page"><section className="order-status-banner"><PackageCheck size={28}/><div><h1>{order.status}</h1><p>这份心意，已留在甜蜜记录里。</p></div></section><DemoNotice/><section className="commerce-panel"><h2><MapPin size={17}/>收货信息</h2><div className="saved-receiver"><strong>{order.receiver}<span>{order.phone}</span></strong><p>{order.address}</p><small>仅作演示，不进行实际配送</small></div></section><section className="commerce-panel"><h2>商品明细<span className="panel-caption">共 {quantity} 件</span></h2><OrderItems items={order.items}/></section><section className="commerce-panel"><h2>金额明细</h2><AmountBreakdown {...order} quantity={quantity}/><PriceNotice/></section><section className="commerce-panel"><h2><CreditCard size={17}/>订单信息</h2><dl className="order-metadata"><div><dt>订单编号</dt><dd>{order.orderId}</dd></div><div><dt>下单时间</dt><dd>{formatOrderTime(order.createdAt)}（北京时间）</dd></div><div><dt>订单状态</dt><dd>{order.status}</dd></div><div><dt>模拟支付方式</dt><dd>{paymentLabel(order.paymentMethod)}</dd></div><div><dt>演示优惠券</dt><dd>{commerce.coupons.find(c=>c.id===order.couponId)?.title||'未使用'}</dd></div><div><dt>订单备注</dt><dd>{order.remark||'无备注'}</dd></div></dl></section><Link className="primary-button order-again" to="/category">继续挑选好糖<ArrowUpRight size={16}/></Link></main></>
}
