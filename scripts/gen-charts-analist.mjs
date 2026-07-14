// Charturi "pro" pentru articolul Analist Financiar — 5 tipuri diverse, design system coerent.
// Output: /tmp/charts.json { name: svgInlineResponsiv }. SVG inline in articol (viewBox + width 100%).
import { writeFileSync } from 'fs';

const FONT = "'Plus Jakarta Sans','Inter',system-ui,sans-serif";
const C = {
  ink:'#14212E', sub:'#64748B', faint:'#94A3B8',
  track:'#EDF1F5', grid:'#E7ECF1', border:'#E6ECF2', card:'#FFFFFF', canvas:'#F5F8FB',
  navy:'#123B5C', navy2:'#1E5A86',
  a1:'#E24E2B', a2:'#F4854F',
  teal:'#0E8C8C', gold:'#D98A00', slate:'#475569',
};
const fmt = n => Math.round(n).toLocaleString('ro-RO');

function defs(){return `<defs>
  <linearGradient id="barWarm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.a1}"/><stop offset="1" stop-color="${C.a2}"/></linearGradient>
  <linearGradient id="barNavy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.navy2}"/></linearGradient>
  <linearGradient id="dumb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4A582"/><stop offset="1" stop-color="${C.a1}"/></linearGradient>
  <linearGradient id="stepG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.a2}"/><stop offset="1" stop-color="${C.a1}"/></linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1E293B" flood-opacity="0.10"/></filter>
</defs>`;}
function header(x,y,W,title,sub){return `
  <rect x="${x}" y="${y-2}" width="6" height="30" rx="3" fill="url(#barWarm)"/>
  <text x="${x+18}" y="${y+16}" font-size="26" font-weight="800" fill="${C.ink}">${title}</text>
  <text x="${x+18}" y="${y+42}" font-size="15.5" font-weight="500" fill="${C.sub}">${sub}</text>`;}
