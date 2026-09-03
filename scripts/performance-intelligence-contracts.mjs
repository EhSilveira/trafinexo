import fs from 'node:fs';

const page=fs.readFileSync('app/inteligencia/page.js','utf8');
const commercial=fs.readFileSync('app/page.js','utf8');
const command=fs.readFileSync('components/CommandCenter.js','utf8');

const requiredUi=['Profit ROAS','TRACKING GUARDIAN','LEAD QUALITY','BUDGET OPTIMIZER','FORECAST','CREATIVE INTELLIGENCE','CLIENT HEALTH 360','CHURN PREDICTOR','TRAFINEXO COPILOT'];
const missingUi=requiredUi.filter(x=>!page.includes(x));
if(missingUi.length) throw new Error(`Inteligência sem módulos: ${missingUi.join(', ')}`);
if(!page.includes('requires_human_approval')&&!page.includes('aprovação humana')) throw new Error('Guardrail de aprovação humana ausente');
if(!page.includes('traf-performance-intelligence')) throw new Error('Edge Function de inteligência não está ligada à UI');
if(!commercial.includes('Performance Intelligence')||!commercial.includes('Profit ROAS')||!commercial.includes('Tracking Guardian')) throw new Error('Página comercial não apresenta os novos diferenciais');
if(!command.includes('href="/inteligencia"')) throw new Error('Central de comando não aponta para /inteligencia');
console.log(`OK: ${requiredUi.length} capacidades de inteligência validadas no contrato de UI`);
