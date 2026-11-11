const $=s=>document.querySelector(s),V=$('#v'),SH=$('#sh'),K='spese-dati';
const FR={w1:['Ogni settimana',7,'d'],w2:['Ogni 2 settimane',14,'d'],w4:['Ogni 4 settimane',28,'d'],m1:['Ogni mese',1,'m'],m2:['Ogni 2 mesi',2,'m'],m3:['Ogni 3 mesi',3,'m'],m6:['Ogni 6 mesi',6,'m'],y1:['Ogni anno',12,'m']};
const C0=[['e','Spesa','🛒','#d6568c'],['e','Casa','🏠','#4f93c8'],['e','Auto','🚗','#6b7a99'],['e','Ristoranti','🍴','#3aa88a'],['e','Svago','🍸','#e8a33d'],['e','Regali','🎁','#b58a9a'],['e','Salute','🌡️','#d9534f'],['e','Vestiti','👕','#9b59b6'],['e','Telefono','📞','#8e7cc3'],['e','Sport','⚽','#2aa5a5'],['e','Animali','🐱','#5aa469'],['e','Igiene','🧴','#5a7fa8'],['e','Trasporti','🚆','#e57373'],['e','Bollette','🧾','#8d6e63'],['i','Stipendio','💶','#2f7d63'],['i','Risparmi','🐷','#e6a1b0'],['i','Altre entrate','💰','#7fb069']];
const uid=()=>Math.random().toString(36).slice(2,9);
const def=()=>({v:4,cats:C0.map(([t,n,e,col])=>({id:uid(),t,n,e,col})),tx:[],subs:[],accs:[{id:uid(),n:'Carta',ty:'s',o:0},{id:uid(),n:'Contanti',ty:'s',o:0}],st:{day:15,carry:true}});
let D,S,tab='home',off=0;
try{D=JSON.parse(localStorage.getItem(K))}catch(e){}
D=D||def();
function mig(){
  if((D.v||1)<3){const st=D.st;D=(D.tx.length||D.subs.length)?Object.assign(D,{v:3}):Object.assign(def(),{st})}
  if(!D.accs){const m={};D.accs=(D.acc||['Carta','Contanti']).map(n=>{const a={id:uid(),n,ty:'s',o:0};m[n]=a.id;return a});
    D.tx.forEach(x=>{if(!x.t)x.k=m[x.k]||D.accs[0].id});D.subs.forEach(y=>{y.ac=m[y.ac]||D.accs[0].id;y.k=y.k||'e'});delete D.acc;D.v=4}
}
mig();
const theme=()=>{document.documentElement.dataset.t=D.st.dark?'dark':'light'};
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D))}catch(e){}};
const cat=id=>D.cats.find(c=>c.id===id);
const acc=id=>D.accs.find(a=>a.id===id),accn=id=>(acc(id)||{n:'Esterno'}).n;
const bal=(id,u)=>{let b=(acc(id)||{}).o||0;D.tx.forEach(x=>{if(u&&x.d>u)return;if(x.t==='x'){if(x.to===id)b+=x.a;if(x.f===id)b-=x.a}else if(x.k===id){const c=cat(x.c);if(c)b+=c.t==='i'?x.a:-x.a}});return b};
const fl=x=>{if(x.t==='x')return x.c&&cat(x.c)?-x.a:0;const c=cat(x.c);if(!c)return 0;return c.t==='i'?x.a:(acc(x.k)||{}).ty==='r'?0:-x.a};
const first=()=>D.tx.reduce((m,x)=>x.d<m?x.d:m,'9999');
const op=(l,v,bl)=>(bl?`<option value="">${bl}</option>`:'')+l.map(([k,n])=>`<option value="${k}" ${k===v?'selected':''}>${E(n)}</option>`).join('');
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
  T.forEach(x=>{const v=fl(x);if(v>0)inc+=v;else if(v<0){exp-=v;by[x.c]=(by[x.c]||0)-v}});
  if(D.st.carry)D.tx.forEach(x=>{if(x.d<s)car+=fl(x)});
  return{s,e,T,inc,exp,by,car};
}
// Ricorrenze: registrate in ordine di data (la ricarica calcola il saldo di quel giorno)
function gen(s,d){
  const k=s.k||'e';
  if(k==='r'){const a=Math.round((s.tg-bal(s.to,d))*100)/100;if(a>0)D.tx.push({id:uid(),t:'x',d,a,f:s.fr||null,to:s.to,c:'',n:s.nm,s:s.id});return}
  if(k==='x'){D.tx.push({id:uid(),t:'x',d,a:s.a,f:s.ac,to:s.to,c:s.c||'',n:s.nm,s:s.id});return}
  D.tx.push({id:uid(),d,a:s.a,c:s.c,k:s.ac,n:s.nm,s:s.id});
}
function runSubs(){
  const t=iso(new Date());let ch=0;
  for(let g=0;g<3000;g++){
    let b=null,bd='';
    D.subs.forEach(s=>{if(!s.on)return;s.n=s.n||0;const d=iso(occ(s,s.n));if(d>t||(s.end&&d>s.end))return;
      if(!b||d<bd||(d===bd&&s.k==='r'&&b.k!=='r')){b=s;bd=d}});
    if(!b)break;
    if(!D.tx.some(x=>x.s===b.id&&x.d===bd))gen(b,bd);
    b.n++;ch=1;
  }
  if(ch)save();
}
const hdr=r=>`<div class="per"><button data-a="o" data-v="-1" ${r.s<=first()?'disabled':''} aria-label="Periodo precedente">‹</button><b>${dfmt(r.s)} – ${dfmt(r.e)}</b><button data-a="o" data-v="1" ${off>=0?'disabled':''} aria-label="Periodo successivo">›</button></div>`;

