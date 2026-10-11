import { test,expect } from '@playwright/test'
import type { Page } from '@playwright/test'
async function init(page:Page){await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))}
const member=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('wanhua-member-v1')||'null'))
async function closeReward(page:Page){await page.getByRole('dialog',{name:'会员互动奖励'}).getByRole('button',{name:/开心收下|收好这份甜/}).click()}
async function demo(page:Page,label:string){await page.goto('/member/demo');await page.getByRole('button',{name:label,exact:true}).click();await expect(page.getByRole('dialog',{name:'确认演示设置'})).toBeVisible();await page.getByRole('button',{name:'确认修改',exact:true}).click()}
async function buy(page:Page,id='qiaojia-gift',quantity=1){await page.goto(`/product/${id}`);for(let i=1;i<quantity;i++)await page.getByRole('button',{name:'增加数量'}).click();await page.getByRole('button',{name:'立即购买',exact:true}).click()}
async function pay(page:Page){await page.getByRole('button',{name:'提交订单',exact:true}).click();await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page.getByRole('heading',{name:'支付成功',exact:true})).toBeVisible();if(await page.getByRole('dialog',{name:'会员互动奖励'}).count())await page.getByRole('button',{name:'开心收下',exact:true}).click()}

test('quiz entry and manual demo claim award once, persist and never claim external sync',async({page})=>{
  await init(page);await page.route('https://wanhua-red-sugar-quiz.pages.dev/**',r=>r.fulfill({contentType:'text/html',body:'<h1>External quiz navigation fixture</h1>'}))
  await page.goto('/member/activities');await expect(page.getByRole('button',{name:'我已完成测试，领取20积分'})).toBeDisabled()
  await page.getByRole('link',{name:'进入红糖属性测试'}).click();await expect(page).toHaveURL('https://wanhua-red-sugar-quiz.pages.dev/')
  await page.goto('/');await expect(page.getByRole('button',{name:'我已完成测试，领取20积分'})).toBeEnabled();await page.getByRole('button',{name:'我已完成测试，领取20积分'}).click();await expect(page.getByRole('dialog')).toContainText('+20');await closeReward(page)
  expect(await member(page)).toMatchObject({points:120,growth:10,quizRewardClaimed:true,quizVisited:true})
  await page.goto('/member');await expect(page.getByRole('button',{name:'测试奖励已领取'})).toBeDisabled();await expect(page.getByText('商城未读取外部测试结果，也未实时同步。')).toBeVisible()
  await page.reload();await page.getByRole('button',{name:'测试奖励已领取'}).evaluate((b:HTMLButtonElement)=>b.click());expect((await member(page)).pointHistory.filter((h:any)=>h.eventKey==='quiz')).toHaveLength(1)
})

