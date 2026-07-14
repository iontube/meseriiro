// CHARTKIT — bibliotecă de charturi "pro" pentru articolele meseriile.ro.
// 20 tipuri, un singur design system. SVG inline responsiv. Date sample (salarial) pt contact sheet.
// Rulează: node scripts/chartkit.mjs  → /tmp/kit/<name>.png + /tmp/kit/<name>.svg
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const FONT="'Plus Jakarta Sans','Inter',system-ui,sans-serif";
const C={ink:'#14212E',sub:'#64748B',faint:'#94A3B8',track:'#EDF1F5',grid:'#E7ECF1',border:'#E6ECF2',card:'#FFFFFF',canvas:'#F5F8FB',
  navy:'#123B5C',navy2:'#1E5A86',a1:'#E24E2B',a2:'#F4854F',teal:'#0E8C8C',gold:'#D98A00',slate:'#475569',green:'#1F9D6B',rose:'#C0356B'};
const fmt=n=>Math.round(n).toLocaleString('ro-RO');
const P=Math.PI;

function defs(){return `<defs>
 <linearGradient id="gW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.a1}"/><stop offset="1" stop-color="${C.a2}"/></linearGradient>
 <linearGradient id="gN" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.navy2}"/></linearGradient>
 <linearGradient id="gWv" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.a2}"/><stop offset="1" stop-color="${C.a1}"/></linearGradient>
 <linearGradient id="gNv" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.navy2}"/><stop offset="1" stop-color="${C.navy}"/></linearGradient>
 <linearGradient id="gD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4A582"/><stop offset="1" stop-color="${C.a1}"/></linearGradient>
 <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.a1}" stop-opacity="0.28"/><stop offset="1" stop-color="${C.a1}" stop-opacity="0"/></linearGradient>
 <filter id="soft" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1E293B" flood-opacity="0.10"/></filter>
</defs>`;}
function hd(x,y,t,s){return `<rect x="${x}" y="${y-2}" width="6" height="30" rx="3" fill="url(#gW)"/>
 <text x="${x+18}" y="${y+16}" font-size="26" font-weight="800" fill="${C.ink}">${t}</text>
 <text x="${x+18}" y="${y+42}" font-size="17" font-weight="500" fill="${C.sub}">${s}</text>`;}
