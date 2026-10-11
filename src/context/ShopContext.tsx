import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { site } from '../data/site'
import { products } from '../data/products'
import { readStorage, writeStorage } from '../utils/storage'
import { useCart } from './CartContext'
import type { CartItem } from './CartContext'
const validFavorites = (raw: unknown): string[] => Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string' && products.some(p => p.id === x)) : []
type Shop = { cart: CartItem[]; favorites: string[]; toast: string; add: (id: string, flavor: string, quantity: number) => void; toggleFavorite: (id: string) => void; notify: (message: string) => void }
const Context = createContext<Shop | null>(null)
export function ShopProvider({ children }: { children: ReactNode }) {
  const {cart,addItem}=useCart()
  const [favorites, setFavorites] = useState<string[]>(() => validFavorites(readStorage(site.storage.favorites, [])))
  const [toast, setToast] = useState('')
  const notify = useCallback((message: string) => { setToast(message) }, [])
  function add(id: string, flavor: string, quantity: number) {
    try { addItem(id, flavor, quantity); notify('已加入购物车') } catch (error) { notify((error as Error).message) }
  }
  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]
    if(!writeStorage(site.storage.favorites,next)){notify('未能保存收藏，请允许本地存储后重试');return}
    setFavorites(next)
    notify(next.includes(id) ? '已收藏这份甜' : '已取消收藏')
  }
  return <Context.Provider value={{ cart, favorites, toast, add, toggleFavorite, notify }}>{children}</Context.Provider>
}
export function useShop() { const value = useContext(Context); if (!value) throw new Error('ShopProvider missing'); return value }
