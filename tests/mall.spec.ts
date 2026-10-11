import { test, expect } from '@playwright/test'
async function skipWelcome(page: import('@playwright/test').Page){ await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true')) }
test('first invitation, focus loop, dismissal persistence and live activity links',async({page})=>{
  await page.goto('/')
  const modal=page.getByRole('dialog');await expect(modal).toBeVisible()
  await page.keyboard.press('Shift+Tab');await expect(modal.getByRole('button',{name:'先逛逛商城'})).toBeFocused()
  await page.keyboard.press('Tab');await expect(modal.getByRole('button',{name:'关闭邀请弹窗'})).toBeFocused()
  await expect(modal.getByRole('link',{name:'立即测试'})).toHaveAttribute('href','https://wanhua-red-sugar-quiz.pages.dev/')
  await modal.getByRole('button',{name:'先逛逛商城'}).click()
  await expect(modal).toHaveCount(0)
  await page.reload();await expect(modal).toHaveCount(0)
  await expect(page.getByRole('link',{name:'红糖属性测试'})).toHaveAttribute('href','https://wanhua-red-sugar-quiz.pages.dev/')
  await expect(page.locator('.activity-card.box')).toHaveAttribute('href','https://wanqiaoqiao-blindbox.pages.dev/')
  await page.getByRole('button',{name:'切换到第2张 Banner'}).click()
  await expect(page.locator('.hero-banner')).toContainText('测测你的红糖属性')
  await page.getByRole('button',{name:'切换到第3张 Banner'}).click()
  await expect(page.locator('.hero-link')).toHaveAttribute('href','https://wanqiaoqiao-blindbox.pages.dev/')
})
test('brand, series, search and price sorting use real catalog data',async({page})=>{
  await skipWelcome(page);await page.goto('/category')
  await expect(page.locator('.product-card')).toHaveCount(14)
  await page.getByRole('button',{name:'呵糖',exact:true}).click();await expect(page.locator('.product-card')).toHaveCount(3)
  await page.getByRole('combobox',{name:'按系列筛选'}).selectOption('产妇红糖')
  await page.getByRole('combobox',{name:'商品排序'}).selectOption('desc');await expect(page.locator('.product-copy').first()).toContainText('1456g')
  await page.getByRole('textbox',{name:'搜索商品'}).fill('728g');await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByRole('textbox',{name:'搜索商品'}).fill('不存在的甜');await expect(page.getByText('还没找到这份甜')).toBeVisible()
  await page.getByRole('button',{name:'重置筛选'}).click();await expect(page.locator('.product-card')).toHaveCount(14)
})
test('flavor, quantities, favorite, cart and immediate-buy route persist',async({page})=>{
  await skipWelcome(page);await page.goto('/product/fashion')
  await page.getByRole('button',{name:'老姜',exact:true}).click()
  await expect(page.getByRole('button',{name:'减少数量'})).toBeDisabled()
  await page.getByRole('button',{name:'增加数量'}).click();await expect(page.locator('.quantity-control output')).toHaveText('2')
  await page.getByRole('button',{name:'收藏商品',exact:true}).click();await expect(page.getByRole('button',{name:'收藏商品',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'加入购物车',exact:true}).click();await expect(page.locator('.toast')).toContainText('已加入购物车')
  await page.getByRole('button',{name:'立即购买',exact:true}).click();await expect(page).toHaveURL(/\/checkout\//)
  await page.getByRole('link',{name:'购物车',exact:true}).last().click()
  await expect(page.locator('.cart-row')).toContainText('老姜 · 数量 2')
  await page.reload();await expect(page.locator('.cart-row')).toContainText('老姜 · 数量 2')
  await page.getByRole('link',{name:'会员中心',exact:true}).click();await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByRole('button',{name:'收藏时尚女人系列'}).click();await expect(page.locator('.favorites-empty')).toBeVisible()
})
for(const width of [375,390,430,1280]){
  test(`layout, image loading and all page routes at ${width}px`,async({page})=>{
    await skipWelcome(page);await page.setViewportSize({width,height:844})
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
    for(const route of ['/','/category','/product/qiaojia-gift','/cart','/member']){
      await page.goto(route);await expect(page.locator('.shop-header')).toBeVisible()
      await expect(page.getByRole('navigation',{name:'底部导航'})).toBeVisible()
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      const box=await page.locator('.phone-shell').boundingBox();expect(box!.width).toBeLessThanOrEqual(430)
      // Lazy images are scrolled into view and checked, not just their file URLs.
      for(const img of await page.locator('img:visible').all()){
        await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true)
      }
      if(route==='/product/qiaojia-gift'){
        const purchase=await page.locator('.purchase-bar').boundingBox();const nav=await page.locator('.bottom-nav').boundingBox();expect(purchase!.y+purchase!.height).toBeLessThanOrEqual(nav!.y+1)
      }
      await page.evaluate(()=>window.scrollTo(0,0))
      if(width===390&&route==='/')await page.screenshot({path:'/tmp/wanhua-home-mobile.png',fullPage:true})
      if(width===375&&route==='/product/qiaojia-gift')await page.screenshot({path:'/tmp/wanhua-detail-mobile.png',fullPage:true})
    }
    expect(errors).toEqual([])
  })
}
test('all 14 product detail routes show matched source and selectable flavors',async({page})=>{
  await skipWelcome(page);await page.goto('/category')
  const links=await page.locator('.product-copy').evaluateAll(nodes=>nodes.map(n=>(n as HTMLAnchorElement).pathname))
  expect(links).toHaveLength(14)
  for(const url of links){await page.goto(url);await expect(page.locator('.detail-summary h1')).not.toBeEmpty();await expect(page.locator('.detail-info')).toContainText('企业产品展示册');await expect(page.getByRole('button',{name:'加入购物车',exact:true})).toBeVisible();await expect(page.locator('.flavor-options button').first()).toHaveAttribute('aria-pressed','true')}
})
test('unknown product and malformed local storage recover gracefully',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('wanhua-welcome-v1','true');localStorage.setItem('wanhua-cart-v1','{"broken":true}');localStorage.setItem('wanhua-favorites-v1','[{},null,"unknown"]')})
  await page.goto('/cart');await expect(page.getByText('购物袋里，还缺一点甜')).toBeVisible()
  await page.goto('/product/unknown');await expect(page.getByText('这份甜暂时找不到')).toBeVisible()
})

test('activity and invitation buttons trigger real browser navigation to configured destinations',async({page})=>{
  // Intercept only destination responses: verifies clicks and URL navigation, not external uptime.
  await page.route('https://wanhua-red-sugar-quiz.pages.dev/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Quiz navigation destination</h1>'}))
  await page.route('https://wanqiaoqiao-blindbox.pages.dev/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Blindbox navigation destination</h1>'}))
  await page.goto('/');await page.getByRole('dialog').getByRole('link',{name:'立即测试'}).click();await expect(page).toHaveURL('https://wanhua-red-sugar-quiz.pages.dev/')
  await page.goto('/');await page.locator('.activity-card.quiz').click();await expect(page).toHaveURL('https://wanhua-red-sugar-quiz.pages.dev/')
  await page.goto('/');await page.locator('.activity-card.box').click();await expect(page).toHaveURL('https://wanqiaoqiao-blindbox.pages.dev/')
})
