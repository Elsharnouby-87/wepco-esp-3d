const {BASE,calculate,number,millions}=window.WEPCO;
const $=sel=>document.querySelector(sel);
const $$=sel=>[...document.querySelectorAll(sel)];
const elem=(tag,attr={})=>{const x=document.createElement(tag);for(const [k,v] of Object.entries(attr))x.setAttribute(k,v);return x;};
const nf=(v,places=0)=>number(v,places);
const fmtMoney=v=>'EGP '+millions(v,2);
const state={price:BASE.dieselPrice,escalation:BASE.escalation,offtime:BASE.gensetOffHours,fx:BASE.fx,discount:BASE.discount,range:10,design:'feasibility',hour:12,playing:false,paused3D:false,scene:null,model:calculate(),baseModel:calculate()};
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function txt(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function formattedPayback(v){return v===null?'Not reached':nf(v,2)+' yrs';}
function animateKpi(selector,raw,display,suffix){const node=$(selector);if(!node)return;if(reducedMotion){node.innerHTML=display+'<span>'+suffix+'</span>';return;}const old=Number(node.dataset.current||0);node.dataset.current=raw;const start=performance.now(),duration=500;
 function step(now){const f=Math.min(1,(now-start)/duration),t=1-Math.pow(1-f,3);const val=old+(raw-old)*t;node.innerHTML=nf(val,2)+'<span>'+suffix+'</span>';if(f<1)requestAnimationFrame(step);else node.innerHTML=display+'<span>'+suffix+'</span>';}requestAnimationFrame(step);}
function updateModel(){state.model=calculate({dieselPrice:state.price,escalation:state.escalation,gensetOffHours:state.offtime,fx:state.fx,discount:state.discount});const m=state.model;
 txt('o-diesel',nf(state.price,2));txt('o-offtime',nf(state.offtime,1));txt('o-fx',nf(state.fx));txt('o-discount',nf(state.discount*100));$('#o-escalation').innerHTML=nf(state.escalation*100)+'%<span> / yr</span>';
 $$('[data-escalation]').forEach(b=>b.classList.toggle('active',Number(b.dataset.escalation)===state.escalation));
 animateKpi('[data-kpi="capex"]',m.capex/1e6,nf(m.capex/1e6,2),' M');
 const kpiPay=$('[data-kpi="payback"]');if(m.payback===null)kpiPay.innerHTML='N/A';else animateKpi('[data-kpi="payback"]',m.payback,nf(m.payback,2),' yr');
 const kpiIrr=$('[data-kpi="irr"]');if(m.irr===null)kpiIrr.innerHTML='N/A';else animateKpi('[data-kpi="irr"]',m.irr*100,nf(m.irr*100,2),'%');
 animateKpi('[data-kpi="npv"]',m.npv/1e6,nf(m.npv/1e6,2),' M');
 txt('result-npv',fmtMoney(m.npv));txt('result-irr',m.irr===null?'N/A':nf(m.irr*100,2)+'%');txt('result-payback',formattedPayback(m.payback));txt('result-year1',fmtMoney(m.year1Net));txt('result-fuel',nf(m.annualLitres)+' L/yr');
 txt('npv-trend',state.escalation===.2?'Base fuel escalation / '+nf(state.discount*100)+'% discount':nf(state.escalation*100)+'% fuel escalation / '+nf(state.discount*100)+'% discount');
 txt('value-gross',fmtMoney(m.year1Gross));txt('value-om',fmtMoney(m.yearOm));txt('value-net',fmtMoney(m.year1Net));
 txt('impact-litres',nf(m.annualLitres));txt('impact-carbon',nf(m.annualCo2t));txt('impact-carbon-life',nf(m.lifetimeCo2t));txt('impact-hours',nf(m.annualOffHours,1));txt('impact-ratio',nf(state.offtime/24*100,1)+'%');txt('impact-split',nf(state.offtime,1)+'h SOLAR/BESS WINDOW');txt('impact-off-day',nf(state.offtime,1)+' HR / DAY');
 $('#diesel-bar').style.width=nf(state.offtime/24*100,2)+'%';
 $$('[data-hour]').forEach(b=>b.classList.toggle('avoided',Number(b.dataset.hour)>=9.5&&Number(b.dataset.hour)<9.5+state.offtime));
 drawCashChart();drawDieselChart();
}
function initHoursGrid(){const g=$('#hours-grid');for(let i=0;i<24;i++){const b=elem('span',{'data-hour':String(i),'aria-hidden':'true'});g.appendChild(b);}}
function svgText(x,y,text,other=''){return `<text x="${x}" y="${y}" class="axis-label" ${other}>${text}</text>`;}
function drawCashChart(){const svg=$('#chart-cashflow');const model=state.model;const years=state.range;const values=[{year:0,cumulative:-model.capex},...model.results.slice(0,years)];const W=800,H=300,L=71,R=25,T=19,B=45;const min=Math.min(0,...values.map(d=>d.cumulative/1e6)),max=Math.max(0,...values.map(d=>d.cumulative/1e6));const minY=min-(max-min)*.08,maxY=max+(max-min)*.11;const x=yr=>L+yr/years*(W-L-R),y=v=>T+(maxY-v)/(maxY-minY)*(H-T-B);
 let grid='';for(let i=0;i<=4;i++){const v=minY+(maxY-minY)*(i/4);const yy=y(v);grid+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/>${svgText(L-12,yy+4,nf(v,0),'text-anchor="end"')}`;}
 for(let k=0;k<=5;k++){const yr=years/5*k;grid+=svgText(x(yr),H-18,nf(yr,0),'text-anchor="middle"');}
 const points=values.map(d=>[x(d.year),y(d.cumulative/1e6)]);const path=points.map(([xx,yy],i)=>(i?'L':'M')+xx.toFixed(2)+','+yy.toFixed(2)).join(' ');
 const area=`${path} L ${x(years)},${y(0)} L ${x(0)},${y(0)} Z`;
 let cashdots=values.filter(d=>d.year===0||d.year===years||d.year===1||d.year===5||d.year===10||d.year===25).map(d=>`<circle class="cashmark" data-year="${d.year}" cx="${x(d.year)}" cy="${y(d.cumulative/1e6)}" r="5" fill="#8fe2c7" stroke="#0f2830" stroke-width="2"><title>Year ${d.year}: ${fmtMoney(d.cumulative)}</title></circle>`).join('');
 let pay='';if(model.payback!==null&&model.payback<=years){pay=`<line class="payback-line" x1="${x(model.payback)}" x2="${x(model.payback)}" y1="${T}" y2="${H-B}"/><circle class="payback-dot" cx="${x(model.payback)}" cy="${y(0)}" r="6"/><text class="chart-tooltip" x="${Math.min(x(model.payback)+11,W-155)}" y="${Math.max(T+15,y(0)-13)}">PAYBACK ${nf(model.payback,2)}Y</text>`;}
 svg.innerHTML=`<defs><linearGradient id="cash-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#66e6ba" stop-opacity=".32"/><stop offset="1" stop-color="#4cd1ad" stop-opacity=".025"/></linearGradient></defs>${grid}<line x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}" class="zero-line"/><path class="area" d="${area}"/><path class="cash-path" d="${path}"/>${pay}${cashdots}${svgText(W-R,H-18,'YEAR','text-anchor="end"')}`;
 const ann=$('#cashflow-annotation');ann.textContent=model.payback!==null?'Payback '+nf(model.payback,2)+' years':'Payback not reached in model horizon';
 // Optional chart draw-in effect; only when path length is small enough and motion allowed.
 const line=svg.querySelector('.cash-path');if(!reducedMotion&&line&&line.getTotalLength()){const len=line.getTotalLength();line.style.strokeDasharray=String(len);line.style.strokeDashoffset=String(len);line.getBoundingClientRect();line.style.transition='stroke-dashoffset 650ms cubic-bezier(.2,.8,.2,1)';line.style.strokeDashoffset='0';}
}
function drawDieselChart(){const svg=$('#chart-diesel');const W=560,H=300,L=63,R=16,T=20,B=45,yrs=25;const paths=[{k:.1,type:'low'},{k:.2,type:'mid'},{k:.3,type:'high'}];const all=paths.flatMap(p=>Array.from({length:yrs},(_,i)=>state.price*Math.pow(1+p.k,i)));
 const lo=Math.log(Math.max(1,Math.min(...all))*.8),hi=Math.log(Math.max(...all)*1.3);
 const x=year=>L+(year-1)/(yrs-1)*(W-L-R),y=v=>T+(hi-Math.log(v))/(hi-lo)*(H-T-B);
 let grid='';for(let j=0;j<5;j++){const value=Math.exp(lo+(hi-lo)*j/4);grid+=`<line class="gridline" x1="${L}" x2="${W-R}" y1="${y(value)}" y2="${y(value)}"/>${svgText(L-11,y(value)+4,number(value,0),'text-anchor="end"')}`;}
 for(const yr of [1,5,10,15,20,25])grid+=svgText(x(yr),H-18,yr,'text-anchor="middle"');
 let lines='';for(const p of paths){const pts=Array.from({length:yrs},(_,i)=>` ${i?'L':'M'}${x(i+1).toFixed(2)},${y(state.price*Math.pow(1+p.k,i)).toFixed(2)}`).join('');lines+=`<path class="diesel-line ${p.type} ${state.escalation===p.k?'is-selected':''}" d="${pts}"/>`;const v=state.price*Math.pow(1+p.k,24);lines+=`<circle cx="${x(25)}" cy="${y(v)}" r="${state.escalation===p.k?5:3.2}" fill="${p.k===.1?'#78aae7':p.k===.2?'#6bdfb1':'#e8ae70'}"><title>${nf(p.k*100)}% scenario: ${nf(v,2)} EGP/L at Year 25</title></circle>`;}
 svg.innerHTML=grid+lines+svgText(W-R,H-18,'YEAR','text-anchor="end"');
}
function selectAsset(id,zoom=false){$$('[data-asset]').forEach(b=>b.classList.toggle('selected',b.dataset.asset===id));const supplier=state.design==='supplier';const info={pv:['Solar PV field',supplier?'456 kWp • 702 × 650 Wp Jinko modules':'304 kWp • 468 × 650 Wp illustrative modules','Ground-mounted bifacial PV array. Energy generation depends on solar irradiation, shading, losses and curtailment; conceptual geometry is not a construction layout.'],bess:['Battery energy storage',supplier?'3 × 161.3 kWh Huawei units (~483.9 kWh)':'3 × 107 kWh model units (321 kWh)','Battery-assisted genset-off operation requires approved grid-forming controls, SOC limits and commissioning of switching/interlocking.'],genset:['Existing diesel generator','CAT 3406C • baseline 740 litres/day','Existing generator runs outside the designated illustrative shutdown window. Actual switchover time, ratings and transition sequence require site validation.'],esp:['Electric submersible pump','165 kVA nominal load • 210 kVA start-up','24-hour critical load supplied through the VSD. The energy-source transition is designed to maintain uninterrupted pumping, subject to detailed integration studies.']}[id];if(!info)return;txt('asset-title',info[0]);txt('asset-subtitle',info[1]);txt('asset-description',info[2]);if(zoom&&state.scene)state.scene.focusAsset(id);}
function updateTime(){const t=state.hour;const hh=Math.min(23,Math.floor(t)),mm=Math.round((t-hh)*60)%60;txt('current-time',String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'));let daylight=t>=6&&t<18;txt('time-period',daylight?'DAYLIGHT':'NIGHT SHIFT');$('#hour-range').value=String(t);
 // The 09:30–15:00 window is for visualization only, not documented operational scheduling.
 const off=t>=9.5&&t<15;txt('pv-state',daylight?'PRODUCING':'IDLE');txt('bess-state',off?'DISCHARGING':'STANDBY');txt('diesel-state',off?'OFF':'ON');$('#diesel-state').style.color=off?'#72eabd':'#edc38f';
 if(state.scene)state.scene.setTime(t);
}
function switchDesign(){state.design=$('#design-basis').value;if(state.design==='supplier'){
 txt('spec-pv','456 kWp');txt('spec-bess','483.9 kWh');txt('spec-inv','3 × 150 kW');txt('design-warning','Supplier 456 kWp / 483.9 kWh physical scheme only. All economics remain those of the separate 304 kWp feasibility model — not recalculated for the supplier scope.');
 }else{txt('spec-pv','304 kWp');txt('spec-bess','321 kWh');txt('spec-inv','2 × 150 kW');txt('design-warning','Financial results correspond to the 304 kWp feasibility inputs. 3D visualization is indicative.');}
 if(state.scene)state.scene.setMode(state.design);selectAsset('pv',false);
}
function bind(){initHoursGrid();for(const [control,key,transform] of [['ctrl-diesel','price',Number],['ctrl-offtime','offtime',Number],['ctrl-fx','fx',Number],['ctrl-discount','discount',v=>Number(v)/100]]){$('#'+control).addEventListener('input',e=>{state[key]=transform(e.target.value);updateModel();});}
 $$('[data-escalation]').forEach(btn=>btn.addEventListener('click',()=>{state.escalation=Number(btn.dataset.escalation);updateModel();}));
 $('#reset-model').addEventListener('click',()=>{state.price=BASE.dieselPrice;state.escalation=BASE.escalation;state.offtime=BASE.gensetOffHours;state.fx=BASE.fx;state.discount=BASE.discount;for(const [id,value] of [['ctrl-diesel',state.price],['ctrl-offtime',state.offtime],['ctrl-fx',state.fx],['ctrl-discount',state.discount*100]])$('#'+id).value=String(value);updateModel();});
 $('#chart-ten').addEventListener('click',()=>{state.range=10;$('#chart-ten').classList.add('active');$('#chart-twentyfive').classList.remove('active');drawCashChart();});
 $('#chart-twentyfive').addEventListener('click',()=>{state.range=25;$('#chart-twentyfive').classList.add('active');$('#chart-ten').classList.remove('active');drawCashChart();});
 $('#hour-range').addEventListener('input',e=>{state.hour=Number(e.target.value);updateTime();});
 $('#design-basis').addEventListener('change',switchDesign);
 $$('[data-asset]').forEach(b=>b.addEventListener('click',()=>selectAsset(b.dataset.asset,true)));
 $('#view-reset').addEventListener('click',()=>state.scene?.resetCamera());
 $('#view-pause').addEventListener('click',()=>{state.paused3D=!state.paused3D;state.scene?.setPaused(state.paused3D);txt('view-pause',state.paused3D?'▶':'Ⅱ');});
 $('#time-play').addEventListener('click',()=>{state.playing=!state.playing;txt('play-text',state.playing?'Pause 24-hour cycle':'Play 24-hour cycle');txt('play-icon',state.playing?'Ⅱ':'▶');});
 let last=0;const tick=now=>{if(state.playing && !document.hidden){const delta=last?Math.min(.085,(now-last)/1000):0;state.hour=(state.hour+delta*1.15)%24;state.hour=Math.round(state.hour*100)/100;updateTime();}last=now;requestAnimationFrame(tick);};requestAnimationFrame(tick);
 updateModel();updateTime();switchDesign();
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting&&state.playing&&entry.target.id==='experience'){state.playing=false;txt('play-text','Play 24-hour cycle');txt('play-icon','▶');}})},{threshold:.05});observer.observe($('#experience'));}
 // Scene loading is independent: finance, controls and charts remain functional offline.
 import('./scene.js').then(({MicrogridScene})=>{try{state.scene=new MicrogridScene($('#three-canvas'),{onAssetClick:id=>selectAsset(id,false)});$('#scene-fallback').remove();state.scene.setTime(state.hour);state.scene.setMode(state.design);if(reducedMotion)state.scene.setPaused(true);}catch(err){console.warn('3D renderer unavailable, static schematic shown:',err);txt('scene-fallback','');$('#scene-fallback').innerHTML='<div class="fallback-art"><div class="fallback-sun"></div><div class="fallback-panels"></div><div class="fallback-box a"></div><div class="fallback-box b"></div><div class="fallback-box c"></div></div><p>Interactive 3D requires WebGL support.</p>';}}).catch(err=>{$('#scene-fallback p').textContent='3D renderer requires an internet connection to load Three.js.';console.warn('3D module unavailable:',err);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();