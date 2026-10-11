import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Member from './pages/Member'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import { Orders, OrderDetail } from './pages/Orders'
import { BottomNav, EmptyState, Header } from './components/ShopUI'
import WelcomeModal from './components/WelcomeModal'
import { useShop } from './context/ShopContext'
function ScrollToTop(){ const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[pathname]);return null }
function Toast(){const {toast,notify}=useShop();useEffect(()=>{if(toast){const timer=setTimeout(()=>notify(''),3000);return()=>clearTimeout(timer)}},[toast,notify]);return toast?<div className="toast" role="status"><span>{toast}</span><button aria-label="关闭提示" onClick={()=>notify('')}><X size={15}/></button></div>:null}
export default function App(){
  const {pathname}=useLocation()
  return <div className={`phone-shell ${pathname.startsWith('/product/')?'on-detail':''}`}><ScrollToTop/><Routes><Route path="/" element={<Home/>}/><Route path="/category" element={<Category/>}/><Route path="/product/:id" element={<ProductDetail/>}/><Route path="/cart" element={<Cart/>}/><Route path="/member" element={<Member/>}/><Route path="/checkout/:checkoutId" element={<Checkout/>}/><Route path="/payment/:checkoutId" element={<Payment/>}/><Route path="/payment-success/:orderId" element={<PaymentSuccess/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:orderId" element={<OrderDetail/>}/><Route path="*" element={<><Header/><EmptyState title="走进了一条甜蜜小巷" text="回到首页，继续发现巧家的甜。" action="回到首页" to="/"/></>}/></Routes><BottomNav/><WelcomeModal/><Toast/></div>
}
