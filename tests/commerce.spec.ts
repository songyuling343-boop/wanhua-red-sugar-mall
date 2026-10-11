import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
async function init(page:Page){await page.addInitScript(()=>localStorage.setItem('wanhua-welcome-v1','true'))}
async function add(page:Page,id:string,flavor?:string){await page.goto(`/product/${id}`);if(flavor)await page.getByRole('button',{name:flavor,exact:true}).click();await page.getByRole('button',{name:'加入购物车',exact:true}).click()}
async function submitAndPay(page:Page){await page.getByRole('button',{name:'提交订单',exact:true}).click();await expect(page).toHaveURL(/\/payment\//);await expect(page.getByText('比赛演示模式，本页面不会发生真实支付。')).toBeVisible();await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page).toHaveURL(/\/payment-success\//);await expect(page.getByRole('heading',{name:'支付成功',exact:true})).toBeVisible()}
const row=(page:Page,key:string)=>page.locator(`[data-cart-key="${key}"]`)
const history=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('wanhua-orders-v1')||'[]'))

test('required flow 1 and 5: add, accumulate, edit, badges, coupon, pay, order detail',async({page})=>{
  await init(page);await add(page,'fashion','老姜');await page.getByRole('button',{name:'加入购物车',exact:true}).click()
  await expect(page.locator('.nav-badge')).toHaveText('2');await expect(page.locator('.badge')).toHaveText('2')
  await page.getByRole('link',{name:'购物车',exact:true}).last().click();await expect(page.locator('.cart-row')).toHaveCount(1)
  await row(page,'fashion:老姜').getByRole('button',{name:'增加数量'}).click();await expect(page.locator('.nav-badge')).toHaveText('3')
  await row(page,'fashion:老姜').getByRole('button',{name:'减少数量'}).click();await expect(page.locator('.badge')).toHaveText('2')
  await expect(row(page,'fashion:老姜')).toContainText('小计 ¥76.00')
  await page.getByRole('button',{name:'去结算（2）'}).click();await expect(page).toHaveURL(/\/checkout\//)
  await expect(page.getByRole('textbox',{name:'收货人姓名'})).toHaveValue('万巧巧')
  await expect(page.getByRole('radio',{name:'满 59 减 5'})).toBeChecked()
  await expect(page.locator('.bar-amount strong')).toHaveText('¥79.00')
  await page.getByRole('textbox',{name:'订单备注'}).fill('比赛展示：礼盒请妥善包装')
  await submitAndPay(page);await expect(page.locator('.success-celebration>strong')).toHaveText('¥79.00')
  await expect(page.locator('.nav-badge')).toHaveCount(0)
  await page.getByRole('link',{name:'查看订单',exact:true}).click();await expect(page.locator('.order-metadata')).toContainText('比赛展示：礼盒请妥善包装')
  await expect(page.locator('.order-item')).toContainText('老姜 · 数量 2')
  const orders=await history(page);expect(orders).toHaveLength(1);expect(orders[0]).toMatchObject({goodsAmount:76,discountAmount:5,shippingFee:8,finalAmount:79,status:'已支付（演示）',receiver:'万巧巧',paymentMethod:'wechat'})
  expect(orders[0].orderId).toMatch(/^WH\d{8}[A-Z0-9]+$/)
})

test('required flow 2: partially selected checkout preserves unselected items',async({page})=>{
  await init(page);await add(page,'fashion');await add(page,'qiaojia-gift');await page.goto('/cart')
  await row(page,'qiaojia-gift:原味').getByRole('checkbox').uncheck();await expect(page.getByRole('button',{name:'去结算（1）'})).toBeEnabled()
  await page.getByRole('button',{name:'去结算（1）'}).click();await expect(page.locator('.order-item')).toHaveCount(1);await expect(page.locator('.order-item')).toContainText('时尚女人系列')
  await submitAndPay(page);await page.goto('/cart');await expect(page.locator('.cart-row')).toHaveCount(1);await expect(page.locator('.cart-row')).toContainText('遇见巧家·伴手礼系列')
  await expect(page.locator('.cart-row input[type=checkbox]')).not.toBeChecked();await expect(page.locator('.nav-badge')).toHaveText('1')
  await page.reload();await expect(page.locator('.cart-row')).toHaveCount(1)
})

test('required flow 3: buy now has chosen flavor and quantity and never changes existing cart',async({page})=>{
  await init(page);await add(page,'qiaojia-gift');await page.goto('/product/princess-jar');await page.getByRole('button',{name:'老姜',exact:true}).click()
  await page.getByRole('button',{name:'增加数量'}).click();await page.getByRole('button',{name:'立即购买',exact:true}).click()
  await expect(page.locator('.order-item')).toContainText('老姜 · 数量 2');await expect(page.locator('.order-item')).toContainText('200g/罐');await expect(page.locator('.nav-badge')).toHaveText('1')
  await page.getByRole('textbox',{name:'收货人姓名'}).fill('比赛体验官');await page.getByRole('button',{name:'提交订单',exact:true}).click()
  await page.getByText('支付宝（演示）',{exact:true}).click();await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page).toHaveURL(/\/payment-success\//)
  await page.goto('/cart');await expect(page.locator('.cart-row')).toHaveCount(1);await expect(page.locator('.cart-row')).toContainText('遇见巧家·伴手礼系列')
  const orders=await history(page);expect(orders[0].paymentMethod).toBe('alipay');expect(orders[0].receiver).toBe('比赛体验官')
})

test('required flow 4: cart, checkout edits and order history survive refresh and returning',async({page})=>{
  await init(page);await add(page,'fashion');await add(page,'qiaojia-gift');await page.goto('/cart');await page.reload();await expect(page.locator('.cart-row')).toHaveCount(2)
  await page.getByRole('button',{name:'去结算（2）'}).click();await page.getByRole('textbox',{name:'详细地址',exact:true}).fill('比赛演示街道 12 号')
  await page.getByRole('textbox',{name:'订单备注'}).fill('请使用演示地址');await page.getByRole('radio',{name:'不使用优惠券'}).check()
  await page.reload();await expect(page.getByRole('textbox',{name:'详细地址',exact:true})).toHaveValue('比赛演示街道 12 号');await expect(page.getByRole('radio',{name:'不使用优惠券'})).toBeChecked()
  await page.getByRole('button',{name:'提交订单',exact:true}).click();await page.getByRole('link',{name:'返回修改订单'}).click();await expect(page.getByRole('textbox',{name:'订单备注'})).toHaveValue('请使用演示地址')
  await submitAndPay(page);await page.reload();await expect(page.getByRole('heading',{name:'支付成功',exact:true})).toBeVisible()
  await page.getByRole('link',{name:'会员中心',exact:true}).click();await page.getByRole('link',{name:'我的订单',exact:true}).click();await expect(page.locator('.order-list-card')).toHaveCount(1)
  await page.reload();await expect(page.locator('.order-list-card')).toHaveCount(1);await page.locator('.order-list-card').click();await expect(page.locator('.saved-receiver')).toContainText('比赛演示街道 12 号')
})

test('select all, empty selection, min quantity, cancel delete and confirmed removal',async({page})=>{
  await init(page);await add(page,'fashion');await add(page,'fashion','老姜');await page.goto('/cart');await expect(page.locator('.cart-row')).toHaveCount(2)
  await expect(row(page,'fashion:原味').getByRole('button',{name:'减少数量'})).toBeDisabled()
  await page.getByRole('checkbox',{name:'全选商品',exact:true}).uncheck();await expect(page.getByRole('button',{name:'去结算（0）'})).toBeDisabled();await expect(page.locator('.bar-amount strong')).toHaveText('¥0.00')
  await page.getByRole('checkbox',{name:'底栏全选商品'}).check();await expect(page.getByRole('button',{name:'去结算（2）'})).toBeEnabled()
  await row(page,'fashion:原味').getByRole('button',{name:'删除时尚女人系列 原味',exact:true}).click();await page.getByRole('button',{name:'保留',exact:true}).click();await expect(page.locator('.cart-row')).toHaveCount(2)
  await row(page,'fashion:原味').getByRole('button',{name:'删除时尚女人系列 原味',exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();await expect(page.locator('.cart-row')).toHaveCount(1);await expect(page.locator('.nav-badge')).toHaveText('1')
  await row(page,'fashion:老姜').getByRole('button',{name:'删除时尚女人系列 老姜',exact:true}).click();await page.getByRole('button',{name:'确认删除',exact:true}).click();await expect(page.getByRole('link',{name:'去逛逛',exact:true})).toBeVisible();await expect(page.locator('.badge')).toHaveCount(0)
})

test('receiver validation blocks submission; eligible coupons and decimal arithmetic',async({page})=>{
  await init(page);await page.goto('/product/princess-jar');await page.getByRole('button',{name:'增加数量'}).click({clickCount:2});await page.getByRole('button',{name:'立即购买',exact:true}).click()
  await expect(page.locator('.bar-amount strong')).toHaveText('¥62.70');await expect(page.getByRole('radio',{name:'满 99 减 10'})).toBeDisabled()
  await page.getByRole('radio',{name:'不使用优惠券'}).check();await expect(page.locator('.bar-amount strong')).toHaveText('¥67.70')
  for(const name of ['收货人姓名','手机号码','详细地址'])await page.getByRole('textbox',{name,exact:true}).fill('')
  await page.getByRole('button',{name:'提交订单',exact:true}).click();await expect(page).toHaveURL(/\/checkout\//);await expect(page.locator('[aria-invalid=true]')).toHaveCount(3)
  await page.getByRole('textbox',{name:'收货人姓名'}).fill('万巧巧');await page.getByRole('textbox',{name:'手机号码'}).fill('123');await page.getByRole('textbox',{name:'详细地址',exact:true}).fill('演示街道')
  await page.getByRole('button',{name:'提交订单',exact:true}).click();await expect(page.getByText('请填写 11 位手机号码')).toBeVisible();expect(await history(page)).toHaveLength(0)
  await page.getByRole('textbox',{name:'手机号码'}).fill('13800000000');await submitAndPay(page);expect((await history(page))[0].finalAmount).toBe(67.7)
})

test('duplicate confirmation and back/reload produce one order and one cart cleanup',async({page})=>{
  await init(page);await add(page,'fashion');await page.goto('/cart');await page.getByRole('button',{name:'去结算（1）'}).click();const checkoutUrl=page.url()
  await page.getByRole('button',{name:'提交订单',exact:true}).click();const paymentUrl=page.url()
  await page.getByRole('button',{name:'确认模拟支付'}).evaluate((button:HTMLButtonElement)=>{button.click();button.click()})
  await expect(page).toHaveURL(/\/payment-success\//);expect(await history(page)).toHaveLength(1)
  await add(page,'fashion');await page.goto(paymentUrl);await expect(page).toHaveURL(/\/payment-success\//)
  await page.goto(checkoutUrl);await expect(page).toHaveURL(/\/payment-success\//);await page.reload();expect(await history(page)).toHaveLength(1)
  await page.goto('/cart');await expect(page.locator('.cart-row')).toContainText('数量 1')
})

test('storage write failure cannot create false payment success or discard cart',async({page})=>{
  await init(page);await add(page,'fashion');await page.goto('/cart');await page.getByRole('button',{name:'去结算（1）'}).click();await page.getByRole('button',{name:'提交订单',exact:true}).click()
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='wanhua-orders-v1')throw new DOMException('Quota exceeded','QuotaExceededError');original.call(this,key,value)}})
  await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page.getByRole('alert')).toContainText('订单未能保存');await expect(page).toHaveURL(/\/payment\//);expect(await history(page)).toHaveLength(0)
  await page.goto('/cart');await expect(page.locator('.cart-row')).toHaveCount(1)
})

test('legacy phase-one cart remains readable and corrupted commerce data recovers',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('wanhua-welcome-v1','true');if(!localStorage.getItem('seeded')){localStorage.setItem('wanhua-cart-v1',JSON.stringify([{productId:'fashion',flavor:'原味',quantity:2}]));localStorage.setItem('wanhua-orders-v1','[null,{},false]');localStorage.setItem('wanhua-checkout-v1','{"items":null}');localStorage.setItem('seeded','true')}})
  await page.goto('/cart');await expect(page.locator('.cart-row')).toContainText('数量 2');await expect(page.getByRole('checkbox',{name:'全选商品',exact:true})).toBeChecked()
  await page.goto('/orders');await expect(page.getByText('第一份甜蜜订单，等你开启')).toBeVisible();await page.goto('/checkout/missing');await expect(page.getByText('这份心意需要重新挑选')).toBeVisible();await page.goto('/orders/missing');await expect(page.getByText('还没找到这份订单')).toBeVisible()
})

