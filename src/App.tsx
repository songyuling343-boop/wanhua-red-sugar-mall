import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import Activity from './pages/Activity'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
const Member = lazy(() => import('./pages/Member'))
const BrandStory = lazy(() => import('./pages/BrandStory'))
const DemoGuide = lazy(() => import('./pages/DemoGuide'))
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import { Orders, OrderDetail } from './pages/Orders'
const Points = lazy(() => import('./pages/MemberRewards').then(m=>({default:m.Points})))
const SignIn = lazy(() => import('./pages/MemberRewards').then(m=>({default:m.SignIn})))
const Coupons = lazy(() => import('./pages/MemberRewards').then(m=>({default:m.Coupons})))
const Favorites = lazy(() => import('./pages/MemberRewards').then(m=>({default:m.Favorites})))
const Activities = lazy(() => import('./pages/MemberActivities').then(m=>({default:m.Activities})))
const Blindbox = lazy(() => import('./pages/MemberActivities').then(m=>({default:m.Blindbox})))
const Benefits = lazy(() => import('./pages/MemberActivities').then(m=>({default:m.Benefits})))
const DemoSettings = lazy(() => import('./pages/MemberActivities').then(m=>({default:m.DemoSettings})))
import { MemberReward } from './components/MemberUI'
import ExternalActivityTracker from './components/ExternalActivityTracker'
import { BottomNav, EmptyState, Header, IpPortrait } from './components/ShopUI'
import WelcomeModal from './components/WelcomeModal'
import { useShop } from './context/ShopContext'
function ScrollToTop(){ const {pathname,state}=useLocation();useEffect(()=>{const frame=requestAnimationFrame(()=>window.scrollTo({top:state?.returnScroll??0,behavior:'instant'}));return()=>cancelAnimationFrame(frame)},[pathname,state]);return null }
function Toast(){const {toast,notify}=useShop();useEffect(()=>{if(toast){const timer=setTimeout(()=>notify(''),3000);return()=>clearTimeout(timer)}},[toast,notify]);return toast?<div className="toast" role="status">{toast==='已加入购物车'&&<IpPortrait className="toast-ip"/>}<span>{toast}</span><button aria-label="关闭提示" onClick={()=>notify('')}><X size={15}/></button></div>:null}
export default function App(){
  const {pathname}=useLocation()
  const isActivity=pathname==='/activity/quiz'||pathname==='/activity/blindbox'
  return <div className={`phone-shell ${isActivity?'on-activity':pathname.startsWith('/product/')?'on-detail':''}`}><ScrollToTop/><ExternalActivityTracker/><Suspense fallback={<div className="route-loading" role="status">万巧巧正在准备这份甜…</div>}><Routes><Route path="/activity/quiz" element={<Activity type="quiz"/>}/><Route path="/activity/blindbox" element={<Activity type="blindbox"/>}/><Route path="/story" element={<BrandStory/>}/><Route path="/guide" element={<DemoGuide/>}/><Route path="/" element={<Home/>}/><Route path="/category" element={<Category/>}/><Route path="/product/:id" element={<ProductDetail/>}/><Route path="/cart" element={<Cart/>}/><Route path="/member" element={<Member/>}/><Route path="/member/points" element={<Points/>}/><Route path="/member/sign" element={<SignIn/>}/><Route path="/member/coupons" element={<Coupons/>}/><Route path="/member/favorites" element={<Favorites/>}/><Route path="/member/activities" element={<Activities/>}/><Route path="/member/blindbox" element={<Blindbox/>}/><Route path="/member/benefits" element={<Benefits/>}/><Route path="/member/demo" element={<DemoSettings/>}/><Route path="/checkout/:checkoutId" element={<Checkout/>}/><Route path="/payment/:checkoutId" element={<Payment/>}/><Route path="/payment-success/:orderId" element={<PaymentSuccess/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:orderId" element={<OrderDetail/>}/><Route path="*" element={<><Header/><EmptyState title="走进了一条甜蜜小巷" text="回到首页，继续发现巧家的甜。" action="回到首页" to="/"/></>}/></Routes></Suspense>{!isActivity&&<BottomNav/>}<WelcomeModal/><MemberReward/><Toast/></div>
}
