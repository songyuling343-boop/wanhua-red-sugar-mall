import { Link, useParams } from 'react-router-dom'
import { Check, ArrowUpRight, Home, MapPin } from 'lucide-react'
import { useOrders } from '../context/OrderContext'
import { money } from '../utils/storage'
import { DemoNotice } from '../components/CommerceUI'
import { EmptyState, Header, IpPortrait } from '../components/ShopUI'
export default function PaymentSuccess(){
  const {orderId}=useParams(), {orders}=useOrders(), order=orders.find(o=>o.orderId===orderId)
  if(!order)return <><Header title="支付结果"/><EmptyState title="请先完成一次模拟支付" text="支付结果会保存在当前浏览器的订单记录中。" action="查看我的订单" to="/orders"/></>
  const quantity=order.items.reduce((sum,item)=>sum+item.quantity,0)
  return <><Header title="甜蜜已送达心间"/><main className="success-page"><section className="success-celebration"><span className="eyebrow">SWEETNESS CONFIRMED</span><span className="success-confetti one">✧</span><span className="success-confetti two">✦</span><span className="success-confetti three">✧</span><IpPortrait className="celebrating-ip"/><div className="success-check"><Check size={20}/></div><h1>支付成功</h1><p>模拟支付已完成 · 今天也要甜甜的呀！</p><strong>¥{money(order.finalAmount)}</strong><small>实付金额 · 比赛演示</small></section><DemoNotice payment/><section className="success-receipt"><span className="eyebrow">YOUR LITTLE SWEET RECEIPT</span><h2>万巧巧替你记住这份甜</h2><dl><div><dt>订单号</dt><dd>{order.orderId}</dd></div><div><dt>商品数量</dt><dd>{quantity} 件</dd></div><div><dt>收货人</dt><dd>{order.receiver}</dd></div></dl><div className="success-address"><MapPin size={17}/><p>{order.address}</p></div><span className="receipt-status">{order.status}</span></section><Link to={`/orders/${order.orderId}`} className="primary-button success-view-order">查看订单<ArrowUpRight size={16}/></Link><Link to="/" className="success-home"><Home size={15}/>返回首页</Link><p className="success-note">演示订单已保存在本机浏览器，无需真实支付或收货。</p></main></>
}