// PODEA DE FONT (2026-07-14): viewBox=760 => scale ~0.47 pe mobil (390px). Niciun text sub 15u (~7px real).
// caption/sursa max ~90 caractere la font 15, altfel se taie la marginea cardului. Verifica orice chart nou la -w 390.
const cap=(x,y,t)=>`<text x="${x}" y="${y}" font-size="15" font-weight="500" fill="${C.faint}">${t}</text>`;
function card(W,H,inner){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="height:auto;display:block;max-width:${W}px;margin:1.5rem auto" font-family="${FONT}" role="img">
 ${defs()}<rect width="${W}" height="${H}" rx="22" fill="${C.canvas}"/>
 <rect x="14" y="14" width="${W-28}" height="${H-28}" rx="18" fill="${C.card}" stroke="${C.border}" filter="url(#soft)"/>
 ${inner}</svg>`;}
function vgrid(x0,x1,yTop,yBot,max,step,unit=''){let g='';for(let v=0;v<=max;v+=step){const x=x0+(v/max)*(x1-x0);g+=`<line x1="${x}" y1="${yTop}" x2="${x}" y2="${yBot}" stroke="${C.grid}" stroke-width="1" stroke-dasharray="2 5"/><text x="${x}" y="${yBot+18}" text-anchor="middle" font-size="15" font-weight="600" fill="${C.faint}">${v/1000}${unit||'k'}</text>`;}return g;}

const K={};

// 1 RANGE / DUMBBELL
K.range=()=>{const W=760,H=380,px=48,x0=px+140,x1=W-px-16,mx=13000,pyTop=110,rowH=70;
 const R=[['Junior','0-2 ani',5300,5900,6500],['Mediu','3-5 ani',7000,8000,9000],['Senior','5+ ani',10000,11200,12500]];
 const sx=v=>x0+(v/mx)*(x1-x0);let g=hd(px,38,'Interval de salariu','min - tipic - max pe experiență (lei net)');
 g+=vgrid(x0,x1,pyTop-12,pyTop+R.length*rowH-30,mx,2000);
 R.forEach((r,i)=>{const y=pyTop+i*rowH+6;g+=`<text x="${px}" y="${y}" font-size="17" font-weight="800" fill="${C.ink}">${r[0]}</text><text x="${px}" y="${y+18}" font-size="15.5" font-weight="600" fill="${C.sub}">${r[1]}</text>`;
  g+=`<line x1="${x0}" y1="${y-4}" x2="${x1}" y2="${y-4}" stroke="${C.track}" stroke-width="9" stroke-linecap="round"/><line x1="${sx(r[2])}" y1="${y-4}" x2="${sx(r[4])}" y2="${y-4}" stroke="url(#gD)" stroke-width="9" stroke-linecap="round"/>`;
  const d=sx(r[3]);g+=`<rect x="${d-5.5}" y="${y-9.5}" width="11" height="11" rx="2" transform="rotate(45 ${d} ${y-4})" fill="#fff" stroke="${C.navy}" stroke-width="2.5"/>`;
  g+=`<circle cx="${sx(r[2])}" cy="${y-4}" r="7" fill="#fff" stroke="${C.a1}" stroke-width="3"/><circle cx="${sx(r[4])}" cy="${y-4}" r="7" fill="#fff" stroke="${C.a1}" stroke-width="3"/>`;
  g+=`<text x="${sx(r[2])}" y="${y-18}" text-anchor="middle" font-size="16" font-weight="800" fill="${C.ink}">${fmt(r[2])}</text><text x="${sx(r[4])}" y="${y-18}" text-anchor="middle" font-size="16" font-weight="800" fill="${C.a1}">${fmt(r[4])}</text>`;});
 return card(W,H,g+cap(px,H-24,'Sursă: date piață · meseriile.ro'));};

// 2 RANKED BARS + BADGES
K.ranked=()=>{const W=760,H=400,px=48,x0=px+48,x1=W-px-64,rowH=52,pyTop=112;
 const R=[['Fond de investiții',100],['Fintech',82],['Bancă',74],['Corporație',60],['Big4',48]];const bw=v=>(v/100)*(x1-x0);
 let g=hd(px,38,'Clasament pe sector','nivel relativ de salariu (estimativ)');
 R.forEach((r,i)=>{const y=pyTop+i*rowH,gr=i===0?'url(#gN)':'url(#gW)';
  g+=`<circle cx="${px+15}" cy="${y+16}" r="15" fill="${i===0?C.navy:'#FBECE6'}"/><text x="${px+15}" y="${y+21}" text-anchor="middle" font-size="16.5" font-weight="800" fill="${i===0?'#fff':C.a1}">${i+1}</text>`;
  g+=`<text x="${x0}" y="${y+1}" font-size="16.5" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  g+=`<rect x="${x0}" y="${y+9}" width="${x1-x0}" height="19" rx="8" fill="${C.track}"/><rect x="${x0}" y="${y+9}" width="${bw(r[1])}" height="19" rx="8" fill="${gr}"/>`;
  g+=`<text x="${x0+bw(r[1])+10}" y="${y+23}" font-size="16" font-weight="800" fill="${i===0?C.navy:C.a1}">${i===0?'100':r[1]}</text>`;});
 return card(W,H,g+cap(px,H-24,'Ordonat după INS + piață · nivel relativ'));};

// 3 SEGMENTED (stacked single bar)
K.segmented=()=>{const W=760,H=300,px=48,x0=px,x1=W-px,bY=140,bH=44;
 const S=[['Nivel 1',1140],['Nivel 2',1140],['Nivel 3',1240],['Materiale',600]];const tot=S.reduce((a,b)=>a+b[1],0);const col=[C.navy,C.navy2,C.a1,C.a2];
 let g=hd(px,38,'Cost pe componente','structura unei cheltuieli, în USD');let cx=x0;
 S.forEach((s,i)=>{const w=(s[1]/tot)*(x1-x0);g+=`<rect x="${cx}" y="${bY}" width="${w}" height="${bH}" fill="${col[i]}" ${i===0?'rx="10"':''}/>`;if(i===S.length-1)g+=`<rect x="${cx+w-14}" y="${bY}" width="14" height="${bH}" rx="10" fill="${col[i]}"/>`;
  g+=`<text x="${cx+w/2}" y="${bY+bH/2+5}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">$${fmt(s[1])}</text><text x="${cx+w/2}" y="${bY-12}" text-anchor="middle" font-size="15.5" font-weight="700" fill="${C.slate}">${s[0]}</text>`;cx+=w;});
 g+=`<text x="${x1}" y="${bY+bH+42}" text-anchor="end" font-size="16" font-weight="600" fill="${C.sub}">Total</text><text x="${x1}" y="${bY+bH+70}" text-anchor="end" font-size="28" font-weight="800" fill="${C.ink}">≈ $${fmt(tot)}</text>`;
 return card(W,H,g+cap(px,H-24,'Sursă: date oficiale'));};

