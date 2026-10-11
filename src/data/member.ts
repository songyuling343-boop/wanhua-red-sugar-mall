import { commerce } from './commerce'
export const memberConfig = {
  storage: 'wanhua-member-v1', nickname: '甜甜的小碗', initialPoints: 100,
  rewards: { quizPoints: 20, quizGrowth: 10, signPoints: 5, blindVisitPoints: 10, firstOrderPoints: 30, firstOrderGrowth: 20 },
  blindboxCost: 100, couponValidityDays: 30,
  couponCosts: { 'sweet-5': 100, 'sweet-10': 180, 'sweet-25': 300 } as Record<string, number>,
  couponRules: commerce.coupons,
  version: '比赛演示设置 · v0.3',
}
export const levels = [
  { id:'friend', name:'糖小友', threshold:0, className:'level-friend', motto:'初见巧家，甜蜜同行', benefits:['基础积分','会员活动参与资格'] },
  { id:'heart', name:'糖心会员', threshold:200, className:'level-heart', motto:'日常的一点甜，更懂你', benefits:['基础权益','生日月优惠券','积分兑换专区'] },
  { id:'jinsha', name:'金沙会员', threshold:600, className:'level-jinsha', motto:'金沙流韵，好糖相伴', benefits:['1.1倍积分日活动资格','优先体验新品','限定万巧巧徽章活动资格'] },
  { id:'premium', name:'巧家臻享会员', threshold:1500, className:'level-premium', motto:'一方风物，一份臻享', benefits:['专属礼遇','新品优先体验','限定盲盒活动','会员专属礼盒优惠'] },
]
export const levelFor = (growth: number) => [...levels].reverse().find(level=>growth>=level.threshold) || levels[0]
export const personalities = [
  { id:'warm', name:'元气暖糖型', emoji:'☀', caption:'热爱日常的小小元气', description:'老姜、大枣枸杞的风味灵感，陪伴早餐与午后。', products:['fashion','family','china-red'] },
  { id:'floral', name:'温柔花香型', emoji:'✿', caption:'把花香写进甜蜜日常', description:'从玫瑰到茉莉，为一杯红糖添一点花香。', products:['pure','tang-lady','family'] },
  { id:'classic', name:'国潮经典型', emoji:'韵', caption:'喜欢有故事的东方风物', description:'用金沙唐韵经典礼盒，把巧家的文化带回家。', products:['qiaojia-gift','golden-gift','tang-lady'] },
  { id:'gentle', name:'轻养治愈型', emoji:'♡', caption:'愿意给自己一份温柔', description:'呵糖与日常独立包装，留一份甜给自己。', products:['her-364','orange-family','pure'] },
]
export const blindCharacters = [
  { id:'jinsha', name:'金沙小巧', pose:'main', rarity:'经典款', weight:23, caption:'来自金沙江畔的一份甜' },
  { id:'cane', name:'甘蔗精灵巧巧', pose:'cane', rarity:'经典款', weight:23, caption:'头顶甘蔗叶，元气满满' },
  { id:'tea', name:'糖水铺巧巧', pose:'tray', rarity:'经典款', weight:20, caption:'把一盘甜蜜递到你手心' },
  { id:'scroll', name:'国潮卷轴巧巧', pose:'scroll', rarity:'特别款', weight:17, caption:'展开画卷，遇见巧家风景' },
  { id:'milktea', name:'奶茶巧巧', pose:'drink', rarity:'特别款', weight:14, caption:'一杯奶茶，一杯好心情' },
  { id:'gold', name:'隐藏款·金糖巧巧', pose:'gold', rarity:'隐藏款', weight:3, caption:'把金色好运藏进云纹里' },
]
export const demoActions = [
  {id:'reset-account',label:'重置演示账号',description:'重置会员积分、成长、活动和收藏盲盒；保留商品收藏、购物车和历史订单，不重复补发旧订单奖励。'},
  {id:'points',label:'恢复默认积分',description:'将积分调整至100，成长值保持不变，并写入调整记录。'},
  ...levels.map(level=>({id:`level-${level.id}`,label:`设置为${level.name}`,description:`将成长值设为${level.threshold}；不改变积分。`})),
  {id:'signs',label:'清空签到状态',description:'清空签到日期，允许重新演示今日签到；不撤销已有积分。'},
  {id:'collection',label:'清空盲盒收藏',description:'清空收藏和抽取记录，不返还已花积分。'},
  {id:'quiz',label:'重新触发首次测试奖励',description:'重置测试访问和奖励标记，需再次进入测试后手动领取。'},
  {id:'restore',label:'恢复初始演示数据',description:'会员恢复100积分、0成长、初始演示券和空活动记录；保留商城订单与购物车，旧订单不补发奖励。'},
]
