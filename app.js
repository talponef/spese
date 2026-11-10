const $=s=>document.querySelector(s),V=$('#v'),SH=$('#sh'),K='spese-dati';
const FR={w1:['Ogni settimana',7,'d'],w2:['Ogni 2 settimane',14,'d'],w4:['Ogni 4 settimane',28,'d'],m1:['Ogni mese',1,'m'],m2:['Ogni 2 mesi',2,'m'],m3:['Ogni 3 mesi',3,'m'],m6:['Ogni 6 mesi',6,'m'],y1:['Ogni anno',12,'m']};
const C0=[['e','Spesa','🛒','#d6568c'],['e','Casa','🏠','#4f93c8'],['e','Auto','🚗','#6b7a99'],['e','Ristoranti','🍴','#3aa88a'],['e','Svago','🍸','#e8a33d'],['e','Regali','🎁','#b58a9a'],['e','Salute','🌡️','#d9534f'],['e','Vestiti','👕','#9b59b6'],['e','Telefono','📞','#8e7cc3'],['e','Sport','⚽','#2aa5a5'],['e','Animali','🐱','#5aa469'],['e','Igiene','🧴','#5a7fa8'],['e','Trasporti','🚆','#e57373'],['e','Bollette','🧾','#8d6e63'],['i','Stipendio','💶','#2f7d63'],['i','Risparmi','🐷','#e6a1b0'],['i','Altre entrate','💰','#7fb069']];
const uid=()=>Math.random().toString(36).slice(2,9);
const def=()=>({v:2,cats:C0.map(([t,n,e,col])=>({id:uid(),t,n,e,col})),tx:[],subs:[],acc:['Contanti','Carta'],st:{day:15,carry:true}});
let D,S,tab='home',off=0;
try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||def();
if((D.v||1)<2)D=(D.tx.length||D.subs.length)?Object.assign(D,{v:2}):def();
const theme=()=>{document.documentElement.dataset.t=D.st.dark?'dark':'light'};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
const cat=id=>D.cats.find(c=>c.id===id);
const E=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const fm=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const pd=s=>{const[a,b,c]=s.split('-');return new Date(+a,b-1,+c)};
const dfmt=s=>pd(s).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
const addM=(d,n)=>{const r=new Date(d.getFullYear(),d.getMonth()+n,1);r.setDate(Math.min(d.getDate(),new Date(r.getFullYear(),r.getMonth()+1,0).getDate()));return r};
const occ=(s,n)=>{const[,st,u]=FR[s.f],b=pd(s.st);return u==='d'?new Date(b.getFullYear(),b.getMonth(),b.getDate()+n*st):addM(b,n*st)};

// Periodo: parte dal giorno scelto (es. 15) e finisce il giorno prima del successivo
function calc(){
  const t=new Date(),sd=D.st.day,m=t.getMonth()+off+(t.getDate()<sd?-1:0);
  const s=iso(new Date(t.getFullYear(),m,sd)),e=iso(new Date(t.getFullYear(),m+1,sd-1));
  const T=D.tx.filter(x=>x.d>=s&&x.d<=e);let inc=0,exp=0,car=0;const by={};
  T.forEach(x=>{const c=cat(x.c);if(!c)return;if(c.t==='i')inc+=x.a;else{exp+=x.a;by[x.c]=(by[x.c]||0)+x.a}});
  if(D.st.carry)D.tx.forEach(x=>{if(x.d<s){const c=cat(x.c);if(c)car+=c.t==='i'?x.a:-x.a}});
  return{s,e,T,inc,exp,by,car};
}
// Abbonamenti: registra gli addebiti scaduti (anche quelli persi se l’app non è stata aperta)
function runSubs(){
  const t=iso(new Date());let ch=0;
  D.subs.forEach(s=>{if(!s.on)return;s.n=s.n||0;
    for(let g=0;g<500;g++){const d=iso(occ(s,s.n));if(d>t||(s.end&&d>s.end))break;
      if(!D.tx.some(x=>x.s===s.id&&x.d===d))D.tx.push({id:uid(),d,a:s.a,c:s.c,k:s.ac,n:s.nm,s:s.id});
      s.n++;ch=1}});
  if(ch)save();
}
const hdr=r=>`<div class="per"><button data-a="o" data-v="-1" aria-label="Periodo precedente">‹</button><b>${dfmt(r.s)} – ${dfmt(r.e)}</b><button data-a="o" data-v="1" ${off>=0?'disabled':''} aria-label="Periodo successivo">›</button></div>`;