const cap=(x,y,t)=>`<text x="${x}" y="${y}" font-size="13" font-weight="500" fill="${C.faint}">${t}</text>`;
function card(W,H,inner){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block;max-width:${W}px;margin:1.5rem auto" font-family="${FONT}" role="img">
  ${defs()}
  <rect x="0" y="0" width="${W}" height="${H}" rx="22" fill="${C.canvas}"/>
  <rect x="14" y="14" width="${W-28}" height="${H-28}" rx="18" fill="${C.card}" stroke="${C.border}" filter="url(#soft)"/>
  ${inner}
</svg>`;}

// 1) DUMBBELL — salariu pe experiență
function c_experienta(){
  const W=880,H=440,px=52,pyTop=120,rowH=74;
  const rows=[{label:'Junior',sub:'0-2 ani',min:5300,mid:5900,max:6500},{label:'Mediu',sub:'3-5 ani',min:7000,mid:8000,max:9000},{label:'Senior',sub:'5+ ani',min:10000,mid:11200,max:12500}];
  const x0=px+150,x1=W-px-20,maxV=14000,sx=v=>x0+(v/maxV)*(x1-x0);
  let g=header(px,40,W,'Salariu net pe experiență','Analist financiar în România, lei net pe lună (2026)');
  for(let v=0;v<=14000;v+=2000){const x=sx(v);g+=`<line x1="${x}" y1="${pyTop-14}" x2="${x}" y2="${pyTop+rows.length*rowH-24}" stroke="${C.grid}" stroke-width="1" stroke-dasharray="2 5"/><text x="${x}" y="${pyTop+rows.length*rowH-4}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${C.faint}">${v/1000}k</text>`;}
  rows.forEach((r,i)=>{const y=pyTop+i*rowH+8;
    g+=`<text x="${px}" y="${y+2}" font-size="18" font-weight="800" fill="${C.ink}">${r.label}</text><text x="${px}" y="${y+20}" font-size="13" font-weight="600" fill="${C.sub}">${r.sub}</text>`;
    g+=`<line x1="${x0}" y1="${y-2}" x2="${x1}" y2="${y-2}" stroke="${C.track}" stroke-width="10" stroke-linecap="round"/><line x1="${sx(r.min)}" y1="${y-2}" x2="${sx(r.max)}" y2="${y-2}" stroke="url(#dumb)" stroke-width="10" stroke-linecap="round"/>`;
    const mx=sx(r.mid);g+=`<rect x="${mx-6}" y="${y-8}" width="12" height="12" rx="2" transform="rotate(45 ${mx} ${y-2})" fill="#fff" stroke="${C.navy}" stroke-width="2.5"/>`;
    g+=`<circle cx="${sx(r.min)}" cy="${y-2}" r="7.5" fill="#fff" stroke="${C.a1}" stroke-width="3"/><circle cx="${sx(r.max)}" cy="${y-2}" r="7.5" fill="#fff" stroke="${C.a1}" stroke-width="3"/>`;
    g+=`<text x="${sx(r.min)}" y="${y-16}" text-anchor="middle" font-size="14.5" font-weight="800" fill="${C.ink}">${fmt(r.min)}</text><text x="${sx(r.max)}" y="${y-16}" text-anchor="middle" font-size="14.5" font-weight="800" fill="${C.a1}">${fmt(r.max)}</text>`;});
  const ly=pyTop+rows.length*rowH+34;
  g+=`<rect x="${px}" y="${ly-11}" width="13" height="13" rx="6.5" fill="url(#dumb)"/><text x="${px+20}" y="${ly}" font-size="13.5" font-weight="600" fill="${C.sub}">interval de piață</text>`;
  g+=`<rect x="${px+180}" y="${ly-10}" width="12" height="12" rx="2" transform="rotate(45 ${px+186} ${ly-4})" fill="#fff" stroke="${C.navy}" stroke-width="2"/><text x="${px+204}" y="${ly}" font-size="13.5" font-weight="600" fill="${C.sub}">valoare tipică</text>`;
  g+=cap(px,H-24,'Surse: INS + Paylab (net 5.312-12.253) + levels.fyi · estimativ 2026 · meseriile.ro');
  return card(W,H,g);
}

// 2) RANKED — pe sector
function c_sector(){
  const W=880,H=452,px=52,pyTop=124,rowH=54;
  const rows=[{label:'Fond de investiții / IB',val:100},{label:'Fintech',val:82},{label:'Bancă',val:74},{label:'Corporație (FP&amp;A)',val:60},{label:'Big4 / audit',val:48,note:'intrare mică, creștere rapidă'}];
  const x0=px+52,x1=W-px-70,bw=v=>(v/100)*(x1-x0);
  let g=header(px,40,W,'Cine plătește cel mai bine','Analist financiar pe sector, nivel relativ de salariu (estimativ)');
  rows.forEach((r,i)=>{const y=pyTop+i*rowH,grad=i===0?'url(#barNavy)':'url(#barWarm)';
    g+=`<circle cx="${px+16}" cy="${y+17}" r="16" fill="${i===0?C.navy:'#FBECE6'}"/><text x="${px+16}" y="${y+22}" text-anchor="middle" font-size="16" font-weight="800" fill="${i===0?'#fff':C.a1}">${i+1}</text>`;
    g+=`<text x="${x0}" y="${y+2}" font-size="15.5" font-weight="700" fill="${C.ink}">${r.label}</text>`;
    g+=`<rect x="${x0}" y="${y+10}" width="${x1-x0}" height="20" rx="8" fill="${C.track}"/><rect x="${x0}" y="${y+10}" width="${bw(r.val)}" height="20" rx="8" fill="${grad}"/>`;
    g+=`<text x="${x0+bw(r.val)+12}" y="${y+25}" font-size="14.5" font-weight="800" fill="${i===0?C.navy:C.a1}">${i===0?'reper 100':r.val}</text>`;
    if(r.note)g+=`<text x="${x0}" y="${y+46}" font-size="12.5" font-weight="500" fill="${C.faint}">${r.note}</text>`;});
  g+=cap(px,H-24,'Ordonat după INS (financiar = cel mai bine plătit sector) + practica pieței · nivel relativ, nu cifre absolute');
  return card(W,H,g);
}

// 3) SEGMENTED BAR — costul CFA (3 nivele + materiale) spre total
function c_cfa(){
  const W=880,H=340,px=52;
  const segs=[{label:'Nivel 1',v:1140},{label:'Nivel 2',v:1140},{label:'Nivel 3',v:1240},{label:'Materiale + calculator',v:600}];
  const total=segs.reduce((s,x)=>s+x.v,0);
  const x0=px,x1=W-px,barY=150,barH=46;
  const colors=['#123B5C','#1E5A86','#E24E2B','#F4854F'];
  let g=header(px,40,W,'Cât costă certificarea CFA','Cele 3 examene + materiale, în USD (taxe oficiale 2026)');
  let cx=x0;const sw=v=>(v/total)*(x1-x0);
  segs.forEach((s,i)=>{const w=sw(s.v);
    g+=`<rect x="${cx}" y="${barY}" width="${w}" height="${barH}" fill="${colors[i]}" ${i===0?'rx="10"':''}/>`;
    if(i===segs.length-1)g+=`<rect x="${cx+w-14}" y="${barY}" width="14" height="${barH}" rx="10" fill="${colors[i]}"/>`;
    g+=`<text x="${cx+w/2}" y="${barY+barH/2+5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">$${fmt(s.v)}</text>`;
    g+=`<text x="${cx+w/2}" y="${barY-14}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${C.slate}">${s.label}</text>`;
    cx+=w;});
  // total callout
  g+=`<text x="${x1}" y="${barY+barH+40}" text-anchor="end" font-size="15" font-weight="600" fill="${C.sub}">Total drum complet</text>`;
  g+=`<text x="${x1}" y="${barY+barH+70}" text-anchor="end" font-size="30" font-weight="800" fill="${C.ink}">≈ $${fmt(total)}</text>`;
  g+=`<text x="${x0}" y="${barY+barH+44}" font-size="14" font-weight="600" fill="${C.slate}">Durată medie</text>`;
  g+=`<text x="${x0}" y="${barY+barH+72}" font-size="22" font-weight="800" fill="${C.a1}">~4 ani</text>`;
  g+=cap(px,H-24,'Sursă: CFA Institute (taxe examen 2026) · taxa de înscriere de 350 $ eliminată din 2025 · charterul cere 4.000 h experiență');
  return card(W,H,g);
}

// 4) DONUT — brut → net (12.000 lei brut, 2026)
function c_brutnet(){
  const W=880,H=400,cx=250,cy=224,R=104,r=64;
  const brut=12000, cas=brut*0.25, cass=brut*0.10, imp=(brut-cas-cass)*0.10, net=brut-cas-cass-imp;
  const parts=[{label:'Net în mână',v:net,c:'url(#barWarm)',cs:C.a1},{label:'CAS (pensie) 25%',v:cas,c:C.navy,cs:C.navy},{label:'CASS (sănătate) 10%',v:cass,c:C.navy2,cs:C.navy2},{label:'Impozit 10%',v:imp,c:C.slate,cs:C.slate}];
  let g=header(52,40,W,'Din brut în net','Un salariu brut de 12.000 lei pentru un analist, defalcat (2026)');
  let a0=-Math.PI/2;
  const arc=(a,b,rad)=>{const x1=cx+rad*Math.cos(a),y1=cy+rad*Math.sin(a),x2=cx+rad*Math.cos(b),y2=cy+rad*Math.sin(b);const large=(b-a)>Math.PI?1:0;return {x1,y1,x2,y2,large};};
  parts.forEach(p=>{const frac=p.v/brut,a1=a0+frac*2*Math.PI;
    const o=arc(a0,a1,R),ii=arc(a1,a0,r);
    g+=`<path d="M ${o.x1} ${o.y1} A ${R} ${R} 0 ${o.large} 1 ${o.x2} ${o.y2} L ${ii.x1} ${ii.y1} A ${r} ${r} 0 ${o.large} 0 ${ii.x2} ${ii.y2} Z" fill="${p.c}"/>`;
    a0=a1;});
  g+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="15" font-weight="600" fill="${C.sub}">NET</text>`;
  g+=`<text x="${cx}" y="${cy+24}" text-anchor="middle" font-size="30" font-weight="800" fill="${C.ink}">${fmt(net)}</text>`;
  // legend
  let ly=110;parts.forEach(p=>{g+=`<rect x="470" y="${ly-13}" width="15" height="15" rx="4" fill="${p.cs}"/><text x="495" y="${ly}" font-size="15" font-weight="700" fill="${C.ink}">${p.label}</text><text x="${W-52}" y="${ly}" text-anchor="end" font-size="15" font-weight="800" fill="${p.cs}">${fmt(p.v)} lei</text>`;ly+=42;});
  g+=cap(52,H-24,'Formula 2026: CAS 25% + CASS 10% + impozit 10% · fără scutiri sectoriale (eliminate din 2025)');
  return card(W,H,g);
}

