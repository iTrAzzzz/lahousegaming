/* ════ STORAGE ════ */
const LS={g:(k,d=null)=>{try{const v=localStorage.getItem('lhg_'+k);return v!==null?JSON.parse(v):d;}catch{return d;}},s:(k,v)=>{try{localStorage.setItem('lhg_'+k,JSON.stringify(v));}catch{}}};

/* ════ CURSOR — FIXED ════ */
(function(){
  const C=document.getElementById('cur'),R=document.getElementById('cur-ring');
  let mx=-200,my=-200,rx=-200,ry=-200,vis=false;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    if(!vis){vis=true;C.style.opacity='1';R.style.opacity='1';}
  });
  document.addEventListener('mouseleave',()=>{vis=false;C.style.opacity='0';R.style.opacity='0';});
  document.addEventListener('mousedown',()=>document.body.classList.add('cur-click'));
  document.addEventListener('mouseup',()=>document.body.classList.remove('cur-click'));
  function bindHover(){
    document.querySelectorAll('a,button,.pc,.cc,.apc,[onclick]').forEach(el=>{
      if(el._ch)return;el._ch=true;
      el.addEventListener('mouseenter',()=>document.body.classList.add('cur-hover'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('cur-hover'));
    });
  }
  function loop(){
    C.style.left=mx+'px';C.style.top=my+'px';
    rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
    R.style.left=rx+'px';R.style.top=ry+'px';
    requestAnimationFrame(loop);
  }
  C.style.opacity='0';R.style.opacity='0';
  loop();setInterval(bindHover,800);bindHover();
  // hide native cursor only when mouse enters window
  document.addEventListener('mouseenter',()=>document.body.style.cursor='none');
  document.addEventListener('mouseleave',()=>document.body.style.cursor='');
})();

/* ════ AUTH ════ */
let isAdm=false;
function getCreds(){return LS.g('creds',{u:'House',p:'houselhg'});}
function checkSession(){const s=LS.g('sess',null);if(s&&s.e>Date.now()){isAdm=true;showBadge();}}
function showBadge(){document.getElementById('adm-badge').classList.add('on');}
function hideBadge(){document.getElementById('adm-badge').classList.remove('on');}

/* Alt+S shortcut */
document.addEventListener('keydown',e=>{
  if(e.altKey&&e.key.toLowerCase()==='s'){
    e.preventDefault();
    if(isAdm)togglePanel();
    else{document.getElementById('adm-ov').classList.add('on');setTimeout(()=>document.getElementById('au').focus(),80);}
  }
  if(e.key==='Escape'){document.getElementById('adm-ov').classList.remove('on');closeM();}
});
function closeLogin(){document.getElementById('adm-ov').classList.remove('on');document.getElementById('adm-err').style.display='none';document.getElementById('au').value='';document.getElementById('apw').value='';}
document.getElementById('apw').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('au').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
function doLogin(){
  const u=document.getElementById('au').value.trim(),p=document.getElementById('apw').value;
  const c=getCreds();
  if(u===c.u&&p===c.p){isAdm=true;LS.s('sess',{e:Date.now()+7*24*3600*1e3});closeLogin();showBadge();openPanel();toast('Bienvenue dans le panel admin LHG 🔐','ok');}
  else{document.getElementById('adm-err').style.display='block';document.getElementById('apw').value='';}
}
function togglePanel(){document.getElementById('adm-panel').classList.toggle('on');if(document.getElementById('adm-panel').classList.contains('on')){renderCands();updStats();updDt();}}
function openPanel(){document.getElementById('adm-panel').classList.add('on');renderCands();updStats();updDt();setInterval(updDt,1000);}
function closePanel(){document.getElementById('adm-panel').classList.remove('on');}
function logoutAdmin(){isAdm=false;LS.s('sess',null);document.getElementById('adm-panel').classList.remove('on');hideBadge();toast('Déconnecté','in');}
function updDt(){const e=document.getElementById('ap-dt');if(e)e.textContent=new Date().toLocaleString('fr-FR');}

