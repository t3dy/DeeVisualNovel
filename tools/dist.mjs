// dist.mjs — ending-distribution audit. Catches endings that are unreachable in practice.
import { readFileSync } from 'node:fs';
import { State } from '../engine/state.js';
const who = process.argv[2] || 'dee';
const base = new URL(`../protagonists/${who}/`, import.meta.url);
const { pack } = await import(new URL('content/pack.js', base));
const NODES = JSON.parse(readFileSync(new URL('content/choices.json', base), 'utf8')).choices;
function run(pick){const s=new State(pack);let g=0;
 while(g++<200){const n=NODES.filter(x=>!(x.id in s.flags)&&s.nodeAvailable(x))[0];if(!n)break;
 const o=n.options.filter(x=>s.optionAvailable(x));s.applyChoice(n,o[Math.min(pick(n,s),o.length-1)]);}
 return {s,e:pack.computeEnding(s)};}
const c={},stats=[];const N=3000;
for(let i=0;i<N;i++){const{s,e}=run(n=>Math.floor(Math.random()*n.options.length));
 c[e.id]=(c[e.id]||0)+1;stats.push([s.states.scholarly_credibility,s.states.angelic_authority,s.states.political_utility,s.quantities.stain,s.quantities.library]);}
console.log(`ending distribution over ${N} random runs:`);
Object.entries(c).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k.padEnd(26)} ${(v/N*100).toFixed(1)}%`));
const L=['credibility','angelic','political','stain','library'];
const avg=i=>(stats.reduce((a,b)=>a+b[i],0)/stats.length).toFixed(1);
const rng=i=>`${Math.min(...stats.map(s=>s[i]))}..${Math.max(...stats.map(s=>s[i]))}`;
console.log();
L.forEach((l,i)=>console.log(`  ${l.padEnd(12)} avg ${String(avg(i)).padStart(5)}  range ${rng(i)}`));