// 5) STAIRCASE — cariera
function c_cariera(){
  const W=880,H=420,px=52,baseY=330;
  const steps=[{label:'Analist junior',v:5900},{label:'Analist',v:8000},{label:'Analist senior',v:11200},{label:'Manager / Lead FP&amp;A',v:15000,est:true},{label:'Director financiar / CFO',v:24000,est:true}];
  const maxV=26000,x0=px+10,x1=W-px-10,sw=(x1-x0)/steps.length,sh=v=>(v/maxV)*(baseY-120);
  let g=header(px,40,W,'Cum crește salariul cu cariera','Analist financiar → CFO, net pe lună (ultimele trepte estimative)');
  // connecting step line
  let poly='';
  steps.forEach((s,i)=>{const bx=x0+i*sw,h=sh(s.v),by=baseY-h;
    g+=`<rect x="${bx+14}" y="${by}" width="${sw-28}" height="${h}" rx="10" fill="url(#stepG)" opacity="${s.est?0.55:1}"/>`;
    g+=`<text x="${bx+sw/2}" y="${by-26}" text-anchor="middle" font-size="17" font-weight="800" fill="${s.est?C.a2:C.a1}">${fmt(s.v)}</text>`;
    if(s.est)g+=`<text x="${bx+sw/2}" y="${by-10}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${C.faint}">estimativ</text>`;
    // role label (wrap)
    const words=s.label.replace('&amp;','&').split(' ');
    let line1=words.slice(0,2).join(' '),line2=words.slice(2).join(' ');
    g+=`<text x="${bx+sw/2}" y="${baseY+24}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${C.ink}">${line1.replace('&','&amp;')}</text>`;
    if(line2)g+=`<text x="${bx+sw/2}" y="${baseY+42}" text-anchor="middle" font-size="13.5" font-weight="700" fill="${C.ink}">${line2.replace('&','&amp;')}</text>`;
    poly+=`${bx+sw/2},${by-4} `;});
  g+=`<line x1="${x0}" y1="${baseY}" x2="${x1}" y2="${baseY}" stroke="${C.grid}" stroke-width="2"/>`;
  g+=cap(px,H-24,'Surse: piață RO + INS · treptele de management sunt estimative, variază mult după companie · meseriile.ro');
  return card(W,H,g);
}

