import type { BrandId } from './site'
export type Product = { id: string; brand: BrandId; name: string; series: string; spec: string; price: number; flavors: string[]; flavorKind: '口味' | '配料包'; image: string; page: number; tags: string[]; description: string; scenes: string[]; groups: string[] }
const row = (id: string, brand: BrandId, name: string, series: string, spec: string, price: number, flavors: string[], image: string, page: number, tags: string[], scenes: string[], groups: string[], flavorKind: Product['flavorKind'] = '口味'): Product => ({ id, brand, name, series, spec, price, flavors, flavorKind, image: `/images/${image}.jpeg`, page, tags, scenes, groups, description: `${name}，${spec}。源自巧家小碗红糖的甜蜜风味，${flavorKind === '配料包' ? '搭配不同配料包，为日常冲泡增添风味。' : '用一份蔗香，为日常留一点温暖。'}` })
export const products: Product[] = [
  row('qiaojia-gift','jinsha','遇见巧家·伴手礼系列','遇见巧家·伴手礼','720g · 15g×48枚',88,['原味'],'qiaojia-gift',4,['文创伴手礼','锡纸包装'],['旅行伴手礼','节日心意','文化礼赠'],['recommend','gifts']),
  row('golden-gift','jinsha','糖韵金典系列','糖韵金典','1020g · 68颗',128,['原味'],'golden-gift',5,['精致礼盒','锡纸包装'],['节日礼赠','家庭分享'],['gifts','popular']),
  row('china-red','jinsha','中国红大众系列家族经济实惠装','中国红大众','1000g/件',68,['原味','老姜','柠檬','大枣枸杞','玫瑰','茉莉','山楂','野菊花','青山绿水','苦荞'],'china-red',7,['独立包装','家庭分享'],['家庭冲泡','日常烹饪'],['popular','daily'],'配料包'),
  row('fashion','jinsha','时尚女人系列','时尚女人','250g/罐',38,['原味','老姜'],'fashion',8,['轻巧罐装','锡纸包装'],['办公室下午茶','日常冲泡'],['recommend','popular']),
  row('family','jinsha','家庭经济实惠装','家庭经济实惠装','500g/袋',38,['老姜','大枣枸杞','柠檬','山楂','玫瑰','茉莉'],'family',9,['独立包装','日常好糖'],['家庭冲泡','早餐搭配'],['daily'],'配料包'),
  row('pure','jinsha','纯真系列','纯真','180g/袋',18,['老姜','玫瑰','茉莉','大枣枸杞','山楂','野菊花','柠檬','青山绿水','苦荞'],'pure',11,['随身小袋','独立包装'],['通勤随身','办公室茶饮'],['daily','recommend'],'配料包'),
  row('tang-lady','jinsha','唐风佳人系列','唐风佳人','500g/罐',68,['原味','老姜','玫瑰'],'tang-lady',12,['文化插画','锡纸包装'],['下午茶','馈赠亲友'],['gifts','recommend']),
  row('orange-family','jinsha','家庭装橙色系列','家庭装橙色','250g/袋',28,['原味'],'orange-family',13,['日常冲泡','独立包装'],['家庭早餐','日常烹饪'],['popular','daily']),
  row('sunshine','princess','甜蜜阳光普装系列','甜蜜阳光普装','2500g',88,['原味'],'sunshine',2,['散称小粒','分享装'],['家庭烹饪','多人分享'],['daily']),
  row('princess-gift','princess','公主美丽礼惠系列','公主美丽礼惠','2500g',118,['原味'],'princess-gift',6,['独立包装','大份分享'],['家庭分享','朋友心意'],['gifts']),
  row('princess-jar','princess','公主系列实惠装','公主系列实惠装','200g/罐',19.9,['原味','老姜'],'princess-jar',10,['年轻国潮','轻巧罐装'],['宿舍冲泡','午后休息'],['recommend','popular','daily']),
  row('her-364','her','产妇红糖系列','产妇红糖','364g · 单盒装',48,['原味'],'maternal',3,['独立包装','单盒装'],['日常冲泡','温暖心意'],['recommend']),
  row('her-728','her','产妇红糖系列','产妇红糖','728g · 手提袋装',78,['原味'],'maternal',3,['独立包装','手提袋装'],['亲友关怀','礼赠分享'],['gifts']),
  row('her-1456','her','产妇红糖系列','产妇红糖','1456g · 礼盒装',128,['原味'],'maternal',3,['独立包装','礼盒装'],['节日心意','亲友关怀'],['gifts']),
]
export const homeSections = [
  { id: 'recommend', title: '为你推荐', subtitle: '挑一份属于自己的甜', english: 'SWEET PICKS' },
  { id: 'popular', title: '本周热销', subtitle: '本周灵感清单 · 比赛演示排序', english: 'THIS WEEK' },
  { id: 'gifts', title: '人气礼盒', subtitle: '把心意，装进巧家的风景', english: 'A SWEET GIFT' },
  { id: 'daily', title: '日常好糖', subtitle: '一杯一碗，都是生活的小确幸', english: 'EVERYDAY SWEET' },
]
export const newArrivals = [
  { name: '红糖咖啡', description: '巧家红糖 × 云南小粒咖啡', note: '企业资料提及，上市状态与规格待确认' },
  { name: '天麻红糖', description: '云南风味的跨界灵感', note: '企业资料提及，上市状态与规格待确认' },
]
