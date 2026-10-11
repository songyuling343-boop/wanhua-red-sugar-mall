import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { products } from '../data/products'
import { site } from '../data/site'
import { readStorage, writeStorage } from '../utils/storage'
export type CartItem = { productId: string; flavor: string; quantity: number; selected?: boolean }
export const cartKey = (item: Pick<CartItem, 'productId' | 'flavor'>) => `${item.productId}:${item.flavor}`
export const isCartItem = (x: unknown): x is CartItem => {
  if (!x || typeof x !== 'object') return false
  const value = x as CartItem
  return products.some(p => p.id === value.productId && p.flavors.includes(value.flavor)) && Number.isInteger(value.quantity) && value.quantity >= 1 && value.quantity <= 99
}
function restoreCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const merged = new Map<string, CartItem>()
  for (const item of raw.filter(isCartItem)) {
    const key = cartKey(item), previous = merged.get(key)
    merged.set(key, { ...item, selected: typeof item.selected === 'boolean' ? item.selected : true, quantity: Math.min(99, item.quantity + (previous?.quantity || 0)) })
  }
  return [...merged.values()]
}
type SavedCart = { items: CartItem[]; completedCheckouts: string[] }
function restoreState(raw: unknown): SavedCart {
  if (Array.isArray(raw)) return { items: restoreCart(raw), completedCheckouts: [] }
  if (raw && typeof raw === 'object') {
    const value = raw as Partial<SavedCart>
    return { items: restoreCart(value.items), completedCheckouts: Array.isArray(value.completedCheckouts) ? value.completedCheckouts.filter((x): x is string => typeof x === 'string') : [] }
  }
  return { items: [], completedCheckouts: [] }
}
type CartState = {
  cart: CartItem[]; count: number; selectedItems: CartItem[];
  addItem: (id: string, flavor: string, quantity: number) => void;
  changeQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  selectItem: (key: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearPurchased: (items: CartItem[], checkoutId: string) => boolean;
}
const Context = createContext<CartState | null>(null)
export function CartProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(() => restoreState(readStorage<unknown>(site.storage.cart, [])))
  const cart = saved.items
  const current = useRef(saved)
  const persist = useCallback((next: SavedCart, mustPersist = true) => {
    const ok = writeStorage(site.storage.cart, next)
    if (!ok && mustPersist) return false
    current.current = next; setSaved(next); return ok
  }, [])
  const save = useCallback((items: CartItem[]) => {
    if (!persist({ ...current.current, items })) throw new Error('购物车修改未保存，请允许浏览器本地存储后重试')
  }, [persist])
  const addItem = useCallback((id: string, flavor: string, quantity: number) => {
    if (!isCartItem({ productId: id, flavor, quantity })) return
    const found = current.current.items.find(item => item.productId === id && item.flavor === flavor)
    save(found ? current.current.items.map(item => item === found ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item) : [...current.current.items, { productId: id, flavor, quantity, selected: true }])
  }, [save])
  const changeQuantity = useCallback((key: string, quantity: number) => {
    save(current.current.items.map(item => cartKey(item) === key ? { ...item, quantity: Math.max(1, Math.min(99, Math.round(quantity))) } : item))
  }, [save])
  const removeItem = useCallback((key: string) => { save(current.current.items.filter(item => cartKey(item) !== key)) }, [save])
  const selectItem = useCallback((key: string, selected: boolean) => { save(current.current.items.map(item => cartKey(item) === key ? { ...item, selected } : item)) }, [save])
  const selectAll = useCallback((selected: boolean) => { save(current.current.items.map(item => ({ ...item, selected }))) }, [save])
  const clearPurchased = useCallback((items: CartItem[], checkoutId: string) => {
    // Persist cart updates and completion marker together, so a replay cannot subtract twice.
    const latest = restoreState(readStorage<unknown>(site.storage.cart, current.current))
    if (latest.completedCheckouts.includes(checkoutId)) {
      current.current = latest; setSaved(latest); return true
    }
    const paid = new Map(items.map(item => [cartKey(item), item.quantity]))
    return persist({
      items: latest.items.map(item => ({ ...item, quantity: item.quantity - (paid.get(cartKey(item)) || 0) })).filter(item => item.quantity > 0),
      completedCheckouts: [...latest.completedCheckouts, checkoutId],
    }, true)
  }, [persist])
  return <Context.Provider value={{ cart, count: cart.reduce((sum,item)=>sum+item.quantity,0), selectedItems: cart.filter(item=>item.selected !== false), addItem, changeQuantity, removeItem, selectItem, selectAll, clearPurchased }}>{children}</Context.Provider>
}
export function useCart() { const context = useContext(Context); if (!context) throw new Error('CartProvider missing'); return context }