// 4 DONUT
K.donut=()=>{const W=760,H=352,cx=210,cy=212,R=100,r=60,brut=12000;const cas=brut*.25,cass=brut*.1,imp=(brut-cas-cass)*.1,net=brut-cas-cass-imp;
 const P4=[['Net',net,C.a1],['CAS 25%',cas,C.navy],['CASS 10%',cass,C.navy2],['Impozit 10%',imp,C.slate]];
 let g=hd(48,38,'Din brut în net','12.000 lei brut defalcat (2026)');let a=-P/2;
 const pt=(ang,rad)=>[cx+rad*Math.cos(ang),cy+rad*Math.sin(ang)];
 P4.forEach(p=>{const a2=a+(p[1]/brut)*2*P,lg=(a2-a)>P?1:0,[ox1,oy1]=pt(a,R),[ox2,oy2]=pt(a2,R),[ix1,iy1]=pt(a2,r),[ix2,iy2]=pt(a,r);
  g+=`<path d="M ${ox1} ${oy1} A ${R} ${R} 0 ${lg} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${r} ${r} 0 ${lg} 0 ${ix2} ${iy2} Z" fill="${p[2]}"/>`;a=a2;});
 g+=`<text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="16" font-weight="600" fill="${C.sub}">NET</text><text x="${cx}" y="${cy+24}" text-anchor="middle" font-size="28" font-weight="800" fill="${C.ink}">${fmt(net)}</text>`;
 let ly=108;P4.forEach(p=>{g+=`<rect x="410" y="${ly-13}" width="15" height="15" rx="4" fill="${p[2]}"/><text x="434" y="${ly}" font-size="16.5" font-weight="700" fill="${C.ink}">${p[0]}</text><text x="${W-48}" y="${ly}" text-anchor="end" font-size="16.5" font-weight="800" fill="${p[2]}">${fmt(p[1])}</text>`;ly+=40;});
 return card(W,H,g+cap(48,H-24,'Formula 2026: CAS+CASS+impozit'));};

// 5 STAIRCASE columns
K.staircase=()=>{const W=760,H=380,px=48,baseY=300;const S=[['Junior',5900],['Analist',8000],['Senior',11200],['Manager',15000,1],['CFO',24000,1]];
 const mx=26000,x0=px+6,x1=W-px-6,sw=(x1-x0)/S.length,sh=v=>(v/mx)*(baseY-110);let g=hd(px,38,'Creștere pe carieră','net pe lună, trepte succesive');let poly='';
 S.forEach((s,i)=>{const bx=x0+i*sw,h=sh(s[1]),by=baseY-h;g+=`<rect x="${bx+12}" y="${by}" width="${sw-24}" height="${h}" rx="9" fill="url(#gWv)" opacity="${s[2]?0.55:1}"/>`;
  g+=`<text x="${bx+sw/2}" y="${by-12}" text-anchor="middle" font-size="16.5" font-weight="800" fill="${s[2]?C.a2:C.a1}">${fmt(s[1])}</text>`;
  g+=`<text x="${bx+sw/2}" y="${baseY+22}" text-anchor="middle" font-size="15.5" font-weight="700" fill="${C.ink}">${s[0]}</text>`;poly+=`${bx+sw/2},${by-2} `;});
 return card(W,H,g+cap(px,H-24,'Ultimele trepte estimative'));};