test('sign-in is once per Beijing date and only adds points, including next-day rollover',async({page})=>{
  await init(page);await page.clock.install({time:new Date('2026-10-12T12:00:00+08:00')});await page.goto('/member/sign')
  await page.getByRole('button',{name:'签到领取5积分'}).click();await closeReward(page);expect(await member(page)).toMatchObject({points:105,growth:0,signedDates:['2026-10-12']})
  await page.reload();await expect(page.getByRole('button',{name:'今日已签到',exact:true})).toBeDisabled()
  await page.clock.setSystemTime(new Date('2026-10-13T00:01:00+08:00'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('button',{name:'签到领取5积分'})).toBeEnabled();await page.getByRole('button',{name:'签到领取5积分'}).click();await closeReward(page)
  expect(await member(page)).toMatchObject({points:110,growth:0,signedDates:['2026-10-12','2026-10-13']})
})

test('order rewards floor actual payment, first bonus once, automatic upgrade and replay protection',async({page})=>{
  await init(page);await buy(page);await pay(page);await expect(page.locator('.order-reward-card')).toContainText('本次获得 121 积分');await expect(page.locator('.order-reward-card')).toContainText('成长值 +111')
  expect(await member(page)).toMatchObject({points:221,growth:111,firstOrderRewardClaimed:true});const firstUrl=page.url();await page.reload();expect((await member(page)).points).toBe(221)
  await buy(page);await pay(page);await expect(page.locator('.order-reward-card')).toContainText('本次获得 96 积分');await expect(page.locator('.order-level-upgrade')).toContainText('糖心会员')
  const state=await member(page);expect(state).toMatchObject({points:317,growth:207});expect(state.pointHistory.filter((h:any)=>h.source==='首次完成订单额外奖励')).toHaveLength(1)
  await page.goto(firstUrl);await page.reload();expect((await member(page)).points).toBe(317)
  await page.goto('/member');await expect(page.locator('.member-tier strong')).toHaveText('糖心会员');await expect(page.getByRole('progressbar',{name:'会员成长进度'})).toHaveAttribute('aria-valuenow','2')
})

test('fractional order amount earns floor integer points and growth',async({page})=>{
  await init(page);await buy(page,'princess-jar',3);await expect(page.locator('.bar-amount strong')).toHaveText('¥62.70');await pay(page)
  await expect(page.locator('.order-reward-card')).toContainText('本次获得 92 积分');await expect(page.locator('.order-reward-card')).toContainText('成长值 +82');expect(await member(page)).toMatchObject({points:192,growth:82})
})

test('blind visit reward once, weighted draw, repeat collection and growth independent of spending',async({page})=>{
  await init(page);await page.addInitScript(()=>{crypto.getRandomValues=((array:any)=>{array.fill(0);return array}) as typeof crypto.getRandomValues})
  await page.route('https://wanqiaoqiao-blindbox.pages.dev/**',r=>r.fulfill({contentType:'text/html',body:'<h1>External blindbox navigation fixture</h1>'}))
  await page.goto('/member/blindbox');await page.getByRole('link',{name:/进入盲盒游戏/}).click();await expect(page).toHaveURL('https://wanqiaoqiao-blindbox.pages.dev/')
  await page.goto('/member/blindbox');expect((await member(page)).points).toBe(110);await page.getByRole('link',{name:/进入盲盒游戏/}).click();await page.goto('/member/blindbox');expect((await member(page)).points).toBe(110)
  await demo(page,'设置为糖心会员');await page.goto('/member/blindbox');await page.getByRole('button',{name:'兑换收藏抽取'}).click();await page.getByRole('button',{name:'确认兑换100积分'}).click();await expect(page.getByRole('dialog',{name:'会员互动奖励'})).toContainText('金沙小巧');await closeReward(page)
  expect(await member(page)).toMatchObject({points:10,growth:200,blindboxCollection:['jinsha']});await expect(page.locator('.collection-card.unlocked')).toHaveCount(1)
  await demo(page,'恢复默认积分');await page.goto('/member/blindbox');await page.getByRole('button',{name:'兑换收藏抽取'}).click();await page.getByRole('button',{name:'确认兑换100积分'}).click();await expect(page.getByRole('dialog')).toContainText('获得重复款');await closeReward(page)
  await page.reload();const state=await member(page);expect(state).toMatchObject({points:0,growth:200,blindboxCollection:['jinsha']});expect(state.draws).toHaveLength(2);expect(state.draws[0].duplicate).toBe(true);await expect(page.getByRole('button',{name:'兑换收藏抽取'})).toBeDisabled()
  await page.goto('/member');await expect(page.locator('.member-tier strong')).toHaveText('糖心会员')
})

test('hidden variant uses existing IP pose and visible 3 percent rule',async({page})=>{
  await init(page);await page.addInitScript(()=>{crypto.getRandomValues=((array:any)=>{array.fill(0xffffffff);return array}) as typeof crypto.getRandomValues})
  await page.goto('/member/blindbox');await expect(page.getByText(/隐藏款·金糖巧巧 3%/)).toBeVisible();await page.getByRole('button',{name:'兑换收藏抽取'}).click();await page.getByRole('button',{name:'确认兑换100积分'}).click();await expect(page.getByRole('dialog')).toContainText('隐藏款·金糖巧巧');await closeReward(page);expect((await member(page)).blindboxCollection).toEqual(['gold'])
})

test('redeemed coupon debits points, goes into shared wallet, is used in checkout and cannot be reused',async({page})=>{
  await init(page);await demo(page,'设置为金沙会员');await page.goto('/member/coupons');await page.getByRole('button',{name:'兑换满 59 减 5',exact:true}).click();await closeReward(page)
  const state=await member(page),coupon=state.coupons.find((c:any)=>c.source==='积分兑换');expect(state).toMatchObject({points:0,growth:600});expect(coupon).toBeTruthy();await expect(page.locator(`[data-wallet-coupon="${coupon.id}"]`)).toContainText('积分兑换')
  await buy(page,'princess-jar',3);await page.getByRole('radio',{name:'满 59 减 5 · 积分兑换',exact:true}).check();await expect(page.locator('.bar-amount strong')).toHaveText('¥62.70');await pay(page)
  expect((await member(page)).coupons.find((c:any)=>c.id===coupon.id).status).toBe('used')
  await page.goto('/member/coupons');await page.getByRole('button',{name:/已使用/}).click();await expect(page.locator(`[data-wallet-coupon="${coupon.id}"]`)).toContainText('已使用')
  await buy(page,'princess-jar',3);await expect(page.getByRole('radio',{name:'满 59 减 5 · 积分兑换',exact:true})).toHaveCount(0)
})

test('all coupon tiers debit configured cost and expired status is explicit',async({page})=>{
  await init(page);await buy(page,'sunshine',5);await page.getByRole('radio',{name:'不使用优惠券'}).check();await pay(page)
  await page.goto('/member/coupons');for(const title of ['满 59 减 5','满 99 减 10']){await page.getByRole('button',{name:`兑换${title}`,exact:true}).click();await closeReward(page)}
  // Initial100 + order440 + first30 -100 -180 =290; third coupon cannot overdraw.
  expect((await member(page)).points).toBe(290);await expect(page.getByRole('button',{name:'兑换满 199 减 25'})).toBeDisabled()
  await page.goto('/member/sign');await page.getByRole('button',{name:'签到领取5积分'}).click();await closeReward(page)
  await buy(page,'pure');await pay(page);await page.goto('/member/coupons');await page.getByRole('button',{name:'兑换满 199 减 25'}).click();await closeReward(page)
  expect((await member(page)).coupons.filter((c:any)=>c.source==='积分兑换')).toHaveLength(3)
  await page.getByRole('button',{name:/已过期/}).click();await expect(page.locator('.wallet-coupon.expired')).toHaveCount(1)
})

test('personality is manual and persists, and recommendation uses real catalog flavors',async({page})=>{
  await init(page);await page.goto('/member/activities');await page.getByRole('button',{name:/温柔花香型/}).click();await expect(page.locator('.personality-section .product-card')).toHaveCount(2);await expect(page.locator('.personality-section')).toContainText('纯真系列');await expect(page.locator('.personality-section')).toContainText('唐风佳人系列')
  await page.reload();await expect(page.getByRole('button',{name:/温柔花香型/})).toHaveAttribute('aria-pressed','true');expect((await member(page)).sugarPersonality).toBe('floral')
  await page.getByRole('button',{name:/国潮经典型/}).click();await expect(page.locator('.personality-section')).toContainText('遇见巧家·伴手礼系列');await expect(page.locator('.personality-section')).toContainText('糖韵金典系列')
})

test('four derived levels, confirmations, reset to initial member without replaying past orders',async({page})=>{
  await init(page);await page.goto('/member');await page.getByRole('link',{name:'比赛演示设置 · v1.0'}).click()
  await page.getByRole('button',{name:'设置为金沙会员',exact:true}).click();await page.getByRole('button',{name:'取消',exact:true}).click();expect((await member(page)).growth).toBe(0)
  for(const [label,growth] of [['糖小友',0],['糖心会员',200],['金沙会员',600],['巧家臻享会员',1500]] as const){await demo(page,'设置为'+label);await page.goto('/member');await expect(page.locator('.member-tier strong')).toHaveText(label);expect((await member(page)).growth).toBe(growth)}
  await page.goto('/member/sign');await page.getByRole('button',{name:'签到领取5积分'}).click();await closeReward(page);await buy(page);await pay(page)
  await demo(page,'恢复初始演示数据');await page.goto('/member');expect(await member(page)).toMatchObject({points:100,growth:0,signedDates:[],quizVisited:false,quizRewardClaimed:false,blindboxCollection:[],firstOrderRewardClaimed:false,sugarPersonality:null})
  await page.reload();expect((await member(page)).points).toBe(100);await page.goto('/orders');await expect(page.locator('.order-list-card')).toHaveCount(1)
  await buy(page);await pay(page);expect((await member(page)).points).toBe(221)
})

test('reset individual states and quiz re-trigger require deliberate demo confirmation',async({page})=>{
  await init(page);await page.route('https://wanhua-red-sugar-quiz.pages.dev/**',r=>r.fulfill({body:'quiz'}));await page.goto('/member/activities');await page.getByRole('link',{name:'进入红糖属性测试'}).click();await page.goto('/member/activities');await page.getByRole('button',{name:'我已完成测试，领取20积分'}).click();await closeReward(page)
  await demo(page,'重新触发首次测试奖励');await page.goto('/member/activities');await expect(page.getByRole('button',{name:'我已完成测试，领取20积分'})).toBeDisabled()
  await page.getByRole('link',{name:'进入红糖属性测试'}).click();await page.goto('/member/activities');await page.getByRole('button',{name:'我已完成测试，领取20积分'}).click();await closeReward(page);expect((await member(page)).points).toBe(140)
  await page.goto('/member/sign');await page.getByRole('button',{name:'签到领取5积分'}).click();await closeReward(page);await demo(page,'清空签到状态');await page.goto('/member/sign');await expect(page.getByRole('button',{name:'签到领取5积分'})).toBeEnabled()
  await page.goto('/member/blindbox');await page.getByRole('button',{name:'兑换收藏抽取'}).click();await page.getByRole('button',{name:'确认兑换100积分'}).click();await closeReward(page);await demo(page,'清空盲盒收藏');expect((await member(page)).blindboxCollection).toEqual([])
  await demo(page,'重置演示账号');expect(await member(page)).toMatchObject({points:100,growth:0,quizRewardClaimed:false,signedDates:[],draws:[]})
})

test('member storage failure does not spend points or unlock a collectible',async({page})=>{
  await init(page);await page.goto('/member/blindbox');await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='wanhua-member-v1')throw new DOMException('quota','QuotaExceededError');original.call(this,key,value)}})
  await page.getByRole('button',{name:'兑换收藏抽取'}).click();await page.getByRole('button',{name:'确认兑换100积分'}).click();await expect(page.locator('.toast')).toContainText('会员数据未能保存');expect(await member(page)).toMatchObject({points:100,blindboxCollection:[],draws:[]});await expect(page.getByRole('dialog',{name:'会员互动奖励'})).toHaveCount(0)
})

