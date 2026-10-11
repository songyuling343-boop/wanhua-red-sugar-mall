// All rules below are competition demonstration rules, never official retail terms.
export const commerce = {
  coupons: [
    { id: 'sweet-5', threshold: 5900, discount: 500, title: '满 59 减 5' },
    { id: 'sweet-10', threshold: 9900, discount: 1000, title: '满 99 减 10' },
    { id: 'sweet-25', threshold: 19900, discount: 2500, title: '满 199 减 25' },
  ],
  shipping: { freeThreshold: 9900, fee: 800 },
  points: { enabled: false, message: '积分功能将在会员体系中启用' },
  defaultReceiver: { receiver: '万巧巧', phone: '13800000000', province: '云南省', city: '昭通市', district: '巧家县', detail: '演示地址（比赛展示，无需真实收货）' },
  paymentMethods: [
    { id: 'wechat', label: '微信支付（演示）', short: '微', className: 'wechat' },
    { id: 'alipay', label: '支付宝（演示）', short: '支', className: 'alipay' },
  ],
  status: '已支付（演示）',
  demoLabel: '比赛互动演示版',
  paymentNotice: '比赛演示模式，本页面不会发生真实支付。',
  storage: { orders: 'wanhua-orders-v1', draft: 'wanhua-checkout-v1' },
}
export type PaymentMethod = typeof commerce.paymentMethods[number]['id']
export const paymentLabel = (id: string) => commerce.paymentMethods.find(p => p.id === id)?.label || '模拟支付'
