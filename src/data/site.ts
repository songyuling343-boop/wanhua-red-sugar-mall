export const site = {
  name: '万华巧家小碗红糖',
  subtitle: '甜从巧家来 · 好糖慢慢熬',
  priceNotice: '价格为策划展示参考，非官方实际售价',
  demoNotice: '大学生营销策划比赛 · 交互演示版',
  links: { quiz: 'https://wanhua-red-sugar-quiz.pages.dev/', blindbox: 'https://wanqiaoqiao-blindbox.pages.dev/' },
  assets: {
    logo: '/images/wanhua-official-logo.png',
    ip: '/images/wan-qiaoqiao-ip-character-sheet.png',
    brands: '/images/three-sub-brands-showcase.png',
  },
  storage: { welcome: 'wanhua-welcome-v1', cart: 'wanhua-cart-v1', favorites: 'wanhua-favorites-v1' },
  member: { enabled: false, label: '会员服务将在后续阶段开放' },
}
export type BrandId = 'jinsha' | 'princess' | 'her'
export const brands: { id: BrandId; name: string; english: string; description: string; story: string; className: string }[] = [
  { id: 'jinsha', name: '金沙唐韵', english: 'JINSHA TANGYUN', description: '把巧家的风景，装进一份甜', story: '以传统小碗红糖为底色，将巧家的文化与风景融入伴手礼。传承经典，也为日常带来新的甜蜜选择。', className: 'jinsha' },
  { id: 'princess', name: '上古·红糖公主', english: 'SUGAR PRINCESS', description: '年轻的甜，自有主张', story: '面向年轻群体的红糖品牌，用国潮与鲜明的包装表达，让传统红糖成为日常生活里的小小欢喜。', className: 'princess' },
  { id: 'her', name: '呵糖', english: 'HER SUGAR', description: '温柔的甜，留一份给自己', story: '关注女性日常生活的红糖品牌。产妇红糖系列提供单盒、手提袋与礼盒包装，让一份心意有不同的表达。', className: 'her' },
]
export const brandById = (id: BrandId) => brands.find(b => b.id === id)!
export const culture = {
  title: '一碗红糖，一方水土',
  text: '在云南巧家金沙江河谷，甘蔗与阳光相遇。压榨、过滤、熬制、装碗，五口连环锅的柴火与糖匠的耐心，留下小碗红糖特有的蔗香与焦香。',
  motto: '采初蔗之纯 · 传古法之秘 · 制良心之糖',
}