function home(){
  const r=calc(),cs=D.cats.filter(c=>c.t==='e'),L=2*Math.PI*75;let o=0;
  const sg=Object.entries(r.by).map(([id,v])=>{const l=v/r.exp*L,x=`<circle cx="100" cy="100" r="75" fill="none" stroke="${cat(id).col}" stroke-width="38" stroke-dasharray="${l} ${L-l}" stroke-dashoffset="${-o}" transform="rotate(-90 100 100)"/>`;o+=l;return x}).join('');
  const P=[[1,1],[1,2],[1,3],[1,4],[2,1],[2,4],[3,1],[3,4],[4,1],[4,4]];
  const it=cs.map((c,i)=>{const[rw,cl]=i<10?P[i]:[5+((i-10)/4|0),(i-10)%4+1];
    return `<button class="ci" data-a="cat" data-v="${c.id}" style="grid-area:${rw}/${cl}"><span class="ic" style="--c:${c.col}">${c.e}</span><span>${E(c.n)}</span><em>${r.by[c.id]?fm(r.by[c.id]):''}</em></button>`}).join('');
  return hdr(r)+`<div class="grid" style="grid-template-rows:repeat(${4+Math.max(1,Math.ceil(Math.max(0,cs.length-10)/4))},minmax(0,1fr))"><div class="dn"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="75" fill="none" stroke="var(--bd)" stroke-width="38"/>${sg}</svg><div class="mid"><span class="po">${fm(r.inc)}</span><span class="ne">${fm(r.exp)}</span><b>${fm(r.inc-r.exp)}</b></div></div>${it}</div><button class="sal" data-a="t" data-v="list">Saldo ${fm(r.car+r.inc-r.exp)}</button><div class="bar"><button class="e" data-a="add" data-v="e" aria-label="Nuova spesa">−</button><button class="i" data-a="add" data-v="i" aria-label="Nuova entrata">+</button></div>`;
}
function list(){
  const r=calc();
  const rows=r.T.slice().sort((a,b)=>b.d.localeCompare(a.d)).map(x=>{
    if(x.t==='x'){const c=x.c&&cat(x.c);return `<button class="row" data-a="xf" data-v="${x.id}"><span class="ic" style="--c:${c?c.col:'#999'}">⇄</span><span class="g">${E(accn(x.f))} → ${E(accn(x.to))}<small>${dfmt(x.d)}${c?' · conta come '+E(c.n):''}${x.n?' · '+E(x.n):''}</small></span><b class="${c?'ne':''}">${fm(x.a)}</b></button>`}
    const c=cat(x.c)||{e:'❔',n:'?',t:'e',col:'#999'};
    return `<button class="row" data-a="edit" data-v="${x.id}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(c.n)}<small>${dfmt(x.d)} · ${E(accn(x.k))}${x.n?' · '+E(x.n):''}</small></span><b class="${c.t==='i'?'po':'ne'}">${c.t==='i'?'+':'−'}${fm(x.a)}</b></button>`}).join('');
  return hdr(r)+`<p class="mu">Entrate ${fm(r.inc)} · Uscite ${fm(r.exp)} · Saldo ${fm(r.car+r.inc-r.exp)}</p>`+(rows||'<p class="mu">Nessun movimento in questo periodo.</p>');
}
function conti(){
  const row=a=>`<button class="row" data-a="ac" data-v="${a.id}"><span class="g">${E(a.n)}<small>${a.ty==='r'?'salvadanaio':'da spendere'}</small></span><b>${fm(bal(a.id))}</b></button>`;
  const sp=D.accs.filter(a=>a.ty!=='r'),sv=D.accs.filter(a=>a.ty==='r'),sum=l=>l.reduce((t,a)=>t+bal(a.id),0);
  return `<h2>Patrimonio</h2><p style="font-size:1.8rem;font-weight:700;margin:0">${fm(sum(D.accs))}</p><h2>Da spendere · ${fm(sum(sp))}</h2>${sp.map(row).join('')}<h2>Salvadanai · ${fm(sum(sv))}</h2>${sv.map(row).join('')||'<p class="mu">Nessun salvadanaio.</p>'}<button class="btn" data-a="ac">Nuovo conto</button><button class="btn" data-a="xf">Nuovo giroconto</button>`;
}
function subs(){
  const mo=s=>s.a*(FR[s.f][2]==='d'?365/FR[s.f][1]/12:1/FR[s.f][1]),tot=D.subs.filter(s=>s.on&&(s.k||'e')!=='r'&&((s.k||'e')==='e'||s.c)).reduce((t,s)=>t+mo(s),0);
  const rows=D.subs.map(s=>{const k=s.k||'e',c=cat(s.c)||{e:k==='r'?'🔄':'⇄',col:'#999'},nx=iso(occ(s,s.n)),fin=s.end&&nx>s.end,ex=k==='x'?accn(s.ac)+' → '+accn(s.to)+' · ':k==='r'?'su '+accn(s.to)+' · ':'';
    return `<button class="row" data-a="sub" data-v="${s.id}" style="${s.on?'':'opacity:.5'}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(s.nm)}<small>${FR[s.f][0]} · ${E(ex)}${!s.on?'in pausa':fin?'terminato':'prossimo '+dfmt(nx)}</small></span><b>${k==='r'?'fino a '+fm(s.tg):fm(s.a)}</b></button>`}).join('');
  return `<h2>Abbonamenti e ricorrenze</h2><p class="mu">Costo medio al mese (spese fisse e risparmi): <b>${fm(tot)}</b></p>${rows||'<p class="mu">Nessuna ricorrenza.</p>'}<button class="btn" data-a="sub">Nuova ricorrenza</button>`;
}
function more(){
  const cr=t=>D.cats.filter(c=>c.t===t).map(c=>`<button class="row" data-a="cs" data-v="${c.id}"><span class="ic" style="--c:${c.col}">${c.e}</span><span class="g">${E(c.n)}</span></button>`).join('');
  return `<h2>Mese contabile</h2><label>Il periodo inizia il giorno<select id="sd">${Array.from({length:28},(_,i)=>`<option ${D.st.day===i+1?'selected':''}>${i+1}</option>`).join('')}</select></label><label class="ck"><input type="checkbox" id="dk" ${D.st.dark?'checked':''}> Tema scuro</label><label class="ck"><input type="checkbox" id="cr" ${D.st.carry?'checked':''}> Riporta il saldo dal periodo precedente</label><h2>Categorie di spesa</h2>${cr('e')}<button class="btn" data-a="cs" data-t="e">Nuova categoria di spesa</button><h2>Categorie di entrata</h2>${cr('i')}<button class="btn" data-a="cs" data-t="i">Nuova categoria di entrata</button>${D.seeded?'':'<h2>Setup iniziale</h2><p class="mu">Crea Satispay, i due salvadanai (viaggi 400 €, assicurazione auto 250 €), due categorie e le ricorrenze: 20 € a settimana, 50 € al mese e ricarica del 15 fino a 300 €.</p><button class="btn" data-a="seed">Applica il mio setup Satispay</button>'}<h2>Backup</h2><button class="btn" data-a="ex">Esporta backup (JSON)</button><button class="btn" data-a="csv">Esporta per Excel (CSV)</button><button class="btn" data-a="im">Importa backup</button><input type="file" id="im" accept=".json,application/json" hidden>`;
}
function render(){
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===tab));
  V.innerHTML=({home,list,conti,subs,more})[tab]();
}