for(const width of [375,390,430]){
  test(`complete mobile shopping experience and layout at ${width}px`,async({page})=>{
    await init(page);await page.setViewportSize({width,height:812});const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
    async function layout(name:string){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`/tmp/wanhua-stage2-${name}-${width}.png`,fullPage:true});const footer=page.locator('.commerce-fixed-bar');if(await footer.count()){const bar=await footer.boundingBox(), nav=await page.locator('.bottom-nav').boundingBox();expect(bar!.y+bar!.height).toBeLessThanOrEqual(nav!.y+1)}}
    await add(page,'qiaojia-gift');await add(page,'fashion','老姜');await page.goto('/cart');await layout('cart')
    await page.getByRole('button',{name:'去结算（2）'}).click();await layout('checkout');await expect(page.locator('.bar-amount strong')).toHaveText('¥116.00')
    await page.getByRole('button',{name:'提交订单',exact:true}).click();await layout('payment');await page.getByRole('button',{name:'确认模拟支付'}).click();await layout('success')
    await page.getByRole('link',{name:'查看订单',exact:true}).click();await layout('detail');await page.goto('/orders');await layout('orders');expect(errors).toEqual([])
  })
}

test('interrupted cart cleanup recovers without duplicate order or losing later additions',async({page})=>{
  await init(page);await add(page,'fashion');await page.goto('/cart');await page.getByRole('button',{name:'去结算（1）'}).click();await page.getByRole('button',{name:'提交订单',exact:true}).click()
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='wanhua-cart-v1')throw new DOMException('Quota exceeded','QuotaExceededError');original.call(this,key,value)}})
  await page.getByRole('button',{name:'确认模拟支付'}).click();await expect(page.getByRole('alert')).toContainText('购物车清理未完成');expect(await history(page)).toHaveLength(1)
  await page.reload();await expect(page).toHaveURL(/\/payment-success\//);await page.goto('/cart');await expect(page.getByText('购物袋里，还缺一点甜')).toBeVisible()
  await add(page,'fashion');await page.goto('/cart');await expect(page.locator('.cart-row')).toContainText('数量 1');expect(await history(page)).toHaveLength(1)
})
