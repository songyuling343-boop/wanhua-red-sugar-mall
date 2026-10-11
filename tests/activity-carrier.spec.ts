import { test, expect } from '@playwright/test'
const sources={quiz:'https://wanhua-red-sugar-quiz.pages.dev/',blindbox:'https://wanqiaoqiao-blindbox.pages.dev/'}
for(const width of [375,390,430])for(const type of ['quiz','blindbox'] as const)test(`${type} carrier and refresh fit ${width}px with frame scrolling isolated`,async({page})=>{
  await page.setViewportSize({width,height:844})
  await page.context().route(sources[type]+'**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<style>body{margin:0}main{height:1600px}</style><button onclick="this.textContent=\'已点击\'">演示游戏按钮</button><main>Scrollable game fixture</main>'}))
  await page.goto(`/activity/${type}`);await page.reload()
  await expect(page.getByRole('button',{name:'返回商城'})).toBeVisible()
  const frame=page.locator('.activity-frame');await expect(frame).toHaveAttribute('src',sources[type]);await expect(frame).toHaveAttribute('title',type==='quiz'?'测测你的红糖属性':'万巧巧惊喜盲盒')
  await page.frameLocator('.activity-frame').getByRole('button',{name:'演示游戏按钮'}).click()
  await expect(page.frameLocator('.activity-frame').getByRole('button',{name:'已点击'})).toBeVisible()
  const box=await frame.boundingBox();expect(box!.y).toBe(56);expect(box!.height).toBe(788);expect(box!.width).toBe(width)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true)
  await expect(page.locator('.bottom-nav')).toHaveCount(0)
  await page.getByRole('button',{name:'返回商城'}).click();await expect(page).toHaveURL(/\/$/)
})

test('source query and scroll survive carrier refresh and iframe navigation',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))
  await page.context().route(sources.quiz+'**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<a href="/next">下一步</a>'}))
  await page.goto('/member/activities?from=demo')
  const link=page.locator('.personality-retest');await link.scrollIntoViewIfNeeded()
  const offset=await page.evaluate(()=>scrollY)
  await link.click();await expect(page).toHaveURL(/\/activity\/quiz$/)
  await page.reload();await page.frameLocator('.activity-frame').getByRole('link',{name:'下一步'}).click()
  await page.getByRole('button',{name:'返回商城'}).click()
  await expect(page).toHaveURL(/\/member\/activities\?from=demo$/)
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(offset)
})