// 6 GROUPED BARS (2 serii: RO vs străinătate)
K.grouped=()=>{const W=760,H=380,px=48,x0=px+140,x1=W-px-16,mx=16000,pyTop=108,rowH=64;
 const R=[['Bucătar',4200,9000],['Sudor',5000,11000],['Farmacist',5500,16000]];const sx=v=>x0+(v/mx)*(x1-x0);
 let g=hd(px,38,'România vs. străinătate','salariu net lunar echivalent (lei)');g+=vgrid(x0,x1,pyTop-10,pyTop+R.length*rowH-26,mx,4000);
 R.forEach((r,i)=>{const y=pyTop+i*rowH;g+=`<text x="${px}" y="${y+18}" font-size="16.5" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  g+=`<rect x="${x0}" y="${y}" width="${sx(r[1])-x0}" height="15" rx="5" fill="url(#gW)"/><text x="${sx(r[1])+8}" y="${y+13}" font-size="15.5" font-weight="800" fill="${C.a1}">${fmt(r[1])}</text>`;
  g+=`<rect x="${x0}" y="${y+22}" width="${sx(r[2])-x0}" height="15" rx="5" fill="url(#gN)"/><text x="${sx(r[2])+8}" y="${y+35}" font-size="15.5" font-weight="800" fill="${C.navy}">${fmt(r[2])}</text>`;});
 g+=`<rect x="${px}" y="${H-40}" width="13" height="13" rx="3" fill="url(#gW)"/><text x="${px+19}" y="${H-29}" font-size="15" font-weight="600" fill="${C.sub}">România</text><rect x="${px+140}" y="${H-40}" width="13" height="13" rx="3" fill="url(#gN)"/><text x="${px+159}" y="${H-29}" font-size="15" font-weight="600" fill="${C.sub}">Străinătate</text>`;
 return card(W,H,g);};

// 7 SIMPLE HBARS
K.hbars=()=>{const W=760,H=380,px=48,x0=px+150,x1=W-px-56,mx=8000,pyTop=104,rowH=46;
 const R=[['București',7200],['Cluj',6600],['Timișoara',6100],['Iași',5400],['Brașov',5600]];const bw=v=>(v/mx)*(x1-x0);
 let g=hd(px,38,'Salariu pe oraș','net mediu lunar (lei)');
 R.forEach((r,i)=>{const y=pyTop+i*rowH;g+=`<text x="${px}" y="${y+18}" font-size="16.5" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  g+=`<rect x="${x0}" y="${y+3}" width="${x1-x0}" height="20" rx="7" fill="${C.track}"/><rect x="${x0}" y="${y+3}" width="${bw(r[1])}" height="20" rx="7" fill="url(#gW)"/><text x="${x0+bw(r[1])+10}" y="${y+18}" font-size="16" font-weight="800" fill="${C.a1}">${fmt(r[1])}</text>`;});
 return card(W,H,g+cap(px,H-24,'Sursă: date piață'));};

// 8 WATERFALL
K.waterfall=()=>{const W=760,H=380,px=48,baseY=300,x0=px+6,x1=W-px-6;
 const steps=[['Brut',12000,'tot'],['CAS',-3000,'neg'],['CASS',-1200,'neg'],['Impozit',-780,'neg'],['Net',7020,'tot']];
 const mx=13000,sw=(x1-x0)/steps.length,sh=v=>(Math.abs(v)/mx)*(baseY-110);let g=hd(px,38,'Cum se topește brutul','din 12.000 brut rămâne netul (lei)');let run=0;
 steps.forEach((s,i)=>{const bx=x0+i*sw+12,w=sw-24;let top,h,col;
  if(s[2]==='tot'){h=sh(s[1]);top=baseY-h;col=i===0?'url(#gNv)':'url(#gWv)';run=s[1];}
  else{h=sh(s[1]);const prev=run;run+=s[1];top=baseY-sh(prev);col=C.slate;}
  g+=`<rect x="${bx}" y="${top}" width="${w}" height="${h}" rx="6" fill="${col}"/>`;
  g+=`<text x="${bx+w/2}" y="${top-8}" text-anchor="middle" font-size="15" font-weight="800" fill="${s[2]==='neg'?C.slate:C.ink}">${s[2]==='neg'?'':''}${fmt(Math.abs(s[1]))}</text>`;
  g+=`<text x="${bx+w/2}" y="${baseY+22}" text-anchor="middle" font-size="15.5" font-weight="700" fill="${C.ink}">${s[0]}</text>`;});
 g+=`<line x1="${x0}" y1="${baseY}" x2="${x1}" y2="${baseY}" stroke="${C.grid}" stroke-width="2"/>`;
 return card(W,H,g+cap(px,H-24,'Formula 2026'));};

