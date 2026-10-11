import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { site } from '../data/site'
import { products } from '../data/products'
import { readStorage, writeStorage } from '../utils/storage'
export type CartItem = { productId: string; flavor: string; quantity: number }
const validCart = (raw: unknown): CartItem[] => Array.isArray(raw) ? raw.filter((x): x is CartItem => x && typeof x === 'object' && products.some(p => p.id === x.productId && p.flavors.includes(x.flavor)) && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 99) : []
const validFavorites = (raw: unknown): string[] => Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string' && products.some(p => p.id === x)) : []
type Shop = { cart: CartItem[]; favorites: string[]; toast: string; add: (id: string, flavor: string, quantity: number) => void; toggleFavorite: (id: string) => void; notify: (message: string) => void }
const Context = createContext<Shop | null>(null)
export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => validCart(readStorage(site.storage.cart, [])))
  const [favorites, setFavorites] = useState<string[]>(() => validFavorites(readStorage(site.storage.favorites, [])))
  const [toast, setToast] = useState('')
  function notify(message: string) { setToast(message) }
  function add(id: string, flavor: string, quantity: number) {
    setCart(current => {
      const found = current.find(x => x.productId === id && x.flavor === flavor)
      const next = found ? current.map(x => x === found ? { ...x, quantity: Math.min(99, x.quantity + quantity) } : x) : [...current, { productId: id, flavor, quantity }]
      writeStorage(site.storage.cart, next); return next
    })
    notify('已加入购物车，甜蜜替你收好了')
  }
  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]
    setFavorites(next); writeStorage(site.storage.favorites, next)
    notify(next.includes(id) ? '已收藏这份甜' : '已取消收藏')
  }
  return <Context.Provider value={{ cart, favorites, toast, add, toggleFavorite, notify }}>{children}</Context.Provider>
}
export function useShop() { const value = useContext(Context); if (!value) throw new Error('ShopProvider missing'); return value }
