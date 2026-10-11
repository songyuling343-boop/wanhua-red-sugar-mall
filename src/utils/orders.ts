import { commerce } from '../data/commerce'
export type Receiver = { receiver: string; phone: string; province: string; city: string; district: string; detail: string }
export function validateReceiver(value: Receiver) {
  const errors: Partial<Record<keyof Receiver,string>> = {}
  if (!value.receiver.trim()) errors.receiver = '请填写收货人姓名'
  if (!value.phone.trim()) errors.phone = '请填写手机号码'
  else if (!/^1\d{10}$/.test(value.phone.trim())) errors.phone = '请填写 11 位手机号码'
  for (const key of ['province','city','district','detail'] as const) if (!value[key].trim()) errors[key] = '请填写完整收货地址'
  return errors
}
export const receiverAddress = (value: Receiver) => `${value.province.trim()}${value.city.trim()}${value.district.trim()} ${value.detail.trim()}`
export const formatOrderTime = (time: string) => new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(time))
export function uniqueId() { return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}` }
export function generateOrderId(existing: string[]) {
  const parts = new Intl.DateTimeFormat('en',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date())
  const date = ['year','month','day'].map(type=>parts.find(p=>p.type===type)?.value).join('')
  let id: string
  do { id = `WH${date}${Date.now().toString().slice(-7)}${uniqueId().replace(/-/g,'').slice(-6).toUpperCase()}` } while(existing.includes(id))
  return id
}
export function isReceiver(value: unknown): value is Receiver {
  if (!value || typeof value !== 'object') return false
  return Object.keys(commerce.defaultReceiver).every(key=>typeof (value as Record<string,unknown>)[key] === 'string')
}