// Inserimento / modifica di una voce
function entry(o){
  const x=o.id?D.tx.find(y=>y.id===o.id):null;
  S=x?{id:x.id,t:cat(x.c).t,c:x.c,a:String(x.a),d:x.d,k:x.k,n:x.n||''}:{t:o.t,c:o.c||null,a:'',d:iso(new Date()),k:D.accs[0].id,n:''};
  if(!x&&S.c)S.t=cat(S.c).t;
  SH.className='en';drawEntry();
}
function drawEntry(){
  const c=S.c&&cat(S.c),pk=S.pick||!c;
  const body=pk?`<div class="pick">${D.cats.filter(y=>y.t===S.t).map(y=>`<button data-a="pc" data-v="${y.id}"><span class="ic" style="--c:${y.col}">${y.e}</span>${E(y.n)}</button>`).join('')}</div>`
  :`<button class="sel" data-a="chg"><span class="ic" style="--c:${c.col}">${c.e}</span><b>${E(c.n)}</b><small>cambia</small></button><div class="f"><input type="date" id="dt" value="${S.d}"><select id="ac">${op(D.accs.map(a=>[a.id,a.n]),S.k)}</select></div><input id="nt" placeholder="Aggiungi nota" value="${E(S.n)}"><div class="pad">${[1,2,3,4,5,6,7,8,9,'.',0,'⌫'].map(k=>`<button data-a="k" data-v="${k}">${k}</button>`).join('')}</div>${S.id?'<button class="del" data-a="rm">Elimina</button>':''}`;
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${S.id?'Modifica':S.t==='e'?'Nuova spesa':'Nuova entrata'}</b><button data-a="ok">Salva</button></div><div class="amt"><span id="am">${S.a||'0'}</span> €</div>`+body;
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
let SD;
function subSheet(id){
  const o=id?D.subs.find(y=>y.id===id):null;
  SD=o?{...o,k:o.k||'e'}:{id:null,k:'e',nm:'',a:'',tg:'',c:D.cats.find(c=>c.t==='e').id,ac:D.accs[0].id,to:(D.accs[1]||D.accs[0]).id,fr:'',f:'m1',st:iso(new Date()),end:'',on:true,n:0};
  drawSub();
}
function syncSub(){
  const g=x=>$('#'+x);if(!g('sn'))return;
  [['nm','sn'],['a','sa'],['c','sc'],['ac','sk'],['to','st2'],['fr','sfr'],['tg','stg'],['f','sf'],['st','ss'],['end','se']].forEach(([k,i])=>{if(g(i))SD[k]=g(i).value});
  SD.on=g('so').checked;
}
function drawSub(){
  const s=SD,K=s.k,ac=D.accs.map(a=>[a.id,a.n]),ec=D.cats.filter(c=>c.t==='e').map(c=>[c.id,c.e+' '+c.n]);
  const am=`<label>Importo (€)<input id="sa" type="number" inputmode="decimal" step="0.01" value="${s.a}"></label>`;
  const fld=K==='e'?`${am}<label>Categoria<select id="sc">${op(ec,s.c)}</select></label><label>Conto<select id="sk">${op(ac,s.ac)}</select></label>`
  :K==='x'?`${am}<label>Da<select id="sk">${op(ac,s.ac)}</select></label><label>A<select id="st2">${op(ac,s.to)}</select></label><label>Conta come spesa in<select id="sc">${op(ec,s.c,'Non conta come spesa')}</select></label>`
  :`<label>Ricarica fino a (€)<input id="stg" type="number" inputmode="decimal" step="0.01" value="${s.tg}"></label><label>Da<select id="sfr">${op(ac,s.fr,'Esterno (non tracciato)')}</select></label><label>Su<select id="st2">${op(ac,s.to)}</select></label>`;
  SH.className='';
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${s.id?'Modifica ricorrenza':'Nuova ricorrenza'}</b><button data-a="oks" data-v="${s.id||''}">Salva</button></div><label>Tipo<select id="skd">${op([['e','Spesa fissa (abbonamento)'],['x','Giroconto ricorrente'],['r','Ricarica automatica fino a un obiettivo']],K)}</select></label><label>Nome<input id="sn" value="${E(s.nm)}" placeholder="Es. Netflix"></label>${fld}<label>Frequenza<select id="sf">${op(Object.entries(FR).map(([k,v])=>[k,v[0]]),s.f)}</select></label><label>Primo addebito<input id="ss" type="date" value="${s.st}"></label><label>Fine (facoltativa)<input id="se" type="date" value="${s.end}"></label><label class="ck"><input id="so" type="checkbox" ${s.on?'checked':''}> Attivo</label><p class="mu">Se il primo addebito è nel passato, l’app registra anche quelli già scaduti.</p>${s.id?`<button class="del" data-a="rms" data-v="${s.id}">Elimina ricorrenza</button>`:''}`;
  SH.hidden=false;
}
function okSub(id){
  syncSub();const s=SD,a=parseFloat(s.a),tg=parseFloat(s.tg),nm=(s.nm||'').trim();
  if(!nm||!s.st||(s.k==='r'?!(tg>0)||!s.to:!(a>0))||(s.k==='x'&&s.ac===s.to)){alert('Controlla nome, importi, conti e data del primo addebito');return}
  const o=id?D.subs.find(x=>x.id===id):null,v={id:id||uid(),k:s.k,nm,a:a||0,tg:tg||0,c:s.c,ac:s.ac,to:s.to,fr:s.fr,f:s.f,st:s.st,end:s.end,on:s.on,n:o?o.n:0};
  if(o&&o.st!==v.st)v.n=0;
  if(o&&!o.on&&v.on)while(iso(occ(v,v.n))<iso(new Date()))v.n++;
  o?Object.assign(o,v):D.subs.push(v);
  runSubs();save();SH.hidden=true;render();
}
function accSheet(id){
  const a=id?acc(id):{n:'',ty:'s',o:0};SH.className='';
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${id?'Modifica conto':'Nuovo conto'}</b><button data-a="okac" data-v="${id||''}">Salva</button></div><label>Nome<input id="an" value="${E(a.n)}"></label><label>Tipo<select id="at">${op([['s','Da spendere (carta, Satispay…)'],['r','Salvadanaio (risparmio)']],a.ty)}</select></label><label>Saldo iniziale (€)<input id="ao" inputmode="text" value="${a.o||0}"></label><p class="mu">Le spese pagate da un salvadanaio non vengono contate di nuovo nella ruota: le hai già contate quando hai messo da parte i soldi.</p>${id?`<button class="del" data-a="dac" data-v="${id}">Elimina conto</button>`:''}`;
  SH.hidden=false;
}
function okAcc(id){
  const n=$('#an').value.trim();if(!n){alert('Serve un nome');return}
  const v={n,ty:$('#at').value,o:parseFloat($('#ao').value.replace(',','.'))||0};
  if(id)Object.assign(acc(id),v);else D.accs.push({id:uid(),...v});
  save();SH.hidden=true;render();
}
function delAcc(id){
  if(D.tx.some(x=>x.k===id||x.f===id||x.to===id)||D.subs.some(x=>x.ac===id||x.to===id||x.fr===id)){alert('Il conto ha movimenti o ricorrenze: non si può eliminare');return}
  if(confirm('Eliminare il conto?')){D.accs=D.accs.filter(a=>a.id!==id);save();SH.hidden=true;render()}
}
function xferSheet(id){
  const x=id?D.tx.find(y=>y.id===id):{f:D.accs[0].id,to:(D.accs[1]||D.accs[0]).id,a:'',d:iso(new Date()),c:'',n:''};SH.className='';
  const ac=D.accs.map(a=>[a.id,a.n]),cs=D.cats.filter(c=>c.t==='e').map(c=>[c.id,c.e+' '+c.n]);
  SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${id?'Modifica giroconto':'Nuovo giroconto'}</b><button data-a="okx" data-v="${id||''}">Salva</button></div><label>Da<select id="xf">${op(ac,x.f)}</select></label><label>A<select id="xt">${op(ac,x.to)}</select></label><label>Importo (€)<input id="xa" type="number" inputmode="decimal" step="0.01" value="${x.a}"></label><label>Data<input id="xd" type="date" value="${x.d}"></label><label>Conta come spesa in<select id="xc">${op(cs,x.c,'Non conta come spesa')}</select></label><label>Nota<input id="xn" value="${E(x.n||'')}"></label>${id?`<button class="del" data-a="delx" data-v="${id}">Elimina giroconto</button>`:''}`;
  SH.hidden=false;
}
function okX(id){
  const a=Math.round(parseFloat($('#xa').value)*100)/100,f=$('#xf').value,t=$('#xt').value;
  if(!(a>0)||f===t){alert('Servono un importo e due conti diversi');return}
  const v={t:'x',d:$('#xd').value,a,f,to:t,c:$('#xc').value,n:$('#xn').value.trim()};
  if(id)Object.assign(D.tx.find(x=>x.id===id),v);else D.tx.push({id:uid(),...v});
  save();SH.hidden=true;render();
}
function seed(){
  if(!confirm('Creare Satispay, salvadanai, categorie e ricorrenze?'))return;
  const A=(n,ty,o)=>{let a=D.accs.find(x=>x.n===n);if(!a){a={id:uid(),n,ty,o};D.accs.push(a)}return a.id};
  const C=(n,e,col)=>{let c=D.cats.find(x=>x.n===n&&x.t==='e');if(!c){c={id:uid(),t:'e',n,e,col};D.cats.push(c)}return c.id};
  const sat=A('Satispay','s',0),carta=D.accs[0].id,vi=A('Salvadanaio viaggi','r',400),au=A('Salvadanaio assicurazione auto','r',250),cv=C('Viaggi','✈️','#3a86c8'),ca=C('Assicurazione auto','🛡️','#8d6e63');
  const t=new Date(),mo=new Date(t);mo.setDate(t.getDate()+((8-t.getDay())%7||7));
  const q=new Date(t.getFullYear(),t.getDate()<=15?t.getMonth():t.getMonth()+1,15),b={end:'',on:true,n:0};
  D.subs.push({...b,id:uid(),k:'x',nm:'Salvadanaio viaggi',a:20,c:cv,ac:sat,to:vi,f:'w1',st:iso(mo)},{...b,id:uid(),k:'x',nm:'Salvadanaio assicurazione',a:50,c:ca,ac:sat,to:au,f:'m1',st:iso(q)},{...b,id:uid(),k:'r',nm:'Ricarica Satispay',tg:300,fr:carta,to:sat,f:'m1',st:iso(q)});
  D.seeded=1;save();render();
}
// Categorie
function catSheet(id,t){
  const c=id?cat(id):{n:'',e:'⭐',col:'#4f93c8',t};
  SH.className='';SH.innerHTML=`<div class="top"><button data-a="close">Annulla</button><b>${id?'Modifica categoria':'Nuova categoria'}</b><button data-a="okc" data-v="${id||''}" data-t="${c.t}">Salva</button></div><label>Nome<input id="cn" value="${E(c.n)}"></label><label>Icona (una emoji)<input id="ce" value="${c.e}"></label><label>Colore<input id="cc" type="color" value="${c.col}"></label>${id?`<button class="del" data-a="dc" data-v="${id}">Elimina categoria</button>`:''}`;
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
  out('spese.csv',['Data;Tipo;Categoria;Importo;Conto;Nota',...D.tx.slice().sort((a,b)=>a.d.localeCompare(b.d)).map(x=>{const c=cat(x.c)||{n:'',t:'e'};return[x.d,x.t==='x'?'Giroconto':c.t==='i'?'Entrata':'Spesa',q(c.n),String(x.a).replace('.',','),q(accn(x.k||x.f)),q(x.n)].join(';')})].join('\n'),'text/csv');
}
function imp(f){
  if(!f)return;
  f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d.cats)||!Array.isArray(d.tx))throw 0;
    if(!confirm('Sostituire tutti i dati attuali con quelli del backup?'))return;
    D=d;D.subs=D.subs||[];D.st=D.st||{day:15,carry:true};mig();save();render()}catch(e){alert('File non valido')}});
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;const v=b.dataset.v;
  ({t(){tab=v;off=0;render()},o(){off=Math.min(0,off+ +v);render()},add(){entry({t:v})},cat(){entry({t:'e',c:v})},edit(){entry({id:v})},
  close(){SH.hidden=true},pc(){sync();S.c=v;S.pick=false;drawEntry()},chg(){sync();S.pick=true;drawEntry()},
  k(){key(v)},ok(){okEntry()},rm(){if(confirm('Eliminare questa voce?')){D.tx=D.tx.filter(x=>x.id!==S.id);save();SH.hidden=true;render()}},
  sub(){subSheet(v||null)},oks(){okSub(v||null)},rms(){if(confirm('Eliminare l’abbonamento? Le voci già registrate restano.')){D.subs=D.subs.filter(s=>s.id!==v);save();SH.hidden=true;render()}},
  cs(){catSheet(v||null,b.dataset.t)},okc(){okCat(v||null,b.dataset.t)},dc(){delCat(v)},
  ac(){accSheet(v||null)},okac(){okAcc(v||null)},dac(){delAcc(v)},xf(){xferSheet(v||null)},okx(){okX(v||null)},delx(){if(confirm('Eliminare il giroconto?')){D.tx=D.tx.filter(x=>x.id!==v);save();SH.hidden=true;render()}},seed(){seed()},ex(){out('spese-backup-'+iso(new Date())+'.json',JSON.stringify(D),'application/json')},csv(){csv()},im(){$('#im').click()}}[b.dataset.a]||(()=>{}))();
});
document.addEventListener('change',e=>{
  const i=e.target;
  if(i.id==='sd'){D.st.day=+i.value;save();off=0;render()}
  if(i.id==='skd'){syncSub();SD.k=i.value;drawSub()}
  if(i.id==='dk'){D.st.dark=i.checked;save();theme()}
  if(i.id==='cr'){D.st.carry=i.checked;save()}
  if(i.id==='im')imp(i.files[0]);
});
let tp=null;
V.addEventListener('touchstart',e=>{tp=[e.touches[0].clientX,e.touches[0].clientY]},{passive:true});
V.addEventListener('touchend',e=>{
  if(!tp||(tab!=='home'&&tab!=='list'))return;
  const dx=e.changedTouches[0].clientX-tp[0],dy=e.changedTouches[0].clientY-tp[1];tp=null;
  if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.5)return;
  const n=dx>0?-1:1;if(n<0&&calc().s<=first())return;
  off=Math.min(0,off+n);render();
},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&SH.hidden){runSubs();render()}});
theme();runSubs();render();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