function home(){
  const r=calc(),cs=D.cats.filter(c=>c.t==='e'),L=2*Math.PI*75;let o=0;
  const sg=Object.entries(r.by).map(([id,v])=>{const l=v/r.exp*L,x=`<circle cx="100" cy="100" r="75" fill="none" stroke="${cat(id).col}" stroke-width="38" stroke-dasharray="${l} ${L-l}" stroke-dashoffset="${-o}" transform="rotate(-90 100 100)"/>`;o+=l;return x}).join('');
  const P=[[1,1],[1,2],[1,3],[1,4],[2,1],[2,4],[3,1],[3,4],[4,1],[4,4],[5,1],[5,2],[5,3],[5,4]];
  const it=cs.map((c,i)=>{const[rw,cl]=i<14?P[i]:[6+((i-14)/4|0),(i-14)%4+1];
    return `<button class="ci" data-a="cat" data-v="${c.id}" style="grid-area:${rw}/${cl}"><span class="ic" style="--c:${c.col}">${c.e}</span><span>${E(c.n)}</span><em>${r.by[c.id]?fm(r.by[c.id]):''}</em></button>`}).join('');
  return hdr(r)+`<div class="grid"><div class="dn"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="75" fill="none" stroke="var(--bd)" stroke-width="38"/>${sg}</svg><div class="mid"><span class="po">${fm(r.inc)}</span><span class="ne">${fm(r.exp)}</span><b>${fm(r.inc-r.exp)}</b></div></div>${it}</div><button class="sal" data-a="t" data-v="list">Saldo ${fm(r.car+r.inc-r.exp)}</button><div class="bar"><button class="e" data-a="add" data-v="e" aria-label="Nuova spesa">−</button><button class="i" data-a="add" data-v="i" aria-label="Nuova entrata">+</button></div>`;
}
function list(){
  const r=calc();
  const rows=r.T.slice().sort((a,b)=>b.d.localeCompare(a.d)).map(x=>{const c=cat(x.c)||{e:'❔',n:'?',t:'e',col:'#999'};
    return `<button class="row" data-a="edit" data-v="${x.id}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(c.n)}<small>${dfmt(x.d)}${x.n?' · '+E(x.n):''}</small></span><b class="${c.t==='i'?'po':'ne'}">${c.t==='i'?'+':'−'}${fm(x.a)}</b></button>`}).join('');
  return hdr(r)+`<p class="mu">Entrate ${fm(r.inc)} · Uscite ${fm(r.exp)} · Saldo ${fm(r.car+r.inc-r.exp)}</p>`+(rows||'<p class="mu">Nessun movimento in questo periodo.</p>');
}
function subs(){
  const mo=s=>s.a*(FR[s.f][2]==='d'?365/FR[s.f][1]/12:1/FR[s.f][1]),tot=D.subs.filter(s=>s.on).reduce((t,s)=>t+mo(s),0);
  const rows=D.subs.map(s=>{const c=cat(s.c)||{e:'❔',col:'#999'},nx=iso(occ(s,s.n)),fin=s.end&&nx>s.end;
    return `<button class="row" data-a="sub" data-v="${s.id}" style="${s.on?'':'opacity:.5'}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(s.nm)}<small>${FR[s.f][0]} · ${!s.on?'in pausa':fin?'terminato':'prossimo '+dfmt(nx)}</small></span><b>${fm(s.a)}</b></button>`}).join('');
  return `<h2>Abbonamenti</h2><p class="mu">Costo medio al mese: <b>${fm(tot)}</b></p>${rows||'<p class="mu">Nessun abbonamento.</p>'}<button class="btn" data-a="sub">Nuovo abbonamento</button>`;
}
function more(){
  const cr=t=>D.cats.filter(c=>c.t===t).map(c=>`<button class="row" data-a="cs" data-v="${c.id}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(c.n)}</span></button>`).join('');
  return `<h2>Mese contabile</h2><label>Il periodo inizia il giorno<select id="sd">${Array.from({length:28},(_,i)=>`<option ${D.st.day===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label class="ck"><input type="checkbox" id="dk" ${D.st.dark?'checked':''}> Tema scuro</label><label class="ck"><input type="checkbox" id="cr" ${D.st.carry?'checked':''}> Riporta il saldo dal periodo precedente</label><h2>Categorie di spesa</h2>${cr('e')}<button class="btn" data-a="cs" data-t="e">Nuova categoria di spesa</button><h2>Categorie di entrata</h2>${cr('i')}<button class="btn" data-a="cs" data-t="i">Nuova categoria di entrata</button><h2>Backup</h2><button class="btn" data-a="ex">Esporta backup (JSON)</button><button class="btn" data-a="csv">Esporta per Excel (CSV)</button><button class="btn" data-a="im">Importa backup</button><input type="file" id="im" accept=".json,application/json" hidden>`;
}
function render(){
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===tab));
  V.innerHTML=({home,list,subs,more})[tab]();
}

// Inserimento / modifica di una voce
function entry(o){
  const x=o.id?D.tx.find(y=>y.id===o.id):null;
  S=x?{id:x.id,t:cat(x.c).t,c:x.c,a:String(x.a),d:x.d,k:x.k,n:x.n||''}:{t:o.t,c:o.c||null,a:'',d:iso(new Date()),k:D.acc[0],n:''};
  if(!x&&S.c)S.t=cat(S.c).t;
  const cs=D.cats.filter(c=>c.t===S.t);
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${S.id?'Modifica':S.t==='e'?'Nuova spesa':'Nuova entrata'}</b><button data-a="ok">Salva</button></div><div class="amt"><span id="am">${S.a||'0'}</span> €</div><div class="chips">${cs.map(c=>`<button data-a="pc" data-v="${c.id}" class="${c.id===S.c?'on':''}">${c.e} ${E(c.n)}</button>`).join('')}</div><div class="f"><input type="date" id="dt" value="${S.d}"><select id="ac">${D.acc.map(a=>`<option ${a===S.k?'selected':''}>${a}</option>`).join('')}</select></div><input id="nt" placeholder="Aggiungi nota" value="${E(S.n)}"><div class="pad">${[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map(k=>`<button data-a="k" data-v="${k}">${k}</button>`).join('')}</div>${S.id?'<button class="del" data-a="rm">Elimina</button>':''}`;
  SH.hidden=false;
}
const sync=()=>{if($('#dt')){S.d=$('#dt').value||S.d;S.k=$('#ac').value;S.n=$('#nt').value}};
function key(k){
  if(k==='⌫')S.a=S.a.slice(0,-1);
  else if(k==='.'){if(!S.a.includes('.'))S.a=(S.a||'0')+'.'}
  else{const p=S.a.split('.')[1];if(p&&p.length>=2)return;S.a=S.a==='0'?k:S.a+k}
  $('#am').textContent=S.a||'0';
}
function okEntry(){
  sync();const a=Math.round(parseFloat(S.a)*100)/100;
  if(!(a>0)||!S.c){alert('Inserisci un importo e scegli una categoria');return}
  const v={d:S.d,a,c:S.c,k:S.k,n:S.n.trim()};
  if(S.id)Object.assign(D.tx.find(x=>x.id===S.id),v);else D.tx.push({id:uid(),...v});
  save();SH.hidden=true;render();
}

// Abbonamenti
function subSheet(id){
  const s=id?D.subs.find(y=>y.id===id):{nm:'',a:'',c:D.cats.find(c=>c.t==='e').id,ac:D.acc[0],f:'m1',st:iso(new Date()),end:'',on:true};
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${id?'Modifica abbonamento':'Nuovo abbonamento'}</b><button data-a="oks" data-v="${id||''}">Salva</button></div><label>Nome<input id="sn" value="${E(s.nm)}" placeholder="Es. Netflix"></label><label>Importo (€)<input id="sa" type="number" inputmode="decimal" step="0.01" value="${s.a}"></label><label>Categoria<select id="sc">${D.cats.filter(c=>c.t==='e').map(c=>`<option value="${c.id}" ${c.id===s.c?'selected':''}>${c.e} ${E(c.n)}</option>`).join('')}</select></label><label>Conto<select id="sk">${D.acc.map(a=>`<option ${a===s.ac?'selected':''}>${a}</option>`).join('')}</select></label><label>Frequenza<select id="sf">${Object.entries(FR).map(([k,v])=>`<option value="${k}" ${k===s.f?'selected':''}>${v[0]}</option>`).join('')}</select></label><label>Primo addebito<input id="ss" type="date" value="${s.st}"></label><label>Fine (facoltativa)<input id="se" type="date" value="${s.end}"></label><label class="ck"><input id="so" type="checkbox" ${s.on?'checked':''}> Attivo</label><p class="mu">Se il primo addebito è nel passato, l’app registra anche quelli già scaduti.</p>${id?`<button class="del" data-a="rms" data-v="${id}">Elimina abbonamento</button>`:''}`;
  SH.hidden=false;
}
function okSub(id){
  const g=x=>$('#'+x),a=parseFloat(g('sa').value),nm=g('sn').value.trim();
  if(!nm||!(a>0)||!g('ss').value){alert('Servono nome, importo e data del primo addebito');return}
  const o=id?D.subs.find(x=>x.id===id):null,s={id:id||uid(),nm,a,c:g('sc').value,ac:g('sk').value,f:g('sf').value,st:g('ss').value,end:g('se').value,on:g('so').checked,n:o?o.n:0};
  if(o&&o.st!==s.st)s.n=0;
  if(o&&!o.on&&s.on)while(iso(occ(s,s.n))<iso(new Date()))s.n++;
  o?Object.assign(o,s):D.subs.push(s);
  runSubs();save();SH.hidden=true;render();
}

// Categorie
function catSheet(id,t){
  const c=id?cat(id):{n:'',e:'⭐',col:'#4f93c8',t};
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${id?'Modifica categoria':'Nuova categoria'}</b><button data-a="okc" data-v="${id||''}" data-t="${c.t}">Salva</button></div><label>Nome<input id="cn" value="${E(c.n)}"></label><label>Icona (una emoji)<input id="ce" value="${c.e}"></label><label>Colore<input id="cc" type="color" value="${c.col}"></label>${id?`<button class="del" data-a="dc" data-v="${id}">Elimina categoria</button>`:''}`;
  SH.hidden=false;
}
function okCat(id,t){
  const n=$('#cn').value.trim();if(!n){alert('Serve un nome');return}
  const v={n,e:$('#ce').value.trim()||'⭐',col:$('#cc').value};
  if(id)Object.assign(cat(id),v);else D.cats.push({id:uid(),t,...v});
  save();SH.hidden=true;render();
}
function delCat(id){
  if(D.tx.some(x=>x.c===id)||D.subs.some(s=>s.c===id)){alert('Questa categoria ha movimenti o abbonamenti: non si può eliminare');return}
  if(confirm('Eliminare la categoria?')){D.cats=D.cats.filter(c=>c.id!==id);save();SH.hidden=true;render()}
}

// Backup
async function out(name,txt,type){
  const f=new File([txt],name,{type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;a.click();
}
function csv(){
  const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
  out('spese.csv',['Data;Tipo;Categoria;Importo;Conto;Nota',...D.tx.slice().sort((a,b)=>a.d.localeCompare(b.d)).map(x=>{const c=cat(x.c)||{n:'?',t:'e'};return[x.d,c.t==='i'?'Entrata':'Spesa',q(c.n),String(x.a).replace('.',','),q(x.k),q(x.n)].join(';')})].join('\n'),'text/csv');
}
function imp(f){
  if(!f)return;
  f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d.cats)||!Array.isArray(d.tx))throw 0;
    if(!confirm('Sostituire tutti i dati attuali con quelli del backup?'))return;
    D=d;D.subs=D.subs||[];D.st=D.st||{day:15,carry:true};D.acc=D.acc||['Contanti','Carta'];save();render()}catch(e){alert('File non valido')}});
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;const v=b.dataset.v;
  ({t(){tab=v;off=0;render()},o(){off=Math.min(0,off+ +v);render()},add(){entry({t:v})},cat(){entry({t:'e',c:v})},edit(){entry({id:v})},
  close(){SH.hidden=true},pc(){sync();S.c=v;SH.querySelectorAll('.chips button').forEach(x=>x.classList.toggle('on',x.dataset.v===v))},
  k(){key(v)},ok(){okEntry()},rm(){if(confirm('Eliminare questa voce?')){D.tx=D.tx.filter(x=>x.id!==S.id);save();SH.hidden=true;render()}},
  sub(){subSheet(v||null)},oks(){okSub(v||null)},rms(){if(confirm('Eliminare l’abbonamento? Le voci già registrate restano.')){D.subs=D.subs.filter(s=>s.id!==v);save();SH.hidden=true;render()}},
  cs(){catSheet(v||null,b.dataset.t)},okc(){okCat(v||null,b.dataset.t)},dc(){delCat(v)},
  ex(){out('spese-backup-'+iso(new Date())+'.json',JSON.stringify(D),'application/json')},csv(){csv()},im(){$('#im').click()}}[b.dataset.a]||(()=>{}))();
});
document.addEventListener('change',e=>{
  const i=e.target;
  if(i.id==='sd'){D.st.day=+i.value;save();off=0;render()}
  if(i.id==='dk'){D.st.dark=i.checked;save();theme()}
  if(i.id==='cr'){D.st.carry=i.checked;save()}
  if(i.id==='im')imp(i.files[0]);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&SH.hidden){runSubs();render()}});
theme();runSubs();render();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
