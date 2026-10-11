import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
async function skipWelcome(page:Page){await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))}

test('brand story and guide use source material and lead into the existing shopping loop',async({page})=>{
  await skipWelcome(page);await page.goto('/');await page.getByRole('link',{name:'品牌故事',exact:true}).click()
  await expect(page.getByRole('heading',{name:'一碗糖，记住巧家的味道'})).toBeVisible()
  await expect(page.getByText('巧家县万华食品有限责任公司',{exact:true})).toBeVisible()
  await expect(page.locator('.story-craft')).toContainText('五口连环锅柴火熬制、十八道工序')
  await expect(page.locator('.story-brand')).toHaveCount(3)
  await page.locator('.story-brand').first().getByRole('link',{name:'浏览这个品牌'}).click();await expect(page).toHaveURL(/brand=jinsha/)
  await page.goto('/guide');await expect(page.locator('.guide-steps li')).toHaveCount(6);await page.getByRole('link',{name:'浏览商品',exact:true}).click();await expect(page).toHaveURL(/\/category$/)
})

test('new invitation uses official logo and IP, persists, and deliberate restore enables it again',async({page})=>{
  await page.goto('/');await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.welcome-brand img')).toHaveAttribute('src','/images/wanhua-official-logo.webp');await expect(page.locator('.welcome-modal .ip-portrait img')).toHaveAttribute('src','/images/wan-qiaoqiao-ip-character-sheet.webp')
  await page.getByRole('button',{name:'先逛逛商城',exact:true}).click();await page.reload();await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto('/member/demo');await page.getByRole('button',{name:'恢复初始演示数据',exact:true}).click();await page.getByRole('button',{name:'确认修改',exact:true}).click();await page.goto('/');await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'先逛逛商城',exact:true}).click();await page.reload();await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('live payment crossing a tier shows IP upgrade once and preserves order reward after reload',async({page})=>{
  await skipWelcome(page);await page.goto('/member');await expect(page.locator('.membership-card')).toBeVisible()
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('wanhua-member-v1')!);s.growth=190;localStorage.setItem('wanhua-member-v1',JSON.stringify(s))})
  await page.goto('/product/pure');await page.getByRole('button',{name:'立即购买',exact:true}).click();await page.getByRole('button',{name:'提交订单',exact:true}).click();await page.getByRole('button',{name:'确认模拟支付'}).click()
  await expect(page.getByRole('heading',{name:'支付成功',exact:true})).toHaveText('下单成功啦！')
  const dialog=page.getByRole('dialog',{name:'会员互动奖励'});await expect(dialog.getByRole('heading',{name:'恭喜升级！'})).toBeVisible();await expect(dialog.locator('.upgrade-announcement')).toContainText('糖心会员');await expect(dialog.locator('.reward-ip img')).toBeVisible()
  await dialog.getByRole('button',{name:'开心收下',exact:true}).click();await page.reload();await expect(dialog).toHaveCount(0)
  await expect(page.locator('.order-reward-card')).toContainText('本次获得 56 积分');await expect(page.locator('.order-reward-card')).toContainText('成长值 +46')
  await page.getByRole('link',{name:'去会员中心看看积分',exact:true}).click();await expect(page.locator('.member-tier strong')).toHaveText('糖心会员');await page.reload();await expect(dialog).toHaveCount(0)
})

for(const width of [375,390,430]){
  test(`final presentation, banner separation, tap targets and resource health at ${width}px`,async({page})=>{
    await skipWelcome(page);await page.setViewportSize({width,height:844});const errors:string[]=[]
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text())});page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:4173/')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)})
    for(const route of ['/','/story','/guide','/category','/product/qiaojia-gift','/cart','/member','/member/sign','/member/coupons','/member/blindbox','/member/benefits','/orders']){
      await page.goto(route);await expect(page.locator('.shop-header')).toBeVisible()
      if(route==='/')for(let i=1;i<=3;i++){
        await page.getByRole('button',{name:`切换到第${i}张 Banner`}).click()
        const text=await page.locator('.hero-copy').boundingBox(),image=await page.locator('.hero-product,.hero-ip').boundingBox();expect(text!.x+text!.width).toBeLessThanOrEqual(image!.x+2)
      }
      const shell=await page.locator('.phone-shell').boundingBox();expect(shell!.width).toBe(width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      for(const img of await page.locator('img:visible').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true)}
      for(const btn of await page.locator('.primary-button:visible,.quantity-control button:visible,.flavor-options button:visible').all()){const b=await btn.boundingBox();expect(b!.height).toBeGreaterThanOrEqual(38)}
      await page.evaluate(()=>window.scrollTo(0,0));if(['/','/story','/guide','/member','/member/blindbox','/member/coupons'].includes(route))await page.screenshot({path:`/tmp/wanhua-stage4-${route==='/'?'home':route.split('/').pop()}-${width}.png`,fullPage:true,animations:'disabled'})
    }
    expect(errors).toEqual([])
  })
}

test('cart toast has original IP and reduced motion disables reward animations',async({page})=>{
  await skipWelcome(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/product/pure');await page.getByRole('button',{name:'加入购物车',exact:true}).click();await expect(page.locator('.toast[role=status]')).toContainText('已加入购物车');await expect(page.locator('.toast .ip-portrait img')).toBeVisible()
  await page.goto('/member/sign');await page.getByRole('button',{name:'签到领取5积分'}).click();await expect(page.getByRole('dialog')).toBeVisible();expect(await page.locator('.member-dialog').evaluate(el=>getComputedStyle(el).animationName)).toBe('none')
})

test('quiz crossing a tier keeps the earned points visible alongside the upgrade',async({page})=>{
  await skipWelcome(page);await page.goto('/member');await expect(page.locator('.membership-card')).toBeVisible();await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('wanhua-member-v1')!);s.growth=195;s.quizVisited=true;localStorage.setItem('wanhua-member-v1',JSON.stringify(s))});await page.reload()
  await page.getByRole('button',{name:'我已完成测试，领取20积分'}).click();const dialog=page.getByRole('dialog',{name:'会员互动奖励'});await expect(dialog.getByRole('heading',{name:'恭喜升级！'})).toBeVisible();await expect(dialog.locator('.reward-values')).toBeVisible();await expect(dialog.locator('.reward-values')).toContainText('+20');await expect(dialog.locator('.reward-values')).toContainText('+10');await expect(dialog.locator('.upgrade-announcement')).toContainText('糖心会员')
  await dialog.getByRole('button',{name:'开心收下',exact:true}).click();await page.reload();await expect(dialog).toHaveCount(0)
})

test('favorite storage failure shows feedback without pretending the item was saved',async({page})=>{
  await skipWelcome(page);await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='wanhua-favorites-v1')throw new DOMException('quota','QuotaExceededError');return original.call(this,key,value)}})
  await page.goto('/product/pure');const favorite=page.getByRole('button',{name:'收藏商品',exact:true});await expect(favorite).toHaveAttribute('aria-pressed','false');await favorite.click();await expect(page.locator('.toast')).toContainText('未能保存收藏');await expect(favorite).toHaveAttribute('aria-pressed','false');expect(await page.evaluate(()=>localStorage.getItem('wanhua-favorites-v1'))).toBeNull()
})
