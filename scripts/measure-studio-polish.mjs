import {chromium} from '@playwright/test'
import {writeFileSync} from 'node:fs'
const b=await chromium.launch();const results=[]
for(const [version,port] of [['before',4176],['after',4174]]) {
 for(let run=0;run<3;run++) {
  const c=await b.newContext({viewport:{width:1440,height:1000},colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'block'});const p=await c.newPage();
  await p.addInitScript(()=>{window.measure={cls:0,lcp:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.measure.cls+=e.value})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>window.measure.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true})})
  await p.goto(`http://127.0.0.1:${port}/`);await p.locator('.hero-identity img').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500)
  results.push({version,run,...await p.evaluate(()=>({...window.measure,transferBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0),requests:performance.getEntriesByType('resource').length,container:document.querySelector('.page-container').getBoundingClientRect().width}))});await c.close()
 }
}
writeFileSync('output/ui-polish/performance.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await b.close()