// 6) STAT CARDS — cifrele cheie
function c_stats(){
  const W=880,H=250,px=44;
  const S=[['8.500 lei','net mediu pe lună',C.a1],['~971','joburi active în RO',C.teal],['3,5','poziția pe Google',C.gold],['+59%','compensație cu CFA',C.navy]];
  let g=header(px,36,W,'Analist financiar pe scurt','cifrele cheie din articol');
  const cw=(W-px*2-30)/4;
  S.forEach((s,i)=>{const x=px+i*(cw+10),y=110;
    g+=`<rect x="${x}" y="${y}" width="${cw}" height="100" rx="14" fill="${C.canvas}" stroke="${C.border}"/><rect x="${x}" y="${y}" width="5" height="100" rx="2.5" fill="${s[2]}"/>`;
    g+=`<text x="${x+cw/2+3}" y="${y+48}" text-anchor="middle" font-size="27" font-weight="800" fill="${C.ink}">${s[0]}</text><text x="${x+cw/2+3}" y="${y+74}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${C.sub}">${s[1]}</text>`;});
  g+=cap(px,H-22,'Surse: INS, Paylab, BestJobs, CFA Institute · ultima cifră e globală (nu RO)');
  return card(W,H,g);
}
// 7) LOLLIPOP — comparație roluri înrudite
function c_roluri(){
  const W=880,H=380,px=52,x0=px+180,x1=W-px-64,mx=13000,pyTop=110,rowH=48;
  const R=[['Analist investiții',11500],['Controller financiar',10000],['Analist financiar',8500],['Economist',6000],['Contabil',5500]];
  const sx=v=>x0+(v/mx)*(x1-x0);
  let g=header(px,40,W,'Cum se compară cu roluri înrudite','net mediu pe lună, aceeași zonă de finanțe (lei)');
  R.forEach((r,i)=>{const y=pyTop+i*rowH+8,hl=r[0]==='Analist financiar';
    g+=`<text x="${px}" y="${y+5}" font-size="14.5" font-weight="${hl?'800':'700'}" fill="${hl?C.a1:C.ink}">${r[0]}</text>`;
    g+=`<line x1="${x0}" y1="${y}" x2="${sx(r[1])}" y2="${y}" stroke="url(#dumb)" stroke-width="5" stroke-linecap="round"/>`;
    g+=`<circle cx="${sx(r[1])}" cy="${y}" r="${hl?13:11}" fill="${hl?C.a1:C.navy}"/>`;
    g+=`<text x="${sx(r[1])+22}" y="${y+5}" font-size="14.5" font-weight="800" fill="${C.ink}">${fmt(r[1])}</text>`;});
  g+=cap(px,H-24,'Estimativ 2026 · vezi salariul fiecărui rol pe meseriile.ro');
  return card(W,H,g);
}

const out={
  'stats':c_stats(),
  'experienta':c_experienta(),
  'sector':c_sector(),
  'cfa':c_cfa(),
  'brutnet':c_brutnet(),
  'roluri':c_roluri(),
  'cariera':c_cariera(),
};
writeFileSync('/tmp/charts.json', JSON.stringify(out));
// preview PNGs
import { execSync } from 'child_process';
for(const [k,svg] of Object.entries(out)){writeFileSync(`/tmp/ch-${k}.svg`,svg);execSync(`rsvg-convert -w 1400 /tmp/ch-${k}.svg -o /tmp/ch-${k}.png`);}
console.log('✓ 5 charturi generate:', Object.keys(out).join(', '));
