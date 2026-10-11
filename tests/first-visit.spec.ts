import { test, expect } from '@playwright/test'
import { openActivity } from './activity-helpers'
const key='wanhua-welcome-v1'

test('first home visit stays unmarked until a choice; skipping persists across refresh',async({page})=>{
  await page.goto('/')
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull()
  await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button',{name:'先逛逛商城',exact:true}).click()
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('true')
  await page.reload();await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.activity-card.quiz')).toHaveAttribute('href','/activity/quiz')
  await page.getByRole('button',{name:'切换到第2张 Banner'}).click()
  await expect(page.locator('.hero-banner')).toContainText('测测你的红糖属性')
  await page.evaluate(()=>localStorage.clear());await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('immediate test enters the carrier and records the choice',async({page})=>{
  await page.context().route('https://wanhua-red-sugar-quiz.pages.dev/**',route=>route.fulfill({body:'Quiz demo'}))
  await page.goto('/')
  await openActivity(page,page.getByRole('link',{name:'立即测试'}),'https://wanhua-red-sugar-quiz.pages.dev/')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('true')
  await page.reload();await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('non-home visits do not consume the invitation; SPA home navigation shows it',async({page})=>{
  await page.goto('/category');await expect(page.locator('.product-card').first()).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull()
  await page.locator('.bottom-nav').getByRole('link',{name:/首页/}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('dedicated demo reset returns home, shows the invitation and preserves all other storage',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'先逛逛商城',exact:true}).click()
  await page.goto('/member/demo')
  await page.getByRole('button',{name:'重新触发首次趣味测试弹窗',exact:true}).click()
  await page.getByRole('button',{name:'取消',exact:true}).click()
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe('true')
  const before=await page.evaluate(k=>Object.fromEntries(Object.entries(localStorage).filter(([name])=>name!==k)),key)
  await page.getByRole('button',{name:'重新触发首次趣味测试弹窗',exact:true}).click()
  await page.getByRole('button',{name:'确认修改',exact:true}).click()
  await expect(page).toHaveURL(/\/$/);await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull()
  expect(await page.evaluate(k=>Object.fromEntries(Object.entries(localStorage).filter(([name])=>name!==k)),key)).toEqual(before)
})

for(const width of [375,390,430])test(`invitation fits ${width}px with accessible close and IP`,async({page})=>{
  await page.setViewportSize({width,height:667});await page.goto('/')
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible()
  await expect(dialog.locator('.ip-portrait img')).toBeVisible()
  const box=await dialog.boundingBox();expect(box).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width)
  expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(667)
  await dialog.getByRole('button',{name:'关闭邀请弹窗'}).click();await expect(dialog).toHaveCount(0)
})
