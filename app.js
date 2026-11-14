'use strict';
const KEY='spese-v6',ACC={main:'Conto principale',sat:'Satispay',pv:'Salvadanaio viaggi',pa:'Salvadanaio assicurazione auto'};
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),pd=s=>new Date(s+'T12:00:00');
const eur=n=>n.toLocaleString('it-IT',{style:'currency',currency:'EUR'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=[['cibo','Cibo','🍝','#e57373'],['casa','Casa','🏠','#ba68c8'],['trasporti','Trasporti','🚌','#64b5f6'],['salute','Salute','💊','#4db6ac'],['svago','Svago','🎬','#ffb74d'],['abbigliamento','Abbigliamento','👕','#7986cb'],['regali','Regali','🎁','#f06292'],['bollette','Bollette','💡','#fff176'],['ristoranti','Ristoranti','🍕','#ff8a65'],['caffe','Caffè','☕','#a1887f'],['pulizie','Pulizie','🧹','#81c784'],['sport','Sport','🏃','#4dd0e1'],['persona','Cura persona','💇','#ce93d8'],['altro','Altro','📦','#90a4ae'],['viaggi','Viaggi','✈️','#42a5f5'],['assicurazione','Assicurazione auto','🚗','#8d6e63']];
function def(){const t=ymd(new Date());return{sd:15,carry:false,dark:false,target:300,init:{main:0,sat:0,pv:400,pa:250},tx:[],
cats:CATS.map(([id,n,e,c])=>({id,n,e,c})),inc:[{id:'stip',n:'Stipendio',e:'💼',c:'#1f8a70'},{id:'altre',n:'Altre entrate',e:'💰',c:'#1f8a70'}],
rec:[{id:'1',n:'Accantonamento viaggi',a:20,acc:'sat',to:'pv',cat:'viaggi',f:'w',d:1,from:t},{id:'2',n:'Accantonamento assicurazione auto',a:50,acc:'sat',to:'pa',cat:'assicurazione',f:'m',d:15,from:t}]}}
function load(){try{const s=JSON.parse(localStorage[KEY]);if(s&&s.tx)return s}catch(e){}return def()}
let S=load(),ui={tab:'home',view:'main',off:0,flt:1,rf:'all',acc:null,sh:null};
const save=()=>{localStorage[KEY]=JSON.stringify(S)};
const addD=(x,k)=>{x=new Date(x);x.setDate(x.getDate()+k);return x};
const bal=(a,b)=>S.tx.reduce((s,t)=>{if(b&&t.date>=b)return s;if(t.acc==a)s+=t.type=='inc'?t.a:-t.a;if(t.to==a)s+=t.a;return s},S.init[a]||0);
const delta=(t,a)=>(t.acc==a?(t.type=='inc'?t.a:-t.a):0)+(t.to==a?t.a:0);
function per(o){const t=new Date();let m=t.getMonth();if(t.getDate()<S.sd)m--;const f=k=>ymd(new Date(t.getFullYear(),m+o+k,S.sd));return{s:f(0),n:f(1)}}
const lab=p=>{const f=d=>d.toLocaleDateString('it-IT',{day:'numeric',month:'short'});return f(pd(p.s))+' – '+f(addD(pd(p.n),-1))};
// Genera ricorrenze e ricarica Satispay (con la data giusta, anche se apro l'app dopo)
function gen(){const td=ymd(new Date());
S.rec.forEach(r=>{for(let x=pd(r.last?ymd(addD(pd(r.last),1)):r.from);ymd(x)<=td;x=addD(x,1)){if(r.f=='m'?x.getDate()==r.d:x.getDay()==r.d){const id='r'+r.id+ymd(x);if(!S.tx.some(t=>t.id==id))S.tx.push({id,date:ymd(x),type:'exp',acc:r.acc,to:r.to||undefined,cat:r.cat,a:r.a,note:r.n,auto:1})}}r.last=td});
if(!S.from){let x=new Date();x=new Date(x.getFullYear(),x.getMonth()+(x.getDate()>S.sd?1:0),S.sd);S.from=ymd(x)}
for(let x=pd(S.from);ymd(x)<=td;x=new Date(x.getFullYear(),x.getMonth()+1,S.sd)){const d=ymd(x),id='top'+d;if(S.tx.some(t=>t.id==id))continue;const a=Math.max(0,Math.round((S.target-bal('sat',d))*100)/100);if(a>0)S.tx.push({id,date:d,type:'top',acc:'main',to:'sat',a,note:'Ricarica Satispay',auto:1})}
S.tx.sort((a,b)=>a.date<b.date?-1:1);save()}
function stats(v,p){let e=0,i=0,top=0,bc={};S.tx.forEach(t=>{if(t.date<p.s||t.date>=p.n)return;
if(t.type=='inc'){if(v!='sat')i+=t.a}else if(t.type=='exp'){if(v=='all'?(t.acc=='main'||t.acc=='sat'):t.acc==v){e+=t.a;bc[t.cat]=(bc[t.cat]||0)+t.a}}else if(t.type=='top'&&v=='main')top+=t.a});
const sal=v=='main'?(S.carry?bal('main',p.n):i-e-top):v=='sat'?bal('sat',p.n):(S.carry?bal('main',p.n)+bal('sat',p.n):i-e);return{e,i,bc,sal}}
const catOf=t=>t.type=='top'?{e:'🔁',n:'Ricarica Satispay'}:(t.type=='inc'?S.inc:S.cats).find(c=>c.id==t.cat)||{e:'❓',n:'?'};
const sg=n=>(n>=0?'':'−')+eur(Math.abs(n));
const LIM=8;
function chart(st){const tot=st.e,L=S.cats.filter(c=>st.bc[c.id]).sort((a,b)=>st.bc[b.id]-st.bc[a.id]);let ac=0;
const bg=tot>0?'conic-gradient('+L.map(c=>{const s=ac/tot*100;ac+=st.bc[c.id];return `${c.c} ${s}% ${ac/tot*100}%`}).join(',')+')':'var(--ln)';
const rest=L.slice(5).reduce((s,c)=>s+st.bc[c.id],0);
return `<div class=pie><div class=donut style="background:${bg}"><b>${eur(tot)}</b></div><div class=leg>${tot>0?L.slice(0,5).map(c=>`<div><i style="background:${c.c}"></i>${c.e} ${esc(c.n)}<b>${Math.round(st.bc[c.id]/tot*100)}%</b></div>`).join('')+(rest?`<div><i style="background:#999"></i>Altre<b>${Math.round(rest/tot*100)}%</b></div>`:''):'Nessuna spesa in questo periodo.'}</div></div>`}
function gridCats(st){const m=S.cats.length>LIM,vis=m?S.cats.slice(0,LIM-1):S.cats;return vis.map(c=>`<button data-x="cat:${c.id}"><i style="background:${c.c}33">${c.e}</i>${esc(c.n)}<b style="color:var(--tx)">${st.bc[c.id]?eur(st.bc[c.id]):''}</b></button>`).join('')+(m?`<button data-x="cat:${S.cats[LIM-1].id}"><i style="background:#90a4ae33">⋯</i>Altre</button>`:'')}
function home(){const p=per(ui.off),v=ui.view,st=stats(v,p),hasInc=S.tx.some(t=>t.type=='inc'&&t.date>=p.s&&t.date<p.n);
return `<div class=seg>${[['main','Principale'],['sat','Satispay'],['all','Tutto']].map(([k,l])=>`<button data-x="view:${k}" class="${v==k?'on':''}">${l}</button>`).join('')}</div>
<div class=pn><button data-x="off:-1" ${ui.off<=-12?'disabled':''}>‹</button><b>${lab(p)}</b><button data-x="off:1" ${ui.off>=1?'disabled':''}>›</button></div>
${!hasInc&&v!='sat'&&ui.off==0?`<button class=warn data-x="sal">⚠️ Stipendio non ancora inserito per questo periodo. Tocca per aggiungerlo.</button>`:''}
<div class=ctr><span>Entrate<b class=pos>${eur(st.i)}</b></span><span>Uscite<b class=neg>${eur(st.e)}</b></span><span>Differenza<b>${sg(st.i-st.e)}</b></span></div>
${chart(st)}<div class=grid>${gridCats(st)}</div>
<div class=sal><div><small style="color:var(--mu)">Saldo</small><br><b class="${st.sal<0?'neg':''}" style="font-size:22px">${sg(st.sal)}</b></div><div class=bt><button style="background:#d9534f" data-x="new:exp">−</button><button style="background:#1f8a70" data-x="new:inc">+</button></div></div>`}
function rowT(t,a){const c=catOf(t),d=a?delta(t,a):(t.type=='inc'?t.a:-t.a);return `<div class=r data-x="edit:${t.id}"><span style="font-size:24px">${c.e}</span><div>${esc(t.note||c.n)}<small>${t.date.split('-').reverse().join('/')} · ${ACC[t.acc]}${t.to?' → '+ACC[t.to]:''}</small></div><b class="${t.type=='top'&&!a?'':d<0?'neg':'pos'}">${t.type=='top'&&!a?'↔ '+eur(t.a):sg(d)}</b></div>`}
function list(){const since=per(-(ui.flt-1)).s,L=S.tx.filter(t=>t.date>=since).reverse();
return `<h2>Movimenti</h2><select data-p="@flt" data-num>${[[1,'Periodo corrente'],[3,'Ultimi 3 mesi'],[6,'Ultimi 6 mesi'],[12,'Ultimi 12 mesi']].map(([k,l])=>`<option value=${k} ${ui.flt==k?'selected':''}>${l}</option>`).join('')}</select>
<div class=card>${L.map(t=>rowT(t)).join('')||'Nessun movimento. Tocca + o − in Home per aggiungerne uno.'}</div>`}
function conti(){if(ui.acc){const a=ui.acc,L=S.tx.filter(t=>t.acc==a||t.to==a).reverse();return `<button data-x=back>‹ Conti</button><h2>${ACC[a]}</h2><div class=card><b style="font-size:26px">${eur(bal(a))}</b><br><small>Saldo iniziale: ${eur(S.init[a]||0)}</small> <button data-x="init:${a}">Modifica</button></div><div class=card>${L.map(t=>rowT(t,a)).join('')||'Nessun movimento.'}</div>`}
return `<h2>Conti</h2><p class=help>Tocca un conto per vedere i movimenti. I salvadanai si riempiono con gli accantonamenti da Satispay; per spendere da un salvadanaio scegli quel conto quando inserisci una spesa.</p>${Object.keys(ACC).map(k=>`<div class="card r" data-x="acc:${k}"><span style="font-size:24px">${k=='main'?'🏦':k=='sat'?'📱':'🐷'}</span><div>${ACC[k]}</div><b class="${bal(k)<0?'neg':''}">${eur(bal(k))}</b></div>`).join('')}`}
function rec(){const f=ui.rf,L=S.rec.filter(r=>f=='all'||(f=='pp'?r.via:r.acc==f));
return `<h2>Abbonamenti e ricorrenze</h2><p class=help>Si registrano da soli ogni volta che apri l'app, alla data giusta. Ogni voce esce dal conto scelto. "PayPal" è solo un filtro: l'importo scende comunque dal conto.</p>
<div class=seg style="flex-wrap:wrap">${[['all','Tutti'],['main','Principale'],['sat','Satispay'],['pp','PayPal']].map(([k,l])=>`<button data-x="rf:${k}" class="${f==k?'on':''}">${l}</button>`).join('')}</div>
<div class=card>${L.map(r=>`<div class=r data-x="rec:${r.id}"><span style="font-size:24px">${(S.cats.find(c=>c.id==r.cat)||{e:'🔁'}).e}</span><div>${esc(r.n)}<small>${ACC[r.acc]}${r.to?' → '+ACC[r.to]:''}${r.via?' · PayPal':''} · ${r.f=='m'?'ogni mese il '+r.d:'ogni '+['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'][r.d]}</small></div><b>${eur(r.a)}</b></div>`).join('')||'Nessuna voce.'}</div><button class=pri style="width:100%" data-x="rec:new">+ Nuova ricorrenza</button>`}
function catEd(k,t){return `<details><summary>${t}</summary>${S[k].map((c,i)=>`<div class=ce><input data-p="${k}.${i}.e" value="${c.e}"><input data-p="${k}.${i}.n" value="${esc(c.n)}"><input type=color data-p="${k}.${i}.c" value="${c.c||'#90a4ae'}"><button data-x="catup:${k}:${i}">▲</button><button data-x="catdel:${k}:${i}">🗑</button></div>`).join('')}<button style="margin-top:8px" data-x="catadd:${k}">+ Aggiungi</button></details>`}
function altro(){return `<h2>Altro</h2><div class=card style="display:grid;gap:8px">
<label>Giorno di inizio del mese (1-28)<input type=number min=1 max=28 data-p=sd data-num value=${S.sd}></label>
<label>Ricarica Satispay: importo massimo (€)<input type=number data-p=target data-num value=${S.target}></label>
<label class=chk><input type=checkbox data-p=carry ${S.carry?'checked':''}>Riporta il saldo dal periodo precedente</label>
<label class=chk><input type=checkbox data-p=dark ${S.dark?'checked':''}>Tema scuro</label></div>
${catEd('cats','Categorie di spesa')}${catEd('inc','Categorie di entrata')}
<h3>Backup</h3><div class=card style="display:grid;gap:8px"><button data-x=exp>Esporta JSON (backup completo)</button><button data-x=csv>Esporta CSV</button><button data-x=imp>Importa JSON</button><button class=dng data-x=reset>Cancella tutti i dati</button></div>`}
function sheet(o){ui.sh=o;const ex=o.type!='inc',cs=ex?S.cats:S.inc;
$('#sh').innerHTML=`<div class=box><div class=seg><button data-x="stype:exp" class="${ex?'on':''}">Uscita</button><button data-x="stype:inc" class="${!ex?'on':''}">Entrata</button></div>
<input id=fa inputmode=decimal placeholder="0,00" value="${o.a??''}">
<label>Categoria<select id=fc>${cs.map(c=>`<option value=${c.id} ${c.id==o.cat?'selected':''}>${c.e} ${esc(c.n)}</option>`).join('')}</select></label>
<label>Conto<select id=fk>${Object.keys(ACC).map(k=>`<option value=${k} ${k==(o.acc||'main')?'selected':''}>${ACC[k]}</option>`).join('')}</select></label>
<label>Data<input id=fd type=date value="${o.date||ymd(new Date())}"></label><input id=fn placeholder="Nota" value="${esc(o.note)}">
<div class=row>${o.id?'<button class=dng data-x=del>Elimina</button>':''}<button data-x=close>Annulla</button><button class=pri data-x=save>Salva</button></div></div>`;$('#sh').hidden=false;if(!o.id)setTimeout(()=>$('#fa').focus(),50)}
const gather=()=>({id:ui.sh.id,type:ui.sh.type,a:$('#fa').value,cat:$('#fc').value,acc:$('#fk').value,date:$('#fd').value,note:$('#fn').value});
function recSheet(id){const r=S.rec.find(x=>x.id==id)||{f:'m',d:15,acc:'main',cat:'altro',a:''};ui.sh={rec:r.id||'new'};
$('#sh').innerHTML=`<div class=box><label>Nome<input id=rn value="${esc(r.n)}"></label><label>Importo (€)<input id=ra inputmode=decimal value="${r.a}"></label>
<label>Conto da cui esce<select id=rk>${['main','sat'].map(k=>`<option value=${k} ${r.acc==k?'selected':''}>${ACC[k]}</option>`).join('')}</select></label>
<label>Categoria<select id=rc>${S.cats.map(c=>`<option value=${c.id} ${r.cat==c.id?'selected':''}>${c.e} ${esc(c.n)}</option>`).join('')}</select></label>
<label>Frequenza<select id=rf2><option value=m ${r.f=='m'?'selected':''}>Ogni mese</option><option value=w ${r.f=='w'?'selected':''}>Ogni settimana</option></select></label>
<label>Se mensile: giorno del mese (1-28)<input id=rd type=number min=1 max=28 value="${r.f=='m'?r.d:15}"></label>
<label>Se settimanale: giorno<select id=rw>${['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'].map((n,i)=>`<option value=${i} ${r.f=='w'&&r.d==i?'selected':''}>${n}</option>`).join('')}</select></label>
<label>Accantona in un salvadanaio?<select id=rt><option value="">No</option><option value=pv ${r.to=='pv'?'selected':''}>${ACC.pv}</option><option value=pa ${r.to=='pa'?'selected':''}>${ACC.pa}</option></select></label>
<label class=chk><input id=rp type=checkbox ${r.via?'checked':''}>Si paga con PayPal (solo filtro)</label>
<div class=row>${r.id?'<button class=dng data-x=rdel>Elimina</button>':''}<button data-x=close>Annulla</button><button class=pri data-x=rsave>Salva</button></div></div>`;$('#sh').hidden=false}
function render(){document.body.className=S.dark?'dark':'';$('#app').innerHTML={home,list,conti,rec,altro}[ui.tab]();document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==ui.tab))}
const close=()=>{$('#sh').hidden=true;ui.sh=null};
const dl=(n,t,m)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click()};
document.addEventListener('click',e=>{const el=e.target.closest('[data-x]');if(!el){if(e.target.id=='sh')close();return}
const[a,g]=[el.dataset.x.split(':')[0],el.dataset.x.split(':').slice(1).join(':')];
if(a=='tab'){ui.tab=g;ui.acc=null;render()}else if(a=='view'){ui.view=g;render()}else if(a=='off'){ui.off+=+g;render()}
else if(a=='cat')sheet({type:'exp',cat:g,acc:ui.view=='sat'?'sat':'main'});
else if(a=='new')sheet({type:g,cat:g=='inc'?'stip':'altro',acc:ui.view=='sat'?'sat':'main'});
else if(a=='sal')sheet({type:'inc',cat:'stip',acc:'main'});
else if(a=='edit'){const t=S.tx.find(x=>x.id==g);if(t.type=='top'){if(confirm('Eliminare questa ricarica? Verrà ricalcolata solo se la cancelli e cambi la data.')){S.tx=S.tx.filter(x=>x!=t);save();render()}}else sheet({...t})}
else if(a=='stype')sheet({...gather(),type:g,cat:undefined,acc:$('#fk').value});
else if(a=='save'){const o=gather(),n=parseFloat(String(o.a).replace(',','.'));if(!(n>0)||!o.date)return alert('Inserisci un importo e una data.');const old=S.tx.find(x=>x.id==o.id),t={id:o.id||'m'+Date.now(),date:o.date,type:o.type,acc:o.acc,cat:o.cat,a:Math.round(n*100)/100,note:o.note};if(old&&old.to&&o.type=='exp'&&old.acc==o.acc)t.to=old.to;S.tx=S.tx.filter(x=>x.id!=t.id).concat(t).sort((x,y)=>x.date<y.date?-1:1);save();close();render()}
else if(a=='del'){if(confirm('Eliminare il movimento?')){S.tx=S.tx.filter(x=>x.id!=ui.sh.id);save();close();render()}}
else if(a=='close')close();
else if(a=='acc'){ui.acc=g;render()}else if(a=='back'){ui.acc=null;render()}
else if(a=='init'){const v=prompt('Saldo iniziale di '+ACC[g]+' (€):',S.init[g]||0);if(v!==null&&!isNaN(parseFloat(v.replace(',','.')))){S.init[g]=parseFloat(v.replace(',','.'));save();render()}}
else if(a=='rf'){ui.rf=g;render()}else if(a=='rec')recSheet(g);
else if(a=='rsave'){const n=parseFloat($('#ra').value.replace(',','.')),f=$('#rf2').value;if(!$('#rn').value||!(n>0))return alert('Inserisci nome e importo.');const old=S.rec.find(x=>x.id==ui.sh.rec),r={id:old?old.id:'u'+Date.now(),n:$('#rn').value,a:n,acc:$('#rk').value,cat:$('#rc').value,f,d:f=='m'?Math.min(28,Math.max(1,+$('#rd').value||15)):+$('#rw').value,to:$('#rt').value||undefined,via:$('#rp').checked?'pp':undefined,from:old?old.from:ymd(new Date()),last:old?old.last:undefined};S.rec=S.rec.filter(x=>x!=old).concat(r);save();close();gen();render()}
else if(a=='rdel'){if(confirm('Eliminare la ricorrenza? I movimenti già registrati restano.')){S.rec=S.rec.filter(x=>x.id!=ui.sh.rec);save();close();render()}}
else if(a=='catadd'){S[g].push({id:'c'+Date.now(),n:'Nuova',e:'🏷️',c:'#90a4ae'});save();render();document.querySelector('details:last-of-type')}
else if(a=='catup'){const[k,s]=g.split(':'),j=+s;if(j>0){[S[k][j-1],S[k][j]]=[S[k][j],S[k][j-1]];save();render()}}
else if(a=='catdel'){const[k,i]=g.split(':');if(confirm('Eliminare la categoria? I movimenti già registrati restano ma senza icona.')){S[k].splice(+i,1);save();render()}}
else if(a=='exp')dl('spese-backup-'+ymd(new Date())+'.json',JSON.stringify(S),'application/json');
else if(a=='csv')dl('spese-'+ymd(new Date())+'.csv','Data;Tipo;Conto;Verso;Categoria;Importo;Nota\n'+S.tx.map(t=>[t.date,t.type,ACC[t.acc],t.to?ACC[t.to]:'',catOf(t).n,String(t.a).replace('.',','),'"'+(t.note||'').replace(/"/g,'""')+'"'].join(';')).join('\n'),'text/csv');
else if(a=='imp')$('#imp').click();
else if(a=='reset'&&confirm('Cancellare TUTTI i dati? Fai prima un backup.')){S=def();save();gen();render()}});
document.addEventListener('change',e=>{const el=e.target;if(el.id=='imp'){const f=el.files[0];if(!f)return;f.text().then(x=>{try{const s=JSON.parse(x);if(!s.tx)throw 0;S=s;save();gen();render()}catch(err){alert('File non valido.')}});return}
const p=el.dataset.p;if(!p)return;let v=el.type=='checkbox'?el.checked:el.dataset.num!==undefined?+el.value:el.value;
if(p=='@flt'){ui.flt=v;render();return}
if(p=='sd'){v=Math.min(28,Math.max(1,v||15))}
const k=p.split('.');let o=S;k.slice(0,-1).forEach(x=>o=o[x]);o[k[k.length-1]]=v;save();if(p=='sd'||p=='carry'||p=='dark'||p=='target')render()});
let sx=0;document.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{if(ui.tab!='home'||!$('#sh').hidden)return;const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>70){const o=ui.off+(d<0?1:-1);if(o>=-12&&o<=1){ui.off=o;render()}}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
gen();render();
