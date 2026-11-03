import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
const output='output/ui-polish'; mkdirSync(output,{recursive:true})
const browser=await chromium.launch()
const results=[]
for(const theme of ['dark','light']) {
 const context=await browser.newContext({colorScheme:theme,reducedMotion:'reduce'})
 const page=await context.newPage()
 for(const width of [320,375,430,768,1024,1280,1440,1920]) {
  await page.setViewportSize({width,height:1000})
  for(const route of ['/','/projects','/projects/scale-with-accounting','/lab']) {
   await page.goto('http://127.0.0.1:4174'+route)
   await page.locator('h1').first().waitFor()
   await page.evaluate(()=>document.fonts.ready)
   const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,container:document.querySelector('.page-container')?.getBoundingClientRect().width,font:getComputedStyle(document.body).fontFamily,transferBytes:performance.getEntriesByType('resource').reduce((sum,r)=>sum+r.transferSize,0)}))
   results.push({theme,route,...data})
   if(data.scrollWidth>width) throw Error(`Overflow ${theme} ${route} ${width}: ${data.scrollWidth}`)
   if([375,1440,1920].includes(width)&&route!='/lab') await page.screenshot({path:`${output}/after-${theme}-${width}-${route==='/'?'home':route==='/projects'?'projects':'case-study'}.png`,fullPage:route!=='/'})
  }
 }
 await context.close()
}
writeFileSync(`${output}/responsive-results.json`,JSON.stringify(results,null,2));await browser.close();console.log(`Passed ${results.length} route/theme/viewport overflow checks`)
