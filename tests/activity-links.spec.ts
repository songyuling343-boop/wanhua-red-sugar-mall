import { test,expect } from '@playwright/test'
import { openActivity } from './activity-helpers'
const quiz='https://wanhua-red-sugar-quiz.pages.dev/',blind='https://wanqiaoqiao-blindbox.pages.dev/'

test('every external activity entry opens a separate page and preserves shop state',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))
  for(const url of [quiz,blind])await page.context().route(url+'**',r=>r.fulfill({contentType:'text/html',body:'<h1>External activity fixture</h1>'}))
  const selector=`a[href="${quiz}"],a[href="${blind}"]`
  let checked=0
  for(const route of ['/','/category','/member','/member/activities','/member/blindbox']){
    await page.goto(route);await expect(page.locator('.shop-header')).toBeVisible()
    for(const link of await page.locator(selector).all()){
      await openActivity(page,link,(await link.getAttribute('href'))!);checked++
    }
    if(route==='/')for(const i of [2,3]){
      await page.getByRole('button',{name:`切换到第${i}张 Banner`}).click();await openActivity(page,page.locator('.hero-link'),i===2?quiz:blind);checked++
      if(i===3){await openActivity(page,page.locator('.quiz-enter-link'),quiz);checked++}
    }
    await expect(page.getByText('活动将在新页面打开，关闭后可继续回到商城浏览',{exact:true}).first()).toBeVisible()
  }
  expect(checked).toBe(12)
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('wanhua-member-v1')!))
  expect(state.quizVisited).toBe(true);expect(state.blindboxVisitRewardClaimed).toBe(true);expect(state.points).toBe(110)
  expect(state.pointHistory.filter((h:{eventKey:string})=>h.eventKey==='blind-visit')).toHaveLength(1)
  expect(page.context().pages()).toHaveLength(1)
})

test('home and brand story share the clean three-brand image with its original ratio',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))
  for(const route of ['/','/story']){
    await page.goto(route);await expect(page.locator('.shop-header')).toBeVisible()
    if(route==='/')await page.getByText('认识万华的三个品牌',{exact:true}).click()
    const image=page.locator('img[src="/images/three-sub-brands-clean.webp"]');await image.scrollIntoViewIfNeeded()
    await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth===960&&i.naturalHeight===540)).toBe(true)
    const box=await image.boundingBox();expect(box!.width/box!.height).toBeCloseTo(960/540,1)
    await expect(page.locator('img[src*="three-sub-brands-showcase"]')).toHaveCount(0)
    await page.screenshot({path:`/tmp/wanhua-clean-brands-${route==='/'?'home':'story'}.png`})
  }
})
