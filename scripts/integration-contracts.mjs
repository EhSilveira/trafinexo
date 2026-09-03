const providers={
 meta_ads:['campaigns','ads','creatives','insights','audiences','automation'],
 google_ads:['campaigns','experiments','insights','budgets','search_terms'],
 google_analytics:['traffic','conversions','landing_pages','attribution'],
 search_console:['queries','landing_pages','organic_visibility'],
 tiktok_ads:['campaigns','ads','creatives','reports','experiments'],
 linkedin_ads:['accounts','campaigns','creatives','reporting','demographics'],
 microsoft_ads:['campaigns','reporting','budgets','keywords'],
 hubspot:['contacts','deals','revenue','lead_quality'],
 rd_station:['contacts','opportunities','sales','lead_quality'],
 shopify:['orders','revenue','customers','products'],
 webhook_crm:['leads','sales','revenue','offline_conversions']
};
const required=['meta_ads','google_ads','google_analytics','search_console','tiktok_ads','linkedin_ads','microsoft_ads','hubspot','rd_station','shopify','webhook_crm'];
const missing=required.filter(p=>!providers[p]||providers[p].length===0);
if(missing.length)throw new Error(`Providers sem contrato: ${missing.join(', ')}`);
for(const [p,caps] of Object.entries(providers)){if(new Set(caps).size!==caps.length)throw new Error(`Capacidade duplicada em ${p}`)}
console.log(`OK: ${required.length} contratos de integração validados`);
