import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
/** Verify the mall-owned carrier and return without navigating the outer page to the game. */
export async function openActivity(page:Page,link:Locator,url:string){
  const original=page.url()
  const type=url.includes('blindbox')?'blindbox':'quiz'
  const source=type==='quiz'?'https://wanhua-red-sugar-quiz.pages.dev/':'https://wanqiaoqiao-blindbox.pages.dev/'
  await expect(link).toHaveAttribute('href',`/activity/${type}`)
  await expect(link).not.toHaveAttribute('target','_blank')
  await link.click()
  await expect(page).toHaveURL(new RegExp(`/activity/${type}$`))
  await expect(page.locator('.activity-frame')).toHaveAttribute('src',source)
  await page.getByRole('button',{name:'返回商城',exact:true}).click()
  await expect(page).toHaveURL(original)
  await expect(page.locator('.shop-header')).toBeVisible()
}
