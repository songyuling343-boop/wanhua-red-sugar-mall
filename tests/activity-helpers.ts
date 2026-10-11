import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
/** Verify the popup destination and close it; the original shop must retain its URL. */
export async function openActivity(page:Page,link:Locator,url:string){
  const original=page.url()
  await expect(link).toHaveAttribute('target','_blank')
  await expect(link).toHaveAttribute('rel','noopener noreferrer')
  const [activity]=await Promise.all([page.waitForEvent('popup'),link.click()])
  await expect(activity).toHaveURL(url)
  await expect(page).toHaveURL(original)
  expect(await activity.evaluate(()=>window.opener===null)).toBe(true)
  await activity.close()
  await expect(page.locator('.shop-header')).toBeVisible()
}