// 9 LINE / AREA TREND
K.line=()=>{const W=760,H=360,px=48,x0=px+40,x1=W-px-16,yT=100,yB=280;
 const D=[['2021',4200],['2022',4700],['2023',5200],['2024',5600],['2025',5843],['2026',6100]];const mx=7000,mn=4000;
 const sx=i=>x0+(i/(D.length-1))*(x1-x0),sy=v=>yB-((v-mn)/(mx-mn))*(yB-yT);
 let g=hd(px,38,'Evoluție în timp','salariu mediu net pe economie (lei)');
 for(let v=4000;v<=7000;v+=1000){const y=sy(v);g+=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.grid}" stroke-width="1" stroke-dasharray="2 5"/><text x="${x0-10}" y="${y+4}" text-anchor="end" font-size="15" font-weight="600" fill="${C.faint}">${v/1000}k</text>`;}
 let pts=D.map((d,i)=>`${sx(i)},${sy(d[1])}`).join(' ');
 g+=`<polygon points="${x0},${yB} ${pts} ${x1},${yB}" fill="url(#gArea)"/><polyline points="${pts}" fill="none" stroke="url(#gW)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
 D.forEach((d,i)=>{g+=`<circle cx="${sx(i)}" cy="${sy(d[1])}" r="5" fill="#fff" stroke="${C.a1}" stroke-width="3"/><text x="${sx(i)}" y="${yB+22}" text-anchor="middle" font-size="15.5" font-weight="700" fill="${C.sub}">${d[0]}</text>`;});
 g+=`<text x="${sx(D.length-1)}" y="${sy(D[D.length-1][1])-14}" text-anchor="middle" font-size="16" font-weight="800" fill="${C.a1}">${fmt(D[D.length-1][1])}</text>`;
 return card(W,H,g+cap(px,H-24,'Sursă: INS'));};

// 10 LOLLIPOP
K.lollipop=()=>{const W=760,H=380,px=48,x0=px+150,x1=W-px-56,mx=13000,pyTop=104,rowH=48;
 const R=[['Analist investiții',11500],['Controller',10000],['Analist financiar',8500],['Economist',6000],['Contabil',5500]];const sx=v=>x0+(v/mx)*(x1-x0);
 let g=hd(px,38,'Comparație roluri','net mediu lunar (lei)');
 R.forEach((r,i)=>{const y=pyTop+i*rowH+8;g+=`<text x="${px}" y="${y+4}" font-size="16" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  g+=`<line x1="${x0}" y1="${y}" x2="${sx(r[1])}" y2="${y}" stroke="${C.track}" stroke-width="4" stroke-linecap="round"/><line x1="${x0}" y1="${y}" x2="${sx(r[1])}" y2="${y}" stroke="url(#gD)" stroke-width="4" stroke-linecap="round"/>`;
  g+=`<circle cx="${sx(r[1])}" cy="${y}" r="11" fill="${C.a1}"/><text x="${sx(r[1])+20}" y="${y+5}" font-size="16" font-weight="800" fill="${C.ink}">${fmt(r[1])}</text>`;});
 return card(W,H,g+cap(px,H-24,'Sursă: date piață'));};