/* ════ TABS ════ */
function switchTab(id){
  document.querySelectorAll('.ap-tab').forEach((t,i)=>{t.classList.toggle('active',['overview','candidatures','content','design','reseaux','settings'][i]===id);});
  document.querySelectorAll('.ap-tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  if(id==='candidatures'){renderCands();updBadge();}
  if(id==='overview')updStats();
}

/* ════ STATS ════ */
function updStats(){
  const cands=getCands(),st=LS.g('stats',{v:0,c:0});
  const ok=cands.filter(x=>x.st==='ok').length,ko=cands.filter(x=>x.st==='ko').length,neu=cands.filter(x=>x.st==='new').length;
  const g=document.getElementById('stats-grid');
  if(!g)return;
  g.innerHTML=[
    ['📋 | Candidatures',cands.length,'var(--cy)'],
    ['✅ | Acceptées',ok,'#4ade80'],
    ['❌ | Refusées',ko,'#f87171'],
    ['🆕 | En attente',neu,'var(--go)'],
    ['👀 | Visites',st.v||0,'var(--vb)'],
    ['📨 | Envois total',st.c||0,'var(--cy)']
  ].map(([l,v,c])=>`<div class="stat-box"><div class="stat-n" style="color:${c}">${v}</div><div class="stat-l">${l}</div></div>`).join('');
}

/* ════ CANDIDATURES ════ */
let candFilter='all';
function getCands(){return LS.g('cands',[]);}
function saveCands(c){LS.s('cands',c);}
function updBadge(){const e=document.getElementById('c-badge');if(e){const c=getCands();e.textContent=c.length+' ('+c.filter(x=>x.st==='new').length+' nouvelles)';}}
function filterCands(f){candFilter=f;renderCands();}
function renderCands(){
  const wrap=document.getElementById('c-wrap');if(!wrap)return;
  let cands=getCands();
  if(candFilter!=='all')cands=cands.filter(x=>x.st===candFilter);
  updBadge();
  if(!cands.length){wrap.innerHTML='<div class="empty"><span>📭</span>'+(candFilter==='all'?'AUCUNE CANDIDATURE POUR L\'INSTANT':'AUCUNE CANDIDATURE DANS CETTE CATÉGORIE')+'</div>';return;}
  let h=`<table class="ctbl"><thead><tr><th>#</th><th>PSEUDO</th><th>DISCORD</th><th>ÂGE</th><th>RÔLE</th><th>K/D</th><th>DATE</th><th>STATUT</th><th>ACTIONS</th></tr></thead><tbody>`;
  cands.forEach((c,i)=>{
    const sc=c.st==='new'?'stn':c.st==='ok'?'sto':'stk';
    const sl=c.st==='new'?'NOUVEAU':c.st==='ok'?'ACCEPTÉ':'REFUSÉ';
    h+=`<tr><td style="color:var(--dm);font-family:'Share Tech Mono',monospace;font-size:10px">${getCands().length-i}</td>
    <td><strong>${c.p}</strong></td><td style="color:var(--cy)">${c.d}</td><td>${c.a||'—'}</td>
    <td style="color:var(--vb)">${c.r}</td><td style="font-family:'Orbitron',monospace;color:var(--go)">${c.k||'—'}</td>
    <td style="font-size:11px;color:var(--dm)">${c.date}</td>
    <td><span class="cst ${sc}">${sl}</span></td>
    <td><button class="tb a" onclick="setCS(${c.id},'ok')">✓</button><button class="tb rj" onclick="setCS(${c.id},'ko')">✗</button><button class="tb vw" onclick="viewC(${c.id})">👀</button><button class="tb dl" onclick="delC(${c.id})">🗑</button></td></tr>`;
  });
  wrap.innerHTML=h+'</tbody></table>';
}
function setCS(id,st){const c=getCands();const i=c.findIndex(x=>x.id===id);if(i>=0){c[i].st=st;saveCands(c);renderCands();toast(st==='ok'?'Acceptée ✓':'Refusée','in');}}
function delC(id){if(!confirm('Supprimer ?'))return;saveCands(getCands().filter(c=>c.id!==id));renderCands();toast('Supprimée','in');}
function viewC(id){
  const c=getCands().find(x=>x.id===id);if(!c)return;
  document.getElementById('apm-t').textContent='CANDIDATURE — '+c.p;
  document.getElementById('apm-b').innerHTML=`<div style="display:flex;flex-direction:column;gap:10px">
  ${[['Pseudo',c.p],['Discord',c.d],['Âge',c.a||'—'],['Rôle',c.r],['K/D',c.k||'—'],['H/Semaine',c.h||'—'],['Date',c.date]].map(([l,v])=>`<div><div style="font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--vb);margin-bottom:3px">${l}</div><div style="background:rgba(7,5,15,.8);padding:9px 12px;border:1px solid var(--br)">${v}</div></div>`).join('')}
  <div><div style="font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--vb);margin-bottom:3px">PRÉSENTATION</div><div style="background:rgba(7,5,15,.8);padding:9px 12px;border:1px solid var(--br);line-height:1.7">${c.b||'—'}</div></div>
  <div style="display:flex;gap:10px;margin-top:6px"><button class="tb a" style="padding:10px 18px;font-size:10px" onclick="setCS(${c.id},'ok');closeM()">✓ ACCEPTER</button><button class="tb rj" style="padding:10px 18px;font-size:10px" onclick="setCS(${c.id},'ko');closeM()">✗ REFUSER</button></div></div>`;
  document.getElementById('ap-mod').classList.add('on');
}
function exportCands(){
  const blob=new Blob([JSON.stringify(getCands(),null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lhg-candidatures-'+Date.now()+'.json';a.click();
  toast('Candidatures exportées 💾','ok');
}
function exportConfig(){
  const keys=['creds','desc','soc','annonce','accent1','accent2','stats','title','slogan','herostats','tiktok','countdown','twitter','stream','recrit'];
  const cfg={};keys.forEach(k=>cfg[k]=LS.g(k,null));
  const blob=new Blob([JSON.stringify(cfg,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lhg-config-'+Date.now()+'.json';a.click();
  toast('Configuration exportée 💾','ok');
}

function submitCand(){
  const p=document.getElementById('cf-p').value.trim(),d=document.getElementById('cf-d').value.trim(),r=document.getElementById('cf-r').value;
  if(!p||!d||!r){toast('Pseudo, Discord et Rôle requis','er');return;}
  const candidat = {id:Date.now(),p,d,a:document.getElementById('cf-a').value.trim(),r,k:document.getElementById('cf-k').value.trim(),h:document.getElementById('cf-h').value.trim(),b:document.getElementById('cf-b').value.trim(),date:new Date().toLocaleDateString('fr-FR'),st:'new'};
  const cands=getCands();
  cands.unshift(candidat);
  saveCands(cands);
  const st=LS.g('stats',{v:0,c:0});st.c=(st.c||0)+1;LS.s('stats',st);
  document.getElementById('cand-form').style.display='none';
  document.getElementById('cs').style.display='block';
  toast('Candidature envoyée ! 🎮','ok');
  sendDiscordWebhook(candidat);
}

function sendDiscordWebhook(c){
  const url='https://discord.com/api/webhooks/1484294872440508571/PnaEbs7z48mpg641iQGD1D1Rr8HMe69lpMV5dV2q1e2JingqeCRGjgFDl9hwDYkpo1MA';
  const payload={
    username:'LHG Candidature Bot',
    avatar_url:'https://cdn.discordapp.com/attachments/1475616287232360609/1484296460672434246/preview-removebg-preview.png?ex=69bdb64d&is=69bc64cd&hm=09b190b8c919f278a4bbbadcab12f780d462819124ec0752c81e7f3a03bccbc6',
    embeds:[{
      title:'Nouvelle candidature LHG',
      color:7506394,
      timestamp:new Date().toISOString(),
      footer:{text:'La House Gaming - Recrutement'},
      fields:[
        {name:'Pseudo',value:c.p||'—',inline:true},
        {name:'Discord',value:c.d||'—',inline:true},
        {name:'Rôle',value:c.r||'—',inline:true},
        {name:'Âge',value:c.a||'—',inline:true},
        {name:'K/D',value:c.k||'—',inline:true},
        {name:'Heures / semaine',value:c.h||'—',inline:true},
        {name:'Date',value:c.date||'—',inline:false},
        {name:'Présentation',value:c.b?c.b.substring(0,1024):'—',inline:false}
      ]
    }]
  };
  fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    .then(resp=>{if(!resp.ok){throw new Error('HTTP '+resp.status);}return resp.text();})
    .then(()=>toast('Webhook Discord envoyé avec succès ✅','ok'))
    .catch(err=>{console.error('Discord webhook error',err);toast('Erreur envoi Discord (CORS ou webhook)','er');});
}

/* ════ MODALS ════ */
function openM(t){
  const T=document.getElementById('apm-t'),B=document.getElementById('apm-b');
  document.getElementById('ap-mod').classList.add('on');
  if(t==='annonce'){
    T.textContent='BANDEAU ANNONCE';
    const cur=LS.g('annonce','');
    B.innerHTML=`<div class="mfg"><label class="mfl">Texte de l'annonce</label><input class="mfi" id="ann-in" value="${cur}" placeholder="ex: Tournoi ce samedi 20h — Discord !"></div>
    <div style="display:flex;gap:10px;margin-top:8px"><button class="msv" onclick="saveAnn()">PUBLIER →</button><button class="msv" style="background:rgba(248,113,113,.4);border:1px solid rgba(248,113,113,.4)" onclick="clearAnn()">SUPPRIMER</button></div>`;
  }else if(t==='desc'){
    T.textContent='TEXTE D\'ACCUEIL';
    B.innerHTML=`<div class="mfg"><label class="mfl">Description</label><textarea class="mfi mfi-ta" id="dt">${LS.g('desc','')||document.getElementById('hero-desc').textContent}</textarea></div><button class="msv" onclick="saveDesc()">SAUVEGARDER →</button>`;
  }else if(t==='roster'){
    T.textContent='AJOUTER UN JOUEUR';
    B.innerHTML=`<div class="mfg"><label class="mfl">Pseudo</label><input class="mfi" id="rp" placeholder="Pseudo Warzone"></div>
    <div class="mfg"><label class="mfl">Prénom Nom</label><input class="mfi" id="rr" placeholder="Prénom Nom"></div>
    <div class="mfg"><label class="mfl">Rôle</label><input class="mfi" id="rro" placeholder="ex: Fragger"></div>
    <div class="mfg"><label class="mfl">Initiales (2-3 lettres)</label><input class="mfi" id="ri" placeholder="FR" maxlength="3"></div>
    <div class="mfg"><label class="mfl">K/D</label><input class="mfi" id="rk" placeholder="ex: 2.45"></div>
    <div class="mfg"><label class="mfl">Drapeau emoji</label><input class="mfi" id="rf" placeholder="🇫🇷"></div>
    <button class="msv" onclick="addPlayer()">AJOUTER →</button>`;
  }else if(t==='palmares'){
    T.textContent='NOUVEAU RÉSULTAT';
    B.innerHTML=`<div class="mfg"><label class="mfl">Nom du tournoi</label><input class="mfi" id="pn" placeholder="ex: Open Warzone FR"></div>
    <div class="mfg"><label class="mfl">Placement</label><select class="mfi" id="pp"><option value="1ST">🥇 1ère place</option><option value="2ND">🥈 2ème place</option><option value="3RD">🥉 3ème place</option><option value="TOP 5">Top 5</option><option value="TOP 8">Top 8</option><option value="TOP 16">Top 16</option></select></div>
    <div class="mfg"><label class="mfl">Détails</label><input class="mfi" id="pm" placeholder="ex: MARS 2025 · WARZONE · SQUAD"></div>
    <div class="mfg"><label class="mfl">Badge</label><input class="mfi" id="pb" placeholder="ex: CHAMPION"></div>
    <button class="msv" onclick="addPalm()">AJOUTER →</button>`;
  }else if(t==='socials'){
    T.textContent='LIENS SOCIAUX';
    const s=LS.g('soc',{d:'discord.gg/lhg',i:'@lhg_esport',e:'contact@lhg-esport.fr'});
    B.innerHTML=`<div class="mfg"><label class="mfl">Discord</label><input class="mfi" id="sd" value="${s.d}"></div>
    <div class="mfg"><label class="mfl">Instagram</label><input class="mfi" id="si" value="${s.i}"></div>
    <div class="mfg"><label class="mfl">Email</label><input class="mfi" id="se" value="${s.e}"></div>
    <button class="msv" onclick="saveSoc()">SAUVEGARDER →</button>`;
  }else if(t==='color1'){
    T.textContent='COULEUR PRINCIPALE (CYAN)';
    const sw=[['#22d3ee','Cyan'],['#00ffea','Mint'],['#38bdf8','Sky'],['#60a5fa','Bleu'],['#4ade80','Vert'],['#a78bfa','Lavande'],['#f472b6','Rose'],['#fb923c','Orange']];
    B.innerHTML=`<div class="sw-grid">${sw.map(([c,n])=>`<div class="sw" onclick="applyC1('${c}')" style="border-color:${c}55;background:${c}12"><div class="sw-dot" style="background:${c};box-shadow:0 0 8px ${c}"></div><div class="sw-lbl" style="color:${c}">${n}</div></div>`).join('')}</div>
    <div class="mfg"><label class="mfl">Hex custom</label><input class="mfi" id="cc1" placeholder="#22d3ee"></div>
    <button class="msv" onclick="applyC1(document.getElementById('cc1').value)">APPLIQUER →</button>`;
  }else if(t==='color2'){
    T.textContent='COULEUR SECONDAIRE (VIOLET)';
    const sw=[['#a855f7','Violet'],['#7c3aff','Purple'],['#6366f1','Indigo'],['#ec4899','Pink'],['#f59e0b','Gold'],['#ef4444','Red'],['#10b981','Emerald'],['#f97316','Ambre']];
    B.innerHTML=`<div class="sw-grid">${sw.map(([c,n])=>`<div class="sw" onclick="applyC2('${c}')" style="border-color:${c}55;background:${c}12"><div class="sw-dot" style="background:${c};box-shadow:0 0 8px ${c}"></div><div class="sw-lbl" style="color:${c}">${n}</div></div>`).join('')}</div>
    <div class="mfg"><label class="mfl">Hex custom</label><input class="mfi" id="cc2" placeholder="#a855f7"></div>
    <button class="msv" onclick="applyC2(document.getElementById('cc2').value)">APPLIQUER →</button>`;
  }else if(t==='herostats'){
    T.textContent='STATISTIQUES HERO';
    const s=LS.g('herostats',{n1:'12+',l1:'Joueurs',n2:'2026',l2:'Fondation',n3:'TOP',l3:'France'});
    B.innerHTML=`<p style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--dm);margin-bottom:16px">3 stats affichées en bas du hero :</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="mfg"><label class="mfl">Stat 1 — Valeur</label><input class="mfi" id="hs1n" value="${s.n1}"></div>
      <div class="mfg"><label class="mfl">Stat 1 — Label</label><input class="mfi" id="hs1l" value="${s.l1}"></div>
      <div class="mfg"><label class="mfl">Stat 2 — Valeur</label><input class="mfi" id="hs2n" value="${s.n2}"></div>
      <div class="mfg"><label class="mfl">Stat 2 — Label</label><input class="mfi" id="hs2l" value="${s.l2}"></div>
      <div class="mfg"><label class="mfl">Stat 3 — Valeur</label><input class="mfi" id="hs3n" value="${s.n3}"></div>
      <div class="mfg"><label class="mfl">Stat 3 — Label</label><input class="mfi" id="hs3l" value="${s.l3}"></div>
    </div>
    <button class="msv" onclick="saveHeroStats()">SAUVEGARDER →</button>`;
  }else if(t==='tiktok'){
    T.textContent='BANNIÈRE TIKTOK';
    const tk=LS.g('tiktok',{url:'https://www.tiktok.com/@lahousegaming',name:'@lahousegaming',desc:'Clips · Highlights · Behind the scenes'});
    B.innerHTML=`<div class="mfg"><label class="mfl">URL TikTok</label><input class="mfi" id="tk-u" value="${tk.url}"></div>
    <div class="mfg"><label class="mfl">Nom affiché</label><input class="mfi" id="tk-n" value="${tk.name}"></div>
    <div class="mfg"><label class="mfl">Description</label><input class="mfi" id="tk-d" value="${tk.desc}"></div>
    <button class="msv" onclick="saveTikTok()">SAUVEGARDER →</button>`;
  }else if(t==='countdown'){
    T.textContent='COMPTE À REBOURS TOURNOI';
    const cd=LS.g('countdown',{active:false,date:'',label:'PROCHAIN TOURNOI'});
    B.innerHTML=`<div class="mfg"><label class="mfl">Date et heure du tournoi</label><input type="datetime-local" class="mfi" id="cd-dt" value="${cd.date}"></div>
    <div class="mfg"><label class="mfl">Label</label><input class="mfi" id="cd-lb" value="${cd.label}" placeholder="ex: PROCHAIN TOURNOI"></div>
    <div style="display:flex;gap:10px;margin-top:8px"><button class="msv" onclick="saveCountdown()">ACTIVER →</button><button class="msv" style="background:rgba(248,113,113,.3);border:1px solid rgba(248,113,113,.4)" onclick="disableCountdown()">DÉSACTIVER</button></div>`;
  }else if(t==='slogan'){
    T.textContent='SLOGAN HERO';
    B.innerHTML=`<div class="mfg"><label class="mfl">Texte du slogan (capslock auto)</label><input class="mfi" id="sl-t" value="${LS.g('slogan','')||document.getElementById('hero-slogan').textContent}"></div>
    <button class="msv" onclick="saveSlogan()">SAUVEGARDER →</button>`;
  }else if(t==='title'){
    T.textContent='TITRE DE L\'ONGLET';
    B.innerHTML=`<div class="mfg"><label class="mfl">Titre du navigateur</label><input class="mfi" id="tt-ti" value="${document.title}"></div>
    <button class="msv" onclick="saveTitle()">SAUVEGARDER →</button>`;
  }else if(t==='theme'){
    T.textContent='THÈME DE FOND';
    B.innerHTML=`<p style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--dm);margin-bottom:16px">Choisir un thème de fond :</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${[['#07050f','Noir Profond (défaut)','#0d0a1a'],['#050a14','Bleu Nuit','#091422'],['#0f0a05','Brun Sombre','#1a1005'],['#05050f','Violet Nuit','#0a0a1a']].map(([bg,n,bg2])=>`
      <div onclick="applyTheme('${bg}','${bg2}')" style="padding:12px 16px;border:1px solid var(--br);cursor:pointer;display:flex;align-items:center;gap:12px;transition:all .25s" onmouseover="this.style.borderColor='rgba(34,211,238,.4)'" onmouseout="this.style.borderColor='rgba(124,58,255,.2)'">
        <div style="width:32px;height:32px;background:${bg};border:1px solid rgba(255,255,255,.1);border-radius:4px"></div>
        <span style="font-family:'Rajdhani',sans-serif;font-size:15px">${n}</span>
      </div>`).join('')}
    </div>`;
  }else if(t==='particles'){
    T.textContent='PARTICULES ARRIÈRE-PLAN';
    const cur=LS.g('pcount',55);
    B.innerHTML=`<p style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--dm);margin-bottom:16px">Nombre de particules : <span id="pc-val" style="color:var(--cy)">${cur}</span></p>
    <input type="range" min="0" max="150" value="${cur}" oninput="document.getElementById('pc-val').textContent=this.value" id="pc-range" style="width:100%;margin-bottom:16px;accent-color:var(--cy)">
    <div style="display:flex;gap:10px">
      <button class="msv" onclick="saveParticles()">APPLIQUER →</button>
      <button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="applyParticles(0)">DÉSACTIVER</button>
    </div>`;
  }else if(t==='recrit'){
    T.textContent='CRITÈRES DE RECRUTEMENT';
    B.innerHTML=`<div class="mfg"><label class="mfl">Critère 1 — Titre</label><input class="mfi" id="rc1t" value="${document.getElementById('req1-t').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 1 — Description</label><input class="mfi" id="rc1d" value="${document.getElementById('req1-d').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 2 — Titre</label><input class="mfi" id="rc2t" value="${document.getElementById('req2-t').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 2 — Description</label><input class="mfi" id="rc2d" value="${document.getElementById('req2-d').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 3 — Titre</label><input class="mfi" id="rc3t" value="${document.getElementById('req3-t').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 3 — Description</label><input class="mfi" id="rc3d" value="${document.getElementById('req3-d').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 4 — Titre</label><input class="mfi" id="rc4t" value="${document.getElementById('req4-t').textContent}"></div>
    <div class="mfg"><label class="mfl">Critère 4 — Description</label><input class="mfi" id="rc4d" value="${document.getElementById('req4-d').textContent}"></div>
    <button class="msv" onclick="saveRecrit()">SAUVEGARDER →</button>`;
  }else if(t==='twitter'){
    T.textContent='TWITTER / X';
    B.innerHTML=`<div class="mfg"><label class="mfl">URL Twitter/X</label><input class="mfi" id="tw-u" value="${LS.g('twitter','')}" placeholder="https://x.com/lahousegaming"></div>
    <button class="msv" onclick="LS.s('twitter',document.getElementById('tw-u').value);document.getElementById('lk-tw').href=document.getElementById('tw-u').value;closeM();toast('Twitter mis à jour','ok')">SAUVEGARDER →</button>`;
  }else if(t==='stream'){
    T.textContent='TWITCH / YOUTUBE';
    const st=LS.g('stream',{yt:'',tw:''});
    B.innerHTML=`<div class="mfg"><label class="mfl">YouTube</label><input class="mfi" id="yt-u" value="${st.yt}" placeholder="https://youtube.com/@lahousegaming"></div>
    <div class="mfg"><label class="mfl">Twitch</label><input class="mfi" id="tw2-u" value="${st.tw}" placeholder="https://twitch.tv/lahousegaming"></div>
    <button class="msv" onclick="saveStream()">SAUVEGARDER →</button>`;
  }else if(t==='pass'){
    T.textContent='MODIFIER LES IDENTIFIANTS';
    B.innerHTML=`<div class="mfg"><label class="mfl">Nouveau nom d'utilisateur</label><input class="mfi" id="nu"></div>
    <div class="mfg"><label class="mfl">Nouveau mot de passe</label><input type="password" class="mfi" id="np"></div>
    <div class="mfg"><label class="mfl">Confirmer</label><input type="password" class="mfi" id="np2"></div>
    <button class="msv" onclick="savePass()">MODIFIER →</button>`;
  }else if(t==='import'){
    T.textContent='IMPORTER CONFIGURATION';
    B.innerHTML=`<p style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--dm);margin-bottom:16px">Sélectionne un fichier JSON exporté depuis ce panel.</p>
    <input type="file" accept=".json" id="imp-file" class="mfi" style="clip-path:none;padding:8px">
    <button class="msv" style="margin-top:12px" onclick="importConfig()">IMPORTER →</button>`;
  }else if(t==='reset'){
    T.textContent='⚠ RÉINITIALISATION';
    B.innerHTML=`<p style="color:#f87171;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:1px;line-height:1.8;margin-bottom:20px">ATTENTION : Toutes les données seront supprimées. Action irréversible.</p>
    <div style="display:flex;gap:12px"><button class="msv" style="background:rgba(248,113,113,.4);border:1px solid #f87171" onclick="doReset()">⚠ CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeM()">ANNULER</button></div>`;
  }else if(t==='delallcands'){
    T.textContent='SUPPRIMER TOUTES LES CANDIDATURES';
    B.innerHTML=`<p style="color:#f87171;font-family:'Share Tech Mono',monospace;font-size:11px;margin-bottom:20px">${getCands().length} candidature(s) seront supprimées définitivement.</p>
    <div style="display:flex;gap:12px"><button class="msv" style="background:rgba(248,113,113,.4);border:1px solid #f87171" onclick="saveCands([]);renderCands();updBadge();closeM();toast('Toutes les candidatures supprimées','in')">CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeM()">ANNULER</button></div>`;
  }
}
function closeM(){document.getElementById('ap-mod').classList.remove('on');}

/* ════ SAVE ACTIONS ════ */
function saveAnn(){
  const t=document.getElementById('ann-in').value.trim();
  LS.s('annonce',t);
  const bar=document.getElementById('ann'),txt=document.getElementById('ann-txt');
  if(t){txt.textContent=t;bar.style.display='block';}else bar.style.display='none';
  closeM();toast('Annonce publiée !','ok');
}
function clearAnn(){LS.s('annonce','');document.getElementById('ann').style.display='none';closeM();toast('Annonce supprimée','in');}
function closeAnn(){document.getElementById('ann').style.display='none';}
function saveDesc(){const t=document.getElementById('dt').value.trim();LS.s('desc',t);document.getElementById('hero-desc').textContent=t;closeM();toast('Description mise à jour !','ok');}
function saveSoc(){
  const s={d:document.getElementById('sd').value.trim(),i:document.getElementById('si').value.trim(),e:document.getElementById('se').value.trim()};
  LS.s('soc',s);document.getElementById('lk-d').textContent=s.d;document.getElementById('lk-i').textContent=s.i;document.getElementById('lk-e').textContent=s.e;
  closeM();toast('Liens mis à jour !','ok');
}
function applyC1(hex){if(!hex||!hex.match(/^#[0-9a-fA-F]{3,8}$/)){toast('Hex invalide','er');return;}document.documentElement.style.setProperty('--cy',hex);LS.s('accent1',hex);closeM();toast('Couleur principale : '+hex,'ok');}
function applyC2(hex){if(!hex||!hex.match(/^#[0-9a-fA-F]{3,8}$/)){toast('Hex invalide','er');return;}document.documentElement.style.setProperty('--vb',hex);LS.s('accent2',hex);closeM();toast('Couleur secondaire : '+hex,'ok');}
function applyTheme(bg,bg2){document.documentElement.style.setProperty('--bg',bg);document.documentElement.style.setProperty('--bg2',bg2);LS.s('theme',{bg,bg2});closeM();toast('Thème appliqué','ok');}
function saveHeroStats(){
  const s={n1:document.getElementById('hs1n').value,l1:document.getElementById('hs1l').value,n2:document.getElementById('hs2n').value,l2:document.getElementById('hs2l').value,n3:document.getElementById('hs3n').value,l3:document.getElementById('hs3l').value};
  LS.s('herostats',s);
  document.getElementById('hs1n').textContent=s.n1;document.getElementById('hs1l').textContent=s.l1;
  document.getElementById('hs2n').textContent=s.n2;document.getElementById('hs2l').textContent=s.l2;
  document.getElementById('hs3n').textContent=s.n3;document.getElementById('hs3l').textContent=s.l3;
  closeM();toast('Stats mises à jour !','ok');
}
function saveTikTok(){
  const tk={url:document.getElementById('tk-u').value.trim(),name:document.getElementById('tk-n').value.trim(),desc:document.getElementById('tk-d').value.trim()};
  LS.s('tiktok',tk);
  document.getElementById('tt-link').href=tk.url;document.getElementById('tt-name').textContent=tk.name;document.getElementById('tt-desc').textContent=tk.desc;
  closeM();toast('TikTok mis à jour !','ok');
}
function saveCountdown(){
  const dt=document.getElementById('cd-dt').value,lb=document.getElementById('cd-lb').value.trim();
  if(!dt){toast('Date requise','er');return;}
  const cd={active:true,date:dt,label:lb||'PROCHAIN TOURNOI'};
  LS.s('countdown',cd);startCountdown(cd);closeM();toast('Compte à rebours activé !','ok');
}
function disableCountdown(){LS.s('countdown',{active:false,date:'',label:''});document.getElementById('countdown-wrap').style.display='none';closeM();toast('Compte à rebours désactivé','in');}
function startCountdown(cd){
  if(!cd||!cd.active)return;
  document.getElementById('countdown-wrap').style.display='block';
  document.getElementById('cd-label').textContent='⏱ '+cd.label;
  const target=new Date(cd.date).getTime();
  function tick(){
    const now=Date.now(),diff=target-now;
    if(diff<=0){document.getElementById('cd-d').textContent='00';document.getElementById('cd-h').textContent='00';document.getElementById('cd-m').textContent='00';document.getElementById('cd-s').textContent='00';return;}
    document.getElementById('cd-d').textContent=String(Math.floor(diff/86400000)).padStart(2,'0');
    document.getElementById('cd-h').textContent=String(Math.floor(diff%86400000/3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent=String(Math.floor(diff%3600000/60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent=String(Math.floor(diff%60000/1000)).padStart(2,'0');
    setTimeout(tick,1000);
  }tick();
}
function saveSlogan(){const t=document.getElementById('sl-t').value.trim();LS.s('slogan',t);document.getElementById('hero-slogan').textContent=t;closeM();toast('Slogan mis à jour !','ok');}
function saveTitle(){const t=document.getElementById('tt-ti').value.trim();document.title=t;LS.s('title',t);closeM();toast('Titre mis à jour !','ok');}
function saveParticles(){const v=parseInt(document.getElementById('pc-range').value);LS.s('pcount',v);applyParticles(v);closeM();toast('Particules : '+v,'ok');}
function saveRecrit(){
  ['1','2','3','4'].forEach(n=>{
    document.getElementById('req'+n+'-t').textContent=document.getElementById('rc'+n+'t').value;
    document.getElementById('req'+n+'-d').textContent=document.getElementById('rc'+n+'d').value;
  });
  LS.s('recrit',{t1:document.getElementById('rc1t').value,d1:document.getElementById('rc1d').value,t2:document.getElementById('rc2t').value,d2:document.getElementById('rc2d').value,t3:document.getElementById('rc3t').value,d3:document.getElementById('rc3d').value,t4:document.getElementById('rc4t').value,d4:document.getElementById('rc4d').value});
  closeM();toast('Critères mis à jour !','ok');
}
function saveStream(){const st={yt:document.getElementById('yt-u').value.trim(),tw:document.getElementById('tw2-u').value.trim()};LS.s('stream',st);document.getElementById('lk-yt').href=st.yt||'#';closeM();toast('Liens stream mis à jour !','ok');}
function savePass(){
  const u=document.getElementById('nu').value.trim(),p=document.getElementById('np').value,p2=document.getElementById('np2').value;
  if(!u||!p){toast('Champs requis','er');return;}if(p!==p2){toast('Mots de passe différents','er');return;}
  LS.s('creds',{u,p});closeM();toast('Identifiants modifiés — reconnecte-toi','in');setTimeout(logoutAdmin,1500);
}
function importConfig(){
  const f=document.getElementById('imp-file').files[0];if(!f){toast('Sélectionne un fichier','er');return;}
  const rd=new FileReader();rd.onload=e=>{try{const cfg=JSON.parse(e.target.result);Object.keys(cfg).forEach(k=>cfg[k]!==null&&LS.s(k,cfg[k]));closeM();toast('Config importée ! Rechargement...','ok');setTimeout(()=>location.reload(),1500);}catch{toast('Fichier JSON invalide','er');}};rd.readAsText(f);
}
function doReset(){const keys=['cands','desc','soc','annonce','accent1','accent2','stats','title','slogan','herostats','tiktok','countdown','twitter','stream','recrit','theme','pcount'];keys.forEach(k=>localStorage.removeItem('lhg_'+k));closeM();toast('Site réinitialisé','in');setTimeout(()=>location.reload(),1200);}

function addPlayer(){
  const p=document.getElementById('rp').value.trim();if(!p){toast('Pseudo requis','er');return;}
  const card=document.createElement('div');card.className='pc';
  const ini=(document.getElementById('ri').value.trim()||'??').toUpperCase();
  card.innerHTML=`<div class="pc-flag">${document.getElementById('rf').value.trim()||'🇫🇷'}</div><div class="pc-hex">${ini}</div><div class="pc-role">${document.getElementById('rro').value.trim()}</div><div class="pc-name">${p}</div><div class="pc-real">${document.getElementById('rr').value.trim()}</div><div class="pc-kd"><span class="kl">K/D</span><span class="kv">${document.getElementById('rk').value.trim()||'—'}</span></div>`;
  card.style.cssText='opacity:0;transform:translateY(20px);transition:all .4s';
  document.getElementById('roster-grid').appendChild(card);setTimeout(()=>{card.style.opacity='1';card.style.transform='translateY(0)';},50);
  closeM();toast('Joueur '+p+' ajouté !','ok');
}
function addPalm(){
  const n=document.getElementById('pn').value.trim();if(!n){toast('Nom requis','er');return;}
  const pl=document.getElementById('pp').value,m=document.getElementById('pm').value.trim(),b=(document.getElementById('pb').value.trim()||pl).toUpperCase();
  const pc=pl==='1ST'?'p1':pl==='2ND'?'p2':pl==='3RD'?'p3':'pn',bc=pl==='1ST'?'bg-go':'bg-cy';
  const div=document.createElement('div');div.className='pi '+pc;
  div.innerHTML=`<div class="ppl">${pl}</div><div class="pinf"><div class="pnm">${n}</div><div class="pmt">${m}</div></div><div class="pbg ${bc}">${b}</div>`;
  div.style.cssText='opacity:0;transition:opacity .4s';document.getElementById('palm-list').prepend(div);setTimeout(()=>div.style.opacity='1',50);
  closeM();toast('Résultat ajouté !','ok');
}
function applyParticles(n){LS.s('pcount',n);PTC_COUNT=n;PTS.length=0;for(let i=0;i<n;i++)PTS.push(mkPt());}

/* ════ LOAD SAVED DATA ════ */
function loadSaved(){
  const desc=LS.g('desc',null);if(desc)document.getElementById('hero-desc').textContent=desc;
  const s=LS.g('soc',null);if(s){document.getElementById('lk-d').textContent=s.d;document.getElementById('lk-i').textContent=s.i;document.getElementById('lk-e').textContent=s.e;}
  const ann=LS.g('annonce','');if(ann){document.getElementById('ann-txt').textContent=ann;document.getElementById('ann').style.display='block';}
  const a1=LS.g('accent1',null);if(a1)document.documentElement.style.setProperty('--cy',a1);
  const a2=LS.g('accent2',null);if(a2)document.documentElement.style.setProperty('--vb',a2);
  const th=LS.g('theme',null);if(th){document.documentElement.style.setProperty('--bg',th.bg);document.documentElement.style.setProperty('--bg2',th.bg2);}
  const hs=LS.g('herostats',null);if(hs){document.getElementById('hs1n').textContent=hs.n1;document.getElementById('hs1l').textContent=hs.l1;document.getElementById('hs2n').textContent=hs.n2;document.getElementById('hs2l').textContent=hs.l2;document.getElementById('hs3n').textContent=hs.n3;document.getElementById('hs3l').textContent=hs.l3;}
  const tk=LS.g('tiktok',null);if(tk){document.getElementById('tt-link').href=tk.url;document.getElementById('tt-name').textContent=tk.name;document.getElementById('tt-desc').textContent=tk.desc;}
  const sl=LS.g('slogan',null);if(sl)document.getElementById('hero-slogan').textContent=sl;
  const ti=LS.g('title',null);if(ti)document.title=ti;
  const tw=LS.g('twitter',null);if(tw)document.getElementById('lk-tw').href=tw;
  const st=LS.g('stream',null);if(st)document.getElementById('lk-yt').href=st.yt||'#';
  const rc=LS.g('recrit',null);if(rc){['1','2','3','4'].forEach(n=>{if(rc['t'+n])document.getElementById('req'+n+'-t').textContent=rc['t'+n];if(rc['d'+n])document.getElementById('req'+n+'-d').textContent=rc['d'+n];});}
  const cd=LS.g('countdown',null);if(cd&&cd.active)startCountdown(cd);
  const stats=LS.g('stats',{v:0,c:0});stats.v=(stats.v||0)+1;LS.s('stats',stats);
}

/* ════ TOAST ════ */
function toast(msg,type='in'){
  const w=document.getElementById('toast'),el=document.createElement('div');
  el.className='ti '+type;el.textContent=msg;w.appendChild(el);
  setTimeout(()=>{el.style.cssText='opacity:0;transform:translateX(14px);transition:all .3s';setTimeout(()=>el.remove(),300);},3500);
}

/* ════ RING DOTS ════ */
const rdots=document.getElementById('rdots');
[{a:0,c:'c'},{a:60,c:'v'},{a:120,c:'g'},{a:180,c:'c'},{a:240,c:'v'},{a:300,c:'g'}].forEach(d=>{
  const el=document.createElement('div');el.className='rd '+d.c;
  const r=d.a*Math.PI/180;el.style.left=(190+95*Math.cos(r)-4)+'px';el.style.top=(190+95*Math.sin(r)-4)+'px';
  rdots.appendChild(el);
});

/* ════ PARTICLES ════ */
const CNV=document.getElementById('pc'),CTX=CNV.getContext('2d');
let PTC_COUNT=LS.g('pcount',55);
function rsz(){CNV.width=window.innerWidth;CNV.height=window.innerHeight;}rsz();window.addEventListener('resize',rsz);
function mkPt(){return{x:Math.random()*CNV.width,y:Math.random()*CNV.height,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,sz:Math.random()*1.4+.4,col:['#7c3aff','#22d3ee','#a855f7','#f59e0b'][Math.floor(Math.random()*4)]};}
let PTS=Array.from({length:PTC_COUNT},mkPt);
(function dP(){
  CTX.clearRect(0,0,CNV.width,CNV.height);
  PTS.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=CNV.width;if(p.x>CNV.width)p.x=0;if(p.y<0)p.y=CNV.height;if(p.y>CNV.height)p.y=0;CTX.beginPath();CTX.arc(p.x,p.y,p.sz,0,Math.PI*2);CTX.fillStyle=p.col;CTX.fill();});
  PTS.forEach((a,i)=>PTS.slice(i+1).forEach(b=>{const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<110){CTX.beginPath();CTX.moveTo(a.x,a.y);CTX.lineTo(b.x,b.y);CTX.strokeStyle=`rgba(124,58,255,${(1-d/110)*.12})`;CTX.lineWidth=.5;CTX.stroke();}}));
  requestAnimationFrame(dP);
})();

/* ════ SCROLL ANIM ════ */
const OBS=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting){x.target.style.opacity='1';x.target.style.transform='translateY(0)';}});},{threshold:.08});
document.querySelectorAll('.pc,.pi,.cc,.rr').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity .55s ease,transform .55s ease';OBS.observe(el);});

/* ════ NAV SCROLL ════ */
window.addEventListener('scroll',()=>{document.querySelector('nav').style.background=window.scrollY>50?'rgba(7,5,15,.97)':'rgba(7,5,15,.90)';});

/* ════ INIT ════ */
loadSaved();
checkSession();
