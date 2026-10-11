import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ShopProvider } from './context/ShopContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import App from './App'
import './styles/index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><CartProvider><OrderProvider><ShopProvider><App /></ShopProvider></OrderProvider></CartProvider></BrowserRouter></React.StrictMode>)
