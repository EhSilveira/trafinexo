import fs from 'node:fs';
const page=fs.readFileSync('app/inteligencia/lab/page.js','utf8');
const css=fs.readFileSync('app/inteligencia/lab/growth-os.css','utf8');
const cmd=fs.readFileSync('components/CommandCenter.js','utf8');
const must=['Growth OS','Controlled Autonomy','Fila de propostas aprováveis','Intelligence','Prediction','Recommendation','Marketing Digital Twin'];
for(const term of must){if(!page.toLowerCase().includes(term.toLowerCase()))throw new Error(`Growth OS sem contrato: ${term}`)}
if(!cmd.includes('/inteligencia/lab'))throw new Error('Central de comando sem link do Growth OS');
if(!css.includes('@media(max-width:640px)'))throw new Error('Growth OS sem contrato mobile');
console.log(`Growth OS contracts OK: ${must.length} capacidades + navegação + responsividade`);