// 11 BULLET (value vs target)
K.bullet=()=>{const W=760,H=360,px=48,x0=px+150,x1=W-px-40,mx=14000,pyTop=112,rowH=64;
 const R=[['Salariul tău',7000,9000],['Media rolului',8500,9000],['Top piață',12000,9000]];const sx=v=>x0+(v/mx)*(x1-x0);
 let g=hd(px,38,'Ești plătit corect','valoarea ta vs. reperul pieței (lei net)');
 R.forEach((r,i)=>{const y=pyTop+i*rowH;g+=`<text x="${px}" y="${y+22}" font-size="16.5" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  g+=`<rect x="${x0}" y="${y+8}" width="${x1-x0}" height="26" rx="6" fill="${C.track}"/><rect x="${x0}" y="${y+13}" width="${sx(r[1])-x0}" height="16" rx="5" fill="url(#gW)"/>`;
  g+=`<line x1="${sx(r[2])}" y1="${y+4}" x2="${sx(r[2])}" y2="${y+38}" stroke="${C.navy}" stroke-width="3"/>`;
  g+=`<text x="${sx(r[1])+8}" y="${y+26}" font-size="16" font-weight="800" fill="${C.a1}">${fmt(r[1])}</text>`;});
 g+=`<line x1="${px}" y1="${H-38}" x2="${px+18}" y2="${H-38}" stroke="${C.navy}" stroke-width="3"/><text x="${px+26}" y="${H-33}" font-size="15" font-weight="600" fill="${C.sub}">reper / țintă</text>`;
 return card(W,H,g);};

// 12 GAUGE semicircle
K.gauge=()=>{const W=760,H=320,cx=250,cy=250,R=150,pct=0.585;
 let g=hd(48,38,'Cât rămâne din brut','procentul net dintr-un salariu mare');
 const arc=(f)=>{const a=P+f*P,[x,y]=[cx+R*Math.cos(a),cy+R*Math.sin(a)];return `${x} ${y}`;};
 g+=`<path d="M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}" fill="none" stroke="${C.track}" stroke-width="26" stroke-linecap="round"/>`;
 g+=`<path d="M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${arc(pct)}" fill="none" stroke="url(#gW)" stroke-width="26" stroke-linecap="round"/>`;
 g+=`<text x="${cx}" y="${cy-18}" text-anchor="middle" font-size="46" font-weight="800" fill="${C.ink}">58,5%</text><text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="16.5" font-weight="600" fill="${C.sub}">net din brut (peste prag)</text>`;
 g+=`<text x="${cx-R}" y="${cy+26}" text-anchor="middle" font-size="15" font-weight="600" fill="${C.faint}">0%</text><text x="${cx+R}" y="${cy+26}" text-anchor="middle" font-size="15" font-weight="600" fill="${C.faint}">100%</text>`;
 return card(W,H,g+cap(48,H-24,'Formula 2026, fără deducere'));};

// 13 SLOPE (before/after)
K.slope=()=>{const W=760,H=380,px=48,xL=px+120,xR=W-px-120,yT=126,yB=302,mx=20000,mn=4000;
 const D=[['Fără CFA',8000,11000],['Cu CFA',13000,17000]];const sy=v=>yB-((v-mn)/(mx-mn))*(yB-yT);
 let g=hd(px,38,'Impact certificare','compensație înainte și după (global, USD/an mediu)');
 g+=`<text x="${xL}" y="${yT-16}" text-anchor="middle" font-size="16" font-weight="700" fill="${C.sub}">Fără CFA</text><text x="${xR}" y="${yT-16}" text-anchor="middle" font-size="16" font-weight="700" fill="${C.sub}">Cu CFA</text>`;
 [[8000,13000,C.slate,'Level 1'],[11000,17000,C.a1,'Charter']].forEach((s,i)=>{g+=`<line x1="${xL}" y1="${sy(s[0])}" x2="${xR}" y2="${sy(s[1])}" stroke="${s[2]}" stroke-width="3.5"/>`;
  g+=`<circle cx="${xL}" cy="${sy(s[0])}" r="6" fill="${s[2]}"/><circle cx="${xR}" cy="${sy(s[1])}" r="6" fill="${s[2]}"/>`;
  g+=`<text x="${xL-12}" y="${sy(s[0])+4}" text-anchor="end" font-size="15" font-weight="800" fill="${s[2]}">${fmt(s[0])}</text><text x="${xR+12}" y="${sy(s[1])+4}" font-size="15" font-weight="800" fill="${s[2]}">${fmt(s[1])}</text>`;});
 return card(W,H,g+cap(px,H-24,'Cifre globale (CFA Institute), nu RO'));};

// 14 STAT CARDS
K.stats=()=>{const W=760,H=260,px=40;const S=[['8.500 lei','net mediu/lună',C.a1],['+59%','cu CFA (global)',C.navy],['~971','joburi active RO',C.teal],['3,5','poziție Google',C.gold]];
 let g=hd(px,36,'Cifrele cheie','analist financiar pe scurt');const cw=(W-px*2-30)/4;
 S.forEach((s,i)=>{const x=px+i*(cw+10),y=118;g+=`<rect x="${x}" y="${y}" width="${cw}" height="100" rx="14" fill="${C.canvas}" stroke="${C.border}"/><rect x="${x}" y="${y}" width="5" height="100" rx="2.5" fill="${s[2]}"/>`;
  g+=`<text x="${x+cw/2+3}" y="${y+48}" text-anchor="middle" font-size="26" font-weight="800" fill="${C.ink}">${s[0]}</text><text x="${x+cw/2+3}" y="${y+74}" text-anchor="middle" font-size="15.5" font-weight="600" fill="${C.sub}">${s[1]}</text>`;});
 return card(W,H,g);};

// 15 PICTOGRAM (X din 10)
K.pictogram=()=>{const W=760,H=300,px=48;let g=hd(px,38,'Din 10 analiști','câți depășesc 9.000 lei net');
 const filled=4;for(let i=0;i<10;i++){const x=px+(i%5)*84,y=120+Math.floor(i/5)*74;const on=i<filled;
  g+=`<circle cx="${x+26}" cy="${y+26}" r="24" fill="${on?'url(#gW)':C.track}"/><path d="M ${x+26} ${y+16} a6 6 0 1 1 0 0.1 M ${x+14} ${y+40} a12 8 0 0 1 24 0" fill="none" stroke="${on?'#fff':C.faint}" stroke-width="2.5"/>`;}
 g+=`<text x="${W-px}" y="150" text-anchor="end" font-size="40" font-weight="800" fill="${C.a1}">4 din 10</text><text x="${W-px}" y="178" text-anchor="end" font-size="16" font-weight="600" fill="${C.sub}">peste 9.000 lei net</text>`;
 return card(W,H,g+cap(px,H-24,'Estimativ, din intervalul Paylab'));};

// 16 DIVERGING (above/below reference)
K.diverging=()=>{const W=760,H=380,px=48,midX=W/2,mx=4000,pyTop=110,rowH=48,half=(W-px*2)/2-30;
 const R=[['București',1800],['Cluj',1200],['Timișoara',600],['Iași',-500],['Botoșani',-1400]];const bw=v=>(Math.abs(v)/mx)*half;
 let g=hd(px,38,'Față de media națională','diferența salariului pe oraș (lei)');g+=`<line x1="${midX}" y1="${pyTop-8}" x2="${midX}" y2="${pyTop+R.length*rowH-10}" stroke="${C.grid}" stroke-width="1.5"/>`;
 R.forEach((r,i)=>{const y=pyTop+i*rowH,pos=r[1]>=0;g+=`<text x="${midX+(pos?-6:6)}" y="${y+15}" text-anchor="${pos?'end':'start'}" font-size="16" font-weight="700" fill="${C.ink}">${r[0]}</text>`;
  if(pos)g+=`<rect x="${midX}" y="${y+4}" width="${bw(r[1])}" height="18" rx="5" fill="url(#gW)"/><text x="${midX+bw(r[1])+8}" y="${y+18}" font-size="15" font-weight="800" fill="${C.a1}">+${fmt(r[1])}</text>`;
  else g+=`<rect x="${midX-bw(r[1])}" y="${y+4}" width="${bw(r[1])}" height="18" rx="5" fill="url(#gN)"/><text x="${midX-bw(r[1])-8}" y="${y+18}" text-anchor="end" font-size="15" font-weight="800" fill="${C.navy}">${fmt(r[1])}</text>`;});
 return card(W,H,g+cap(px,H-24,'Sursă: date piață'));};

// 17 FUNNEL / PYRAMID
K.funnel=()=>{const W=760,H=380,px=48,cx=W/2,yTop=100,rowH=52;const R=[['Junior',100],['Analist',68],['Senior',40],['Manager',18],['Director',6]];const maxW=W-px*2-120;
 let g=hd(px,38,'Piramida rolurilor','câți ajung sus (proporție relativă)');
 R.forEach((r,i)=>{const w=(r[1]/100)*maxW,y=yTop+i*rowH,gr=i<2?'url(#gW)':'url(#gN)';g+=`<rect x="${cx-w/2}" y="${y}" width="${w}" height="${rowH-12}" rx="8" fill="${gr}"/>`;
  g+=`<text x="${cx}" y="${y+26}" text-anchor="middle" font-size="16.5" font-weight="800" fill="#fff">${r[0]}</text>`;g+=`<text x="${cx+w/2+12}" y="${y+26}" font-size="15" font-weight="700" fill="${C.sub}">${r[1]}%</text>`;});
 return card(W,H,g+cap(px,H-24,'Ilustrativ'));};

// 18 PROGRESS RINGS
K.rings=()=>{const W=760,H=320,px=48;const D=[['Excel',0.9,C.a1],['SQL',0.7,C.navy],['Python',0.45,C.teal],['Engleză',0.85,C.gold]];
 let g=hd(px,36,'Skilluri care cresc salariul','cât de căutate sunt (relativ)');const cw=(W-px*2)/4;
 D.forEach((d,i)=>{const cx=px+i*cw+cw/2,cy=180,R=46;const circ=2*P*R,off=circ*(1-d[1]);
  g+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.track}" stroke-width="11"/>`;
  g+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${d[2]}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cy})"/>`;
  g+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="19" font-weight="800" fill="${C.ink}">${Math.round(d[1]*100)}%</text><text x="${cx}" y="${cy+72}" text-anchor="middle" font-size="16" font-weight="700" fill="${C.slate}">${d[0]}</text>`;});
 return card(W,H,g+cap(px,H-24,'Ilustrativ, cerere piață'));};

// 19 RANGE COLUMNS (floating high-low)
K.rangecol=()=>{const W=760,H=380,px=48,baseY=300,x0=px+6,x1=W-px-6;const D=[['Junior',5300,6500],['Mediu',7000,9000],['Senior',10000,12500],['Lead',13000,18000]];
 const mx=20000,sw=(x1-x0)/D.length,sy=v=>baseY-(v/mx)*(baseY-100);let g=hd(px,38,'Interval pe nivel','coloane min-max (lei net)');
 for(let v=0;v<=20000;v+=5000){const y=sy(v);g+=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${C.grid}" stroke-width="1" stroke-dasharray="2 5"/><text x="${x0-6}" y="${y+4}" text-anchor="end" font-size="15" font-weight="600" fill="${C.faint}">${v/1000}k</text>`;}
 D.forEach((d,i)=>{const bx=x0+i*sw+sw/2,top=sy(d[2]),bot=sy(d[1]);g+=`<rect x="${bx-22}" y="${top}" width="44" height="${bot-top}" rx="8" fill="url(#gWv)"/>`;
  g+=`<text x="${bx}" y="${top-8}" text-anchor="middle" font-size="15.5" font-weight="800" fill="${C.a1}">${fmt(d[2])}</text><text x="${bx}" y="${bot+18}" text-anchor="middle" font-size="15" font-weight="700" fill="${C.sub}">${fmt(d[1])}</text><text x="${bx}" y="${baseY+22}" text-anchor="middle" font-size="15.5" font-weight="700" fill="${C.ink}">${d[0]}</text>`;});
 g+=`<line x1="${x0}" y1="${baseY}" x2="${x1}" y2="${baseY}" stroke="${C.grid}" stroke-width="2"/>`;
 return card(W,H,g);};