test('member ledger write recovery reconciles order bonus and coupon consumption once',async({page})=>{
  await init(page);await buy(page);await page.getByRole('button',{name:'提交订单',exact:true}).click()
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='wanhua-member-v1')throw new DOMException('quota','QuotaExceededError');original.call(this,key,value)}})
  await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page.getByRole('alert')).toContainText('会员数据未能保存');expect((await member(page)).points).toBe(100)
  await page.reload();await expect(page).toHaveURL(/\/payment-success\//);expect(await member(page)).toMatchObject({points:221,growth:111});await page.reload();expect((await member(page)).pointHistory.filter((h:any)=>h.source==='商城购物')).toHaveLength(1)
})

test('favorites reuse existing storage and cancel updates the collection page',async({page})=>{
  await init(page);await page.goto('/product/fashion');await page.getByRole('button',{name:'收藏商品',exact:true}).click();await page.goto('/member/favorites');await expect(page.locator('.product-card')).toHaveCount(1);await page.getByRole('button',{name:'收藏时尚女人系列'}).click();await expect(page.getByText('留一颗爱心，记住一份甜')).toBeVisible();await page.reload();await expect(page.locator('.product-card')).toHaveCount(0)
})

for(const width of [375,390,430]){
  test(`member pages, original IP sprites and overlays fit ${width}px`,async({page})=>{
    await init(page);await page.setViewportSize({width,height:812});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
    for(const route of ['/member','/member/points','/member/sign','/member/coupons','/member/favorites','/member/blindbox','/member/activities','/member/benefits','/member/demo']){
      await page.goto(route);await expect(page.locator('.shop-header')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      for(const img of await page.locator('.ip-sprite img').all())await expect.poll(()=>img.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth===1672)).toBe(true)
      if(['/member','/member/blindbox','/member/benefits','/member/coupons'].includes(route))await page.screenshot({path:`/tmp/wanhua-stage3-${route.split('/').pop()}-${width}.png`,fullPage:true})
    }
    await page.goto('/member/sign');await page.getByRole('button',{name:'签到领取5积分'}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`/tmp/wanhua-stage3-reward-${width}.png`});await closeReward(page)
    expect(errors).toEqual([])
  })
}