// 20 100% STACKED
K.stack100=()=>{const W=760,H=300,px=48,x0=px,x1=W-px,bY=150,bH=46;const S=[['Salariu bază',62,C.navy],['Bonus/prime',20,C.a1],['Tichete',10,C.teal],['Alte beneficii',8,C.gold]];
 let g=hd(px,38,'Din ce e făcut venitul','structura pachetului total (%)');let cx=x0;
 S.forEach((s,i)=>{const w=(s[1]/100)*(x1-x0);g+=`<rect x="${cx}" y="${bY}" width="${w}" height="${bH}" fill="${s[2]}" ${i===0?'rx="10"':''}/>`;if(i===S.length-1)g+=`<rect x="${cx+w-14}" y="${bY}" width="14" height="${bH}" rx="10" fill="${s[2]}"/>`;
  if(w>50)g+=`<text x="${cx+w/2}" y="${bY+bH/2+5}" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">${s[1]}%</text>`;cx+=w;});
 let ly=bY+bH+34;let lx=px;S.forEach(s=>{g+=`<rect x="${lx}" y="${ly-12}" width="13" height="13" rx="3" fill="${s[2]}"/><text x="${lx+19}" y="${ly}" font-size="15" font-weight="600" fill="${C.sub}">${s[0]} ${s[1]}%</text>`;lx+=165;});
 return card(W,H,g+cap(px,H-24,'Exemplu pachet'));};

// render all
mkdirSync('/tmp/kit',{recursive:true});
const names=Object.keys(K);
for(const n of names){const svg=K[n]();writeFileSync(`/tmp/kit/${n}.svg`,svg);execSync(`rsvg-convert -w 900 /tmp/kit/${n}.svg -o /tmp/kit/${n}.png`);}
// contact sheet montage (5 cols)
try{execSync(`montage ${names.map(n=>`-label '${n}' /tmp/kit/${n}.png`).join(' ')} -tile 4x -geometry 460x+8+8 -background '#E9EEF3' -pointsize 22 /tmp/chartkit-contact.png`);}catch(e){console.log('montage fail:',e.message);}
console.log(`✓ ${names.length} tipuri: ${names.join(', ')}`);
