/* ———————————————————————————————————————————————————————
   LHG — admin.js v4.0
   Panel Admin Â· Webhook Â· Notifications Â· Stats
——————————————————————————————————————————————————————— */

var WEBHOOK_URL = S.get('webhook_url', '');
var isAdm = false;

function getCreds() { return S.get('creds', {u:'House', p:'houselhg'}); }

function checkSession() {
  var sess = S.get('sess', null);
  if (sess && sess.e > Date.now()) {
    isAdm = true; showBadge();
    var days = Math.ceil((sess.e - Date.now()) / (24*3600*1000));
    var inf = document.getElementById('sess-inf');
    if (inf) inf.innerHTML = '<span class="sess-dot"></span>' + days + 'j restant' + (days>1?'s':'');
  }
}

function showLoginSessStatus() {
  var sess = S.get('sess', null);
  var el = document.getElementById('a-sess-status'); if (!el) return;
  if (sess && sess.e > Date.now()) {
    var days = Math.ceil((sess.e - Date.now()) / (24*3600*1000));
    el.innerHTML = '<span style="color:#4ade80">&#x1F7E2; Session active</span> — encore <strong style="color:var(--go)">' + days + 'j</strong>';
  } else { el.textContent = ''; }
}

function showBadge() { document.getElementById('adm-badge').classList.add('show'); checkNewCands(); }
function hideBadge()  { document.getElementById('adm-badge').classList.remove('show'); }

function togglePwVis() {
  var inp = document.getElementById('apw'), btn = document.getElementById('pw-toggle');
  if (inp.type==='password') { inp.type='text'; btn.textContent='\u{1F648}'; }
  else { inp.type='password'; btn.textContent='\u{1F441}'; }
}

function openLogin() {
  document.getElementById('adm-ov').classList.add('on');
  showLoginSessStatus();
  var saved = S.get('saved_user', null);
  if (saved) document.getElementById('au').value = saved;
  setTimeout(function() {
    var au = document.getElementById('au');
    if (au.value) document.getElementById('apw').focus(); else au.focus();
  }, 80);
}

function closeLogin() {
  document.getElementById('adm-ov').classList.remove('on');
  document.getElementById('adm-err').style.display = 'none';
  document.getElementById('apw').value = '';
  document.getElementById('apw').type = 'password';
  document.getElementById('pw-toggle').textContent = '\u{1F441}';
}

function doLogin() {
  var u = document.getElementById('au').value.trim();
  var p = document.getElementById('apw').value;
  var remember = document.getElementById('a-rem').checked;
  var c = getCreds();
  if (u === c.u && p === c.p) {
    isAdm = true;
    var duration = remember ? 30*24*3600*1000 : 8*3600*1000;
    S.set('sess', {e: Date.now()+duration, remember: remember});
    if (remember) S.set('saved_user', u); else S.set('saved_user', null);
    closeLogin(); showBadge(); openPanel();
    toast(remember ? 'Connect\u00e9 30 jours \uD83D\uDD10' : 'Connect\u00e9 8h \uD83D\uDD10', 'ok');
  } else {
    var box = document.getElementById('adm-box');
    box.classList.add('shake');
    setTimeout(function(){ box.classList.remove('shake'); }, 400);
    document.getElementById('adm-err').style.display = 'block';
    document.getElementById('apw').value = '';
    document.getElementById('apw').focus();
  }
}

function toggleAdmin() {
  if (isAdm) {
    var panel = document.getElementById('adm-panel');
    if (panel.classList.contains('on')) closePanel(); else openPanel();
  } else { openLogin(); }
}

function openPanel() {
  document.getElementById('adm-panel').classList.add('on');
  renderStats(); renderCands(); renderRosterTbl(); renderPalmTbl(); renderAnnonces();
  updDt(); setInterval(updDt, 1000);
  var sess = S.get('sess', null);
  if (sess) {
    var days = Math.ceil((sess.e-Date.now())/(24*3600*1000));
    var inf = document.getElementById('sess-inf');
    if (inf) inf.innerHTML = '<span class="sess-dot"></span>' + days + 'j';
  }
  checkNewCands();
}

function closePanel() { document.getElementById('adm-panel').classList.remove('on'); }

function doLogout() {
  isAdm = false; S.set('sess', null);
  document.getElementById('adm-panel').classList.remove('on');
  hideBadge(); toast('D\u00e9connect\u00e9', 'in');
}

function updDt() {
  var el = document.getElementById('ap-dt');
  if (el) el.textContent = new Date().toLocaleString('fr-FR');
}

/* NOTIFICATIONS */
var _lastCandCount = -1;

function checkNewCands() {
  var cands = getCands();
  var newCount = cands.filter(function(x){ return x.st==='new'; }).length;
  var badge = document.getElementById('notif-badge');
  if (badge) {
    if (newCount > 0) { badge.textContent = newCount; badge.style.display = 'flex'; }
    else badge.style.display = 'none';
  }
  if (isAdm && newCount > _lastCandCount && _lastCandCount >= 0) {
    var diff = newCount - _lastCandCount;
    showNotif('\uD83D\uDCCB ' + diff + ' nouvelle' + (diff>1?'s':'') + ' candidature' + (diff>1?'s':'') + ' !', 'cands');
  }
  _lastCandCount = newCount;
}

setInterval(function() { if (isAdm) checkNewCands(); }, 30000);

function showNotif(msg, type) {
  var wrap = document.getElementById('notif-wrap'); if (!wrap) return;
  var el = document.createElement('div');
  el.className = 'notif notif-' + (type||'info');
  el.innerHTML = '<span>' + msg + '</span><button onclick="this.parentNode.remove()">\u2715</button>';
  wrap.appendChild(el);
  setTimeout(function(){ if(el.parentNode){ el.style.opacity='0'; el.style.transform='translateX(100%)'; setTimeout(function(){ if(el.parentNode) el.remove(); },400); } }, 6000);
}

/* EVENTS */
document.getElementById('btn-close-login').onclick = closeLogin;
document.getElementById('btn-login').onclick       = doLogin;
document.getElementById('btn-logout').onclick      = doLogout;
document.getElementById('adm-badge').onclick       = toggleAdmin;
document.getElementById('nav-logo').ondblclick     = function(e){ e.preventDefault(); toggleAdmin(); };
document.getElementById('pw-toggle').onclick       = togglePwVis;
document.getElementById('apw').onkeydown = function(e){ if(e.key==='Enter') doLogin(); };
document.getElementById('au').onkeydown  = function(e){ if(e.key==='Enter') document.getElementById('apw').focus(); };
document.addEventListener('keydown', function(e) {
  if (e.altKey && (e.code==='KeyS' || e.keyCode===83)) { e.preventDefault(); e.stopPropagation(); toggleAdmin(); }
  if (e.key==='Escape') { closeLogin(); closeModal(); }
});

/* TABS */
function switchTab(id) {
  document.querySelectorAll('.ap-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab')===id); });
  document.querySelectorAll('.ap-tc').forEach(function(t){ t.classList.remove('active'); });
  var tc = document.getElementById('tab-'+id); if (tc) tc.classList.add('active');
  if (id==='cands')      { renderCands(); checkNewCands(); }
  if (id==='overview')   renderStats();
  if (id==='roster-mgr') renderRosterTbl();
  if (id==='palm-mgr')   renderPalmTbl();
  if (id==='annonces')   renderAnnonces();
}
document.querySelectorAll('.ap-tab').forEach(function(btn){
  btn.addEventListener('click', function(){ switchTab(this.getAttribute('data-tab')); });
});

/* STATS */
function renderStats() {
  var cands = S.get('cands', []);
  var ok = cands.filter(function(x){ return x.st==='ok'; }).length;
  var ko = cands.filter(function(x){ return x.st==='ko'; }).length;
  var neu = cands.filter(function(x){ return x.st==='new'; }).length;
  var sv = S.get('stats', {v:0,c:0});
  var taux = cands.length > 0 ? Math.round((ok/cands.length)*100) : 0;
  var whOk = S.get('webhook_url','') ? true : false;
  var g = document.getElementById('stats-grid'); if (!g) return;
  var data = [
    {label:'Candidatures totales', val:cands.length, color:'var(--cy)', icon:'\uD83D\uDCCB'},
    {label:'Accept\u00e9es',       val:ok,           color:'#4ade80',   icon:'\u2705'},
    {label:'Refus\u00e9es',        val:ko,           color:'#f87171',   icon:'\u274C'},
    {label:'En attente',           val:neu,          color:'var(--go)', icon:'\uD83C\uDD95'},
    {label:'Taux acceptation',     val:taux+'%',     color:'var(--cy)', icon:'\uD83D\uDCC8'},
    {label:'Joueurs roster',       val:getRoster().length,   color:'var(--vb)', icon:'\uD83D\uDC65'},
    {label:'R\u00e9sultats',       val:getPalmData().length, color:'var(--go)', icon:'\uD83C\uDFC6'},
    {label:'Visites site',         val:sv.v||0,      color:'var(--vb)', icon:'\uD83D\uDC41'},
    {label:'Candidatures re\u00e7ues', val:sv.c||0,  color:'var(--cy)', icon:'\uD83D\uDCE8'},
    {label:'Webhook Discord',      val:whOk?'\u2705 OK':'\u274C Non config', color:whOk?'#4ade80':'#f87171', icon:'\uD83D\uDD17'}
  ];
  g.innerHTML = data.map(function(d){
    return '<div class="sbox"><div style="font-size:20px;margin-bottom:6px">'+d.icon+'</div>'
      +'<div class="sbox-n" style="color:'+d.color+'">'+d.val+'</div>'
      +'<div class="sbox-l">'+d.label+'</div></div>';
  }).join('');
}

/* CANDIDATURES */
var candFilter = 'all';
function getCands() { return S.get('cands', []); }
function saveCands(c) { S.set('cands', c); }
function setCandFilter(f) { candFilter = f; renderCands(); }

function renderCands() {
  var wrap = document.getElementById('cands-wrap'); if (!wrap) return;
  var all = getCands();
  var cands = candFilter==='all' ? all : all.filter(function(x){ return x.st===candFilter; });
  var bdg = document.getElementById('c-bdg');
  if (bdg) bdg.textContent = all.length + ' (' + all.filter(function(x){ return x.st==='new'; }).length + ' nouvelles)';
  if (!cands.length) {
    wrap.innerHTML = '<div class="empty"><span>\uD83D\uDCED</span>'+(candFilter==='all'?'AUCUNE CANDIDATURE':'AUCUNE DANS CETTE CAT\u00C9GORIE')+'</div>';
    return;
  }
  var h = '<table class="tbl"><thead><tr><th>#</th><th>PSEUDO</th><th>DISCORD</th><th>\u00C2GE</th><th>K/D</th><th>DATE</th><th>WEBHOOK</th><th>STATUT</th><th>ACTIONS</th></tr></thead><tbody>';
  cands.forEach(function(c) {
    var sc = c.st==='new'?'stn':c.st==='ok'?'sto':'stk';
    var sl = c.st==='new'?'NOUVEAU':c.st==='ok'?'ACCEPT\u00C9':'REFUS\u00C9';
    var whSent = c.wh_sent ? '<span style="color:#4ade80;font-size:11px">\u2705</span>' : '<span style="color:var(--dm);font-size:11px">—</span>';
    h += '<tr>'
      +'<td style="color:var(--dm);font-size:10px">'+(all.length-all.indexOf(c))+'</td>'
      +'<td><strong>'+c.p+'</strong></td>'
      +'<td style="color:var(--cy)">'+c.d+'</td>'
      +'<td>'+(c.a||'—')+'</td>'
      
      +'<td style="font-family:\'Orbitron\',monospace;color:var(--go)">'+(c.k||'—')+'</td>'
      +'<td style="font-size:11px;color:var(--dm)">'+c.date+'</td>'
      +'<td>'+whSent+'</td>'
      +'<td><span class="cst '+sc+'">'+sl+'</span></td>'
      +'<td>'
        +'<button class="tb a" onclick="setCandSt('+c.id+',\'ok\')">\u2713</button>'
        +'<button class="tb rj" onclick="setCandSt('+c.id+',\'ko\')">\u2717</button>'
        +'<button class="tb vw" onclick="viewCand('+c.id+')">\uD83D\uDC41</button>'
        +'<button class="tb ed" onclick="sendWebhookManual('+c.id+')" title="Envoyer Discord">\uD83D\uDCE4</button>'
        +'<button class="tb dl" onclick="delCand('+c.id+')">\uD83D\uDDD1</button>'
      +'</td></tr>';
  });
  wrap.innerHTML = h + '</tbody></table>';
}

function setCandSt(id, st) {
  var c = getCands(); var i = c.findIndex(function(x){ return x.id===id; });
  if (i>=0) {
    c[i].st = st;
    saveCands(c);
    renderCands();
    renderStats();
    toast(st==='ok' ? 'Accept\u00e9e \u2713' : 'Refus\u00e9e', 'in');
    /* Envoie un nouveau message Discord avec le statut */
    if (c[i].wh_sent) notifyStatusChange(c[i], st);
  }
}

function delCand(id) {
  if (!confirm('Supprimer cette candidature ?')) return;
  saveCands(getCands().filter(function(c){ return c.id!==id; }));
  renderCands(); renderStats(); toast('Supprim\u00e9e','in');
}

function viewCand(id) {
  var c = getCands().find(function(x){ return x.id===id; }); if (!c) return;
  document.getElementById('modal-title').textContent = 'CANDIDATURE — ' + c.p;
  var rows = [['Pseudo',c.p],['Discord',c.d],['\u00c2ge',c.a||'—'],['K/D',c.k||'—'],['H/Semaine',c.h||'—'],['Date',c.date]];
  var html = '<div style="display:flex;flex-direction:column;gap:10px">';
  rows.forEach(function(r){ html += '<div><div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--vb);margin-bottom:3px">'+r[0]+'</div><div style="background:rgba(7,5,15,.8);padding:9px 12px;border:1px solid var(--br)">'+r[1]+'</div></div>'; });
  html += '<div><div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--vb);margin-bottom:3px">PR\u00C9SENTATION</div><div style="background:rgba(7,5,15,.8);padding:9px 12px;border:1px solid var(--br);line-height:1.7">'+(c.b||'—')+'</div></div>';
  html += '<div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--dm);margin-top:4px">Webhook : '+(c.wh_sent?'<span style="color:#4ade80">\u2705 Envoy\u00e9</span>':'<span style="color:var(--dm)">Non envoy\u00e9</span>')+'</div>';
  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">'
    +'<button class="tb a" style="padding:9px 16px;font-size:10px" onclick="setCandSt('+c.id+',\'ok\');closeModal()">\u2713 ACCEPTER</button>'
    +'<button class="tb rj" style="padding:9px 16px;font-size:10px" onclick="setCandSt('+c.id+',\'ko\');closeModal()">\u2717 REFUSER</button>'
    +'<button class="tb ed" style="padding:9px 16px;font-size:10px" onclick="sendWebhookManual('+c.id+')">\uD83D\uDCE4 DISCORD</button>'
    +'</div></div>';
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('ap-mod').classList.add('on');
}

function exportCands() {
  var blob = new Blob([JSON.stringify(getCands(),null,2)], {type:'application/json'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'lhg-candidatures-' + Date.now() + '.json'; a.click();
  toast('Candidatures export\u00e9es','ok');
}

function exportConfig() {
  var keys = ['creds','desc','soc','annonce','annonces_list','accent1','accent2','stats','title','slogan','herostats','tiktok','countdown','twitter','stream','recrit','roster_data','palm_data','theme','pcount','webhook_url'];
  var cfg = {}; keys.forEach(function(k){ cfg[k] = S.get(k, null); });
  var blob = new Blob([JSON.stringify(cfg,null,2)], {type:'application/json'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'lhg-config-' + Date.now() + '.json'; a.click();
  toast('Config export\u00e9e','ok');
}

/* WEBHOOK CONFIG */
var LHG_WEBHOOK = 'https://discord.com/api/webhooks/1484467678814142569/Q34KqBg2JIE5e90CUjkBsc3Mckwj1eX0tc84B1wyr183Y8mDTP0vm36Xg0I6lTuZ4GYc';
var LHG_LOGO    = 'https://cdn.discordapp.com/embed/avatars/0.png';

/* Build Discord embed depending on candidature status */
function buildEmbed(cand, status) {
  var kd    = cand.k || '\u2014';
  var kdNum = parseFloat(kd);
  /* Color by status */
  var color;
  if      (status === 'ok') color = 0x4ade80;
  else if (status === 'ko') color = 0xf87171;
  else color = !isNaN(kdNum) ? (kdNum >= 3 ? 0x22d3ee : kdNum >= 2 ? 0xf59e0b : 0xa855f7) : 0x7c3aff;
  /* K/D bar */
  var kdBar = '';
  if (!isNaN(kdNum)) {
    var filled = Math.min(Math.round(kdNum / 4 * 10), 10);
    for (var _i=0;_i<10;_i++) kdBar += _i<filled ? '\u2588' : '\u2591';
    kdBar = '`' + kdBar + '` **' + kd + '**';
  } else { kdBar = '`' + kd + '`'; }
  /* Status line + title */
  var statusLine, title;
  if      (status === 'ok') { statusLine = '\u2705  **ACCEPT\u00c9**';  title = '\u2705  Candidature accept\u00e9e'; }
  else if (status === 'ko') { statusLine = '\u274c  **REFUS\u00c9**';   title = '\u274c  Candidature refus\u00e9e'; }
  else                      { statusLine = '\u23f3  En attente';         title = '\uD83D\uDCE5  Nouvelle candidature re\u00e7ue'; }

  return {
    title: title,
    description: '> **La House Gaming** \u2014 Candidature de **' + cand.p + '**',
    color: color,
    thumbnail: { url: LHG_LOGO },
    fields: [
      { name: '\uD83C\uDFAE  Pseudo Warzone',   value: '```\n' + cand.p + '\n```', inline: true },
      { name: '\uD83D\uDCAC  Discord',            value: '```\n' + cand.d + '\n```', inline: true },
      { name: '\uD83C\uDF82  \u00c2ge',           value: '`' + (cand.a || 'Non renseign\u00e9') + '`', inline: true },
      { name: '\uD83D\uDCCA  K/D Ratio',           value: kdBar, inline: true },
      { name: '\u23f1\ufe0f  Disponibilit\u00e9', value: '`' + (cand.h || 'Non renseign\u00e9') + ' / semaine`', inline: true },
      { name: '\uD83D\uDD16  Statut',              value: statusLine, inline: true },
      { name: '\uD83D\uDCDD  Pr\u00e9sentation',  value: cand.b ? (cand.b.length > 300 ? cand.b.substring(0,300)+'...' : cand.b) : '*Aucune pr\u00e9sentation fournie*' },
      { name: '\uD83D\uDCC5  Re\u00e7ue le',      value: '`' + cand.date + '`', inline: true }
    ],
    footer: { text: 'La House Gaming  \u2022  Panel Admin LHG', icon_url: LHG_LOGO },
    timestamp: new Date().toISOString()
  };
}

/* Envoie la candidature initiale sur Discord */
function sendWebhook(cand) {
  var url = S.get('webhook_url', '') || LHG_WEBHOOK;
  if (!url) return Promise.resolve(false);
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'LHG \u2014 Candidatures',
      avatar_url: LHG_LOGO,
      embeds: [buildEmbed(cand, 'new')]
    })
  })
  .then(function(res) { return res.ok || res.status === 204; })
  .catch(function() { return false; });
}

/* Envoie un NOUVEAU message Discord quand on accepte ou refuse */
function notifyStatusChange(cand, newStatus) {
  var url = S.get('webhook_url', '') || LHG_WEBHOOK;
  if (!url) return;
  var isOk  = (newStatus === 'ok');
  var color = isOk ? 0x4ade80 : 0xf87171;
  var title = isOk ? '\u2705  Candidature ACCEPT\u00c9E \u2014 ' + cand.p : '\u274c  Candidature REFUS\u00c9E \u2014 ' + cand.p;
  var desc  = isOk
    ? '> \uD83C\uDF89 La candidature de **' + cand.p + '** vient d\u2019\u00eatre **accept\u00e9e** !\n> Bienvenue dans la famille **La House Gaming** \uD83D\uDD25'
    : '> La candidature de **' + cand.p + '** a \u00e9t\u00e9 **refus\u00e9e**.\n> Merci pour l\u2019int\u00e9r\u00eat port\u00e9 \u00e0 **LHG**.';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'LHG \u2014 Candidatures',
      avatar_url: LHG_LOGO,
      embeds: [{
        title: title,
        description: desc,
        color: color,
        fields: [
          { name: '\uD83C\uDFAE  Pseudo',        value: '`' + cand.p + '`',               inline: true },
          { name: '\uD83D\uDCAC  Discord',        value: '`' + cand.d + '`',               inline: true },
          { name: '\uD83D\uDCCA  K/D',            value: '`' + (cand.k || '\u2014') + '`', inline: true }
        ],
        footer: { text: 'La House Gaming  \u2022  Panel Admin LHG', icon_url: LHG_LOGO },
        timestamp: new Date().toISOString()
      }]
    })
  }).catch(function() {});
}

function sendWebhookManual(id) {
  var c = getCands().find(function(x){ return x.id===id; }); if (!c) return;
  toast('Envoi en cours...','in');
  sendWebhook(c).then(function(ok) {
    if (ok) {
      var cands = getCands(); var i = cands.findIndex(function(x){ return x.id===id; });
      if (i>=0) { cands[i].wh_sent = true; saveCands(cands); }
      renderCands(); toast('\u2705 Envoy\u00e9 sur Discord !','ok');
    } else { toast('\u274c Erreur webhook','er'); }
  });
}

/* ANNONCES */
function getAnnonces() { return S.get('annonces_list', []); }
function saveAnnonces(a) { S.set('annonces_list', a); }

function renderAnnonces() {
  var wrap = document.getElementById('annonces-wrap'); if (!wrap) return;
  var list = getAnnonces(); var active = S.get('annonce', '');
  var html = '<div style="margin-bottom:20px;padding:16px;background:rgba(7,5,15,.8);border:1px solid var(--br)">'
    +'<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:2px;color:var(--cy);margin-bottom:10px">ANNONCE ACTIVE</div>'
    +(active
      ? '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><span style="font-size:14px;color:var(--wh)">'+active+'</span><button class="tb dl" onclick="clearAnn()">\uD83D\uDDD1 Effacer</button></div>'
      : '<span style="color:var(--dm);font-size:12px;font-family:\'Share Tech Mono\',monospace">Aucune annonce active</span>')
    +'</div>';
  html += '<div style="display:flex;gap:9px;margin-bottom:16px">'
    +'<button class="apb c" onclick="openModal(\'annonce\')">\u2795 Nouvelle annonce</button>'
    +'</div>';
  if (list.length) {
    html += '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;letter-spacing:2px;color:var(--dm);margin-bottom:10px;text-transform:uppercase">Historique ('+list.length+')</div><div style="display:flex;flex-direction:column;gap:8px">';
    list.slice().reverse().forEach(function(a, i) {
      var realI = list.length-1-i;
      html += '<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;background:rgba(13,10,26,.9);border:1px solid var(--br)">'
        +'<span style="font-size:13px;flex:1;color:var(--wh)">'+a.text+'</span>'
        +'<span style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--dm)">'+a.date+'</span>'
        +'<button class="tb a" onclick="activateAnn(\''+a.text.replace(/\\/g,'\\\\').replace(/'/g,'\\\'')+'\')" title="Activer">\u25B6</button>'
        +'<button class="tb dl" onclick="deleteAnn('+realI+')" title="Supprimer">\uD83D\uDDD1</button>'
        +'</div>';
    });
    html += '</div>';
  }
  wrap.innerHTML = html;
}

function activateAnn(text) {
  S.set('annonce', text);
  var bar=document.getElementById('ann'), txt=document.getElementById('ann-txt');
  txt.textContent=text; bar.style.display='block';
  renderAnnonces(); toast('Annonce activ\u00e9e !','ok');
}
function deleteAnn(i) {
  var list=getAnnonces(); list.splice(i,1); saveAnnonces(list);
  renderAnnonces(); toast('Annonce supprim\u00e9e','in');
}

/* MODAL */
document.getElementById('btn-close-modal').onclick = closeModal;
function closeModal() { document.getElementById('ap-mod').classList.remove('on'); }

function openModal(t) {
  var T=document.getElementById('modal-title'), B=document.getElementById('modal-body');
  document.getElementById('ap-mod').classList.add('on');

  if (t==='annonce') {
    T.textContent='NOUVELLE ANNONCE';
    var cur=S.get('annonce','');
    B.innerHTML='<div class="mfg"><label class="mfl">Texte de l\'annonce</label><input class="mfi" id="ann-in" value="'+cur+'" placeholder="ex: Tournoi ce samedi 20h !"></div>'
      +'<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:8px">'
      +'<button class="msv" onclick="saveAnn()">PUBLIER \u2192</button>'
      +'<button class="msv msv-r" onclick="clearAnn()">EFFACER</button></div>';

  } else if (t==='webhook') {
    T.textContent='WEBHOOK DISCORD';
    var curWh=S.get('webhook_url','');
    var curWh = S.get('webhook_url','') || LHG_WEBHOOK;
    B.innerHTML='<div style="background:rgba(34,211,238,.05);border:1px solid rgba(34,211,238,.2);padding:14px;margin-bottom:16px;font-family:\'Share Tech Mono\',monospace;font-size:10px;line-height:1.8;color:var(--dm)">'
      +'<strong style="color:var(--cy)">Webhook actuel :</strong><br>'
      +'Le webhook est pr\u00e9-configur\u00e9. Tu peux en changer si besoin.'
      +'</div>'
      +'<div class="mfg"><label class="mfl">URL Webhook Discord</label><input class="mfi" id="wh-url" value="'+curWh+'" placeholder="https://discord.com/api/webhooks/..."></div>'
      +'<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:8px">'
      +'<button class="msv" onclick="saveWebhook()">SAUVEGARDER \u2192</button>'
      +'<button class="msv" style="background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.3)" onclick="testWebhook()">\uD83E\uDDEA TESTER</button>'
      +'</div>'
      +'<div id="wh-status" style="margin-top:10px;font-family:\'Share Tech Mono\',monospace;font-size:10px"></div>';

  } else if (t==='add-player') {
    T.textContent='AJOUTER UN JOUEUR';
    B.innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +'<div class="mfg"><label class="mfl">Pseudo</label><input class="mfi" id="np-name" placeholder="LHG Pseudo"></div>'
      +'<div class="mfg"><label class="mfl">Pr\u00e9nom Nom</label><input class="mfi" id="np-real" placeholder="Pr\u00e9nom Nom"></div>'
      +'<div class="mfg"><label class="mfl">R\u00f4le</label><input class="mfi" id="np-role" placeholder="ex: Fragger"></div>'
      +'<div class="mfg"><label class="mfl">Initiales</label><input class="mfi" id="np-ini" placeholder="FR" maxlength="3"></div>'
      +'<div class="mfg"><label class="mfl">K/D</label><input class="mfi" id="np-kd" placeholder="ex: 2.45"></div>'
      +'<div class="mfg"><label class="mfl">\uD83C\uDFC6 Wins / Top 1</label><input class="mfi" id="np-wins" placeholder="ex: 124"></div>'
      +'<div class="mfg"><label class="mfl">\u23f1 Heures de jeu</label><input class="mfi" id="np-hours" placeholder="ex: 2500h"></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDCBB Plateforme</label><select class="mfsel" id="np-plat"><option>PC</option><option>PS5</option><option>Xbox</option></select></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDC65 \u00c9quipe</label><select class="mfsel" id="np-team"><option value="1">\u00c9quipe 1</option><option value="2">\u00c9quipe 2</option></select></div>'
      +'<div class="mfg"><label class="mfl">Drapeau emoji</label><input class="mfi" id="np-flag" placeholder="\uD83C\uDDEB\uD83C\uDDF7"></div>'
      +'</div>'
      +'<div class="mfg" style="margin-top:6px"><label class="mfl">\uD83D\uDCF8 URL Photo</label><input class="mfi" id="np-photo" placeholder="https://i.imgur.com/xxxxx.png"></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDFE3 Twitch</label><input class="mfi" id="np-twitch" placeholder="https://twitch.tv/pseudo"></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDD34 YouTube</label><input class="mfi" id="np-youtube" placeholder="https://youtube.com/@pseudo"></div>'
      +'<button class="msv" onclick="addPlayer()">AJOUTER \u2192</button>';

  } else if (t==='add-palm') {
    T.textContent='AJOUTER UN R\u00C9SULTAT';
    B.innerHTML='<div class="mfg"><label class="mfl">Nom du tournoi</label><input class="mfi" id="np-pn" placeholder="ex: Open Warzone FR"></div>'
      +'<div class="mfg"><label class="mfl">Placement</label><select class="mfsel" id="np-pp">'
      +['1ST','2ND','3RD','TOP 5','TOP 8','TOP 16'].map(function(v){ return '<option value="'+v+'">'+v+'</option>'; }).join('')
      +'</select></div>'
      +'<div class="mfg"><label class="mfl">D\u00e9tails</label><input class="mfi" id="np-pm" placeholder="ex: MARS 2025 \u00b7 WARZONE \u00b7 SQUAD"></div>'
      +'<div class="mfg"><label class="mfl">Badge</label><input class="mfi" id="np-pb" placeholder="ex: CHAMPION"></div>'
      +'<button class="msv" onclick="addPalm()">AJOUTER \u2192</button>';

  } else if (t==='desc') {
    T.textContent='TEXTE D\'ACCUEIL';
    B.innerHTML='<div class="mfg"><label class="mfl">Description</label><textarea class="mfi mfi-ta" id="m-desc">'+(S.get('desc','')||document.getElementById('hero-desc').textContent)+'</textarea></div><button class="msv" onclick="saveDesc()">SAUVEGARDER \u2192</button>';

  } else if (t==='herostats') {
    T.textContent='STATISTIQUES HERO';
    var hs=S.get('herostats',{n1:'12+',l1:'Joueurs',n2:'2024',l2:'Fondation',n3:'TOP',l3:'France'});
    B.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">'
      +'<div class="mfg"><label class="mfl">Stat 1 Valeur</label><input class="mfi" id="hs1n" value="'+hs.n1+'"></div>'
      +'<div class="mfg"><label class="mfl">Stat 1 Label</label><input class="mfi" id="hs1l" value="'+hs.l1+'"></div>'
      +'<div class="mfg"><label class="mfl">Stat 2 Valeur</label><input class="mfi" id="hs2n" value="'+hs.n2+'"></div>'
      +'<div class="mfg"><label class="mfl">Stat 2 Label</label><input class="mfi" id="hs2l" value="'+hs.l2+'"></div>'
      +'<div class="mfg"><label class="mfl">Stat 3 Valeur</label><input class="mfi" id="hs3n" value="'+hs.n3+'"></div>'
      +'<div class="mfg"><label class="mfl">Stat 3 Label</label><input class="mfi" id="hs3l" value="'+hs.l3+'"></div>'
      +'</div><button class="msv" onclick="saveHeroStats()">SAUVEGARDER \u2192</button>';

  } else if (t==='tiktok') {
    T.textContent='BANNI\u00C8RE TIKTOK';
    var tk=S.get('tiktok',{url:'https://www.tiktok.com/@lahousegaming',name:'@lahousegaming',desc:'Clips \u00b7 Highlights \u00b7 Behind the scenes'});
    B.innerHTML='<div class="mfg"><label class="mfl">URL TikTok</label><input class="mfi" id="tk-u" value="'+tk.url+'"></div>'
      +'<div class="mfg"><label class="mfl">Nom affich\u00e9</label><input class="mfi" id="tk-n" value="'+tk.name+'"></div>'
      +'<div class="mfg"><label class="mfl">Description</label><input class="mfi" id="tk-d" value="'+tk.desc+'"></div>'
      +'<button class="msv" onclick="saveTikTok()">SAUVEGARDER \u2192</button>';

  } else if (t==='countdown') {
    T.textContent='COMPTE \u00C0 REBOURS';
    var cd=S.get('countdown',{active:false,date:'',label:'PROCHAIN TOURNOI'});
    B.innerHTML='<div class="mfg"><label class="mfl">Date et heure</label><input type="datetime-local" class="mfi" id="cd-dt" value="'+cd.date+'"></div>'
      +'<div class="mfg"><label class="mfl">Label</label><input class="mfi" id="cd-lb" value="'+cd.label+'"></div>'
      +'<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:8px">'
      +'<button class="msv" onclick="saveCountdownAdmin()">ACTIVER \u2192</button>'
      +'<button class="msv msv-r" onclick="disableCountdown()">D\u00c9SACTIVER</button></div>';

  } else if (t==='slogan') {
    T.textContent='SLOGAN HERO';
    B.innerHTML='<div class="mfg"><label class="mfl">Slogan</label><input class="mfi" id="m-slogan" value="'+(S.get('slogan','')||document.getElementById('hero-slogan').textContent)+'"></div>'
      +'<button class="msv" onclick="saveSlogan()">SAUVEGARDER \u2192</button>';

  } else if (t==='page-title') {
    T.textContent='TITRE ONGLET';
    B.innerHTML='<div class="mfg"><label class="mfl">Titre</label><input class="mfi" id="m-title" value="'+document.title+'"></div>'
      +'<button class="msv" onclick="document.title=document.getElementById(\'m-title\').value;S.set(\'title\',document.title);closeModal();toast(\'Titre mis \u00e0 jour\',\'ok\')">SAUVEGARDER \u2192</button>';

  } else if (t==='socials') {
    T.textContent='LIENS SOCIAUX';
    var so=S.get('soc',{d:'discord.gg/lhg',i:'@lhg_esport',e:'contact@lhg-esport.fr'});
    B.innerHTML='<div class="mfg"><label class="mfl">Discord</label><input class="mfi" id="so-d" value="'+so.d+'"></div>'
      +'<div class="mfg"><label class="mfl">Instagram</label><input class="mfi" id="so-i" value="'+so.i+'"></div>'
      +'<div class="mfg"><label class="mfl">Email</label><input class="mfi" id="so-e" value="'+so.e+'"></div>'
      +'<button class="msv" onclick="saveSoc()">SAUVEGARDER \u2192</button>';

  } else if (t==='twitter') {
    T.textContent='TWITTER / X';
    B.innerHTML='<div class="mfg"><label class="mfl">URL Twitter/X</label><input class="mfi" id="m-tw" value="'+(S.get('twitter','')||'')+'" placeholder="https://x.com/lahousegaming"></div>'
      +'<button class="msv" onclick="S.set(\'twitter\',document.getElementById(\'m-tw\').value);document.getElementById(\'lk-tw\').href=document.getElementById(\'m-tw\').value;closeModal();toast(\'Twitter mis \u00e0 jour\',\'ok\')">SAUVEGARDER \u2192</button>';

  } else if (t==='stream') {
    T.textContent='TWITCH / YOUTUBE / DISCORD';
    var str=S.get('stream',{yt:'',tw:'',discord:'',discord_name:'La House Gaming',twitch:'',twitch_name:'lahousegaming'});
    B.innerHTML=
      '<div class="mfg"><label class="mfl">YouTube</label><input class="mfi" id="st-yt" value="'+str.yt+'" placeholder="https://youtube.com/@lahousegaming"></div>'
      +'<div style="height:1px;background:var(--br);margin:12px 0"></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDC9C Lien Discord (bannière)</label><input class="mfi" id="st-discord" value="'+(str.discord||'')+'" placeholder="https://discord.gg/xxxxx"></div>'
      +'<div class="mfg"><label class="mfl">Nom Discord affiché</label><input class="mfi" id="st-discord-name" value="'+(str.discord_name||'La House Gaming')+'" placeholder="La House Gaming"></div>'
      +'<div style="height:1px;background:var(--br);margin:12px 0"></div>'
      +'<div class="mfg"><label class="mfl">\uD83D\uDFE3 Lien Twitch (bannière)</label><input class="mfi" id="st-twitch" value="'+(str.twitch||'')+'" placeholder="https://twitch.tv/lahousegaming"></div>'
      +'<div class="mfg"><label class="mfl">Nom Twitch affiché</label><input class="mfi" id="st-twitch-name" value="'+(str.twitch_name||'lahousegaming')+'" placeholder="lahousegaming"></div>'
      +'<button class="msv" onclick="saveStream()">SAUVEGARDER \u2192</button>';

  } else if (t==='color1') {
    T.textContent='COULEUR PRINCIPALE (CYAN)';
    var sw1=[['#22d3ee','Cyan'],['#00ffea','Mint'],['#38bdf8','Sky'],['#60a5fa','Bleu'],['#4ade80','Vert'],['#a78bfa','Lavande'],['#f472b6','Rose'],['#fb923c','Orange']];
    B.innerHTML='<div class="sw-g">'+sw1.map(function(s){ return '<div class="sw" onclick="applyC1(\''+s[0]+'\')" style="border-color:'+s[0]+'55;background:'+s[0]+'18"><div class="sw-d" style="background:'+s[0]+';box-shadow:0 0 7px '+s[0]+'"></div><div class="sw-l" style="color:'+s[0]+'">'+s[1]+'</div></div>'; }).join('')+'</div>'
      +'<div class="mfg"><label class="mfl">Hex custom</label><input class="mfi" id="cc1" placeholder="#22d3ee"></div>'
      +'<button class="msv" onclick="applyC1(document.getElementById(\'cc1\').value)">APPLIQUER \u2192</button>';

  } else if (t==='color2') {
    T.textContent='COULEUR SECONDAIRE (VIOLET)';
    var sw2=[['#a855f7','Violet'],['#7c3aff','Purple'],['#6366f1','Indigo'],['#ec4899','Pink'],['#f59e0b','Gold'],['#ef4444','Red'],['#10b981','Emerald'],['#f97316','Ambre']];
    B.innerHTML='<div class="sw-g">'+sw2.map(function(s){ return '<div class="sw" onclick="applyC2(\''+s[0]+'\')" style="border-color:'+s[0]+'55;background:'+s[0]+'18"><div class="sw-d" style="background:'+s[0]+';box-shadow:0 0 7px '+s[0]+'"></div><div class="sw-l" style="color:'+s[0]+'">'+s[1]+'</div></div>'; }).join('')+'</div>'
      +'<div class="mfg"><label class="mfl">Hex custom</label><input class="mfi" id="cc2" placeholder="#a855f7"></div>'
      +'<button class="msv" onclick="applyC2(document.getElementById(\'cc2\').value)">APPLIQUER \u2192</button>';

  } else if (t==='theme') {
    T.textContent='TH\u00C8ME DE FOND';
    var themes=[['#07050f','Noir Profond (d\u00e9faut)','#0d0a1a'],['#050a14','Bleu Nuit','#091422'],['#0f0a05','Brun Sombre','#1a1005'],['#05050f','Violet Nuit','#0a0a1a']];
    B.innerHTML='<div style="display:flex;flex-direction:column;gap:9px">'+themes.map(function(th){ return '<div onclick="applyTheme(\''+th[0]+'\',\''+th[2]+'\')" style="padding:11px 14px;border:1px solid var(--br);cursor:pointer;display:flex;align-items:center;gap:11px;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(34,211,238,.4)\'" onmouseout="this.style.borderColor=\'rgba(124,58,255,.2)\'"><div style="width:28px;height:28px;background:'+th[0]+';border:1px solid rgba(255,255,255,.1);border-radius:3px"></div><span style="font-family:\'Rajdhani\',sans-serif;font-size:14px">'+th[1]+'</span></div>'; }).join('')+'</div>';

  } else if (t==='particles') {
    T.textContent='PARTICULES';
    var curP=S.get('pcount',55);
    B.innerHTML='<p style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:var(--dm);margin-bottom:14px">Nombre : <span id="pc-val" style="color:var(--cy)">'+curP+'</span></p>'
      +'<input type="range" min="0" max="150" value="'+curP+'" oninput="document.getElementById(\'pc-val\').textContent=this.value" id="pc-range" style="width:100%;margin-bottom:14px;accent-color:var(--cy)">'
      +'<div style="display:flex;gap:9px"><button class="msv" onclick="saveParticles()">APPLIQUER \u2192</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="applyParticles(0);closeModal()">D\u00c9SACTIVER</button></div>';

  } else if (t==='recrit') {
    T.textContent='CRIT\u00C8RES RECRUTEMENT';
    B.innerHTML=['1','2','3','4'].map(function(n){ return '<div class="mfg"><label class="mfl">Crit\u00e8re '+n+' \u2014 Titre</label><input class="mfi" id="rc'+n+'t" value="'+document.getElementById('req'+n+'-t').textContent+'"></div><div class="mfg"><label class="mfl">Crit\u00e8re '+n+' \u2014 Description</label><input class="mfi" id="rc'+n+'d" value="'+document.getElementById('req'+n+'-d').textContent+'"></div>'; }).join('')+'<button class="msv" onclick="saveRecrit()">SAUVEGARDER \u2192</button>';

  } else if (t==='pass') {
    T.textContent='MODIFIER LES IDENTIFIANTS';
    B.innerHTML='<div class="mfg"><label class="mfl">Nouveau nom d\'utilisateur</label><input class="mfi" id="np-u"></div>'
      +'<div class="mfg"><label class="mfl">Nouveau mot de passe</label><input type="password" class="mfi" id="np-p"></div>'
      +'<div class="mfg"><label class="mfl">Confirmer</label><input type="password" class="mfi" id="np-p2"></div>'
      +'<button class="msv" onclick="savePass()">MODIFIER \u2192</button>';

  } else if (t==='import') {
    T.textContent='IMPORTER CONFIG';
    B.innerHTML='<p style="font-family:\'Share Tech Mono\',monospace;font-size:10px;color:var(--dm);margin-bottom:14px">Fichier JSON export\u00e9 depuis ce panel.</p>'
      +'<input type="file" accept=".json" id="imp-file" class="mfi" style="clip-path:none;padding:7px">'
      +'<button class="msv" style="margin-top:11px" onclick="importConfig()">IMPORTER \u2192</button>';

  } else if (t==='reset') {
    T.textContent='\u26A0 R\u00C9INITIALISATION';
    B.innerHTML='<p style="color:#f87171;font-family:\'Share Tech Mono\',monospace;font-size:11px;line-height:1.8;margin-bottom:18px">ATTENTION : Toutes les donn\u00e9es seront supprim\u00e9es. Action irr\u00e9versible.</p>'
      +'<div style="display:flex;gap:11px"><button class="msv msv-r" onclick="doReset()">\u26A0 CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeModal()">ANNULER</button></div>';

  } else if (t==='del-all-cands') {
    T.textContent='SUPPRIMER TOUTES LES CANDIDATURES';
    B.innerHTML='<p style="color:#f87171;font-family:\'Share Tech Mono\',monospace;font-size:11px;margin-bottom:18px">'+getCands().length+' candidature(s) seront supprim\u00e9es.</p>'
      +'<div style="display:flex;gap:11px"><button class="msv msv-r" onclick="saveCands([]);renderCands();renderStats();closeModal();toast(\'Candidatures supprim\u00e9es\',\'in\')">CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeModal()">ANNULER</button></div>';

  } else if (t==='del-all-roster') {
    T.textContent='VIDER LE ROSTER';
    B.innerHTML='<p style="color:#f87171;font-family:\'Share Tech Mono\',monospace;font-size:11px;margin-bottom:18px">'+getRoster().length+' joueur(s) seront supprim\u00e9s.</p>'
      +'<div style="display:flex;gap:11px"><button class="msv msv-r" onclick="saveRoster([]);renderRosterDOM();renderRosterTbl();renderStats();closeModal();toast(\'Roster vid\u00e9\',\'in\')">CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeModal()">ANNULER</button></div>';

  } else if (t==='del-all-palm') {
    T.textContent='VIDER LE PALMARES';
    B.innerHTML='<p style="color:#f87171;font-family:\'Share Tech Mono\',monospace;font-size:11px;margin-bottom:18px">'+getPalmData().length+' r\u00e9sultat(s) seront supprim\u00e9s.</p>'
      +'<div style="display:flex;gap:11px"><button class="msv msv-r" onclick="savePalmData([]);renderPalmDOM();renderPalmTbl();renderStats();closeModal();toast(\'Palmares vid\u00e9\',\'in\')">CONFIRMER</button><button class="msv" style="background:transparent;border:1px solid var(--br)" onclick="closeModal()">ANNULER</button></div>';
  }
}

/* SAVE ACTIONS */
function saveAnn() {
  var t=document.getElementById('ann-in').value.trim(); if(!t) return;
  S.set('annonce',t);
  var list=getAnnonces(); list.push({text:t, date:new Date().toLocaleDateString('fr-FR')});
  if(list.length>20) list.shift(); saveAnnonces(list);
  var bar=document.getElementById('ann'), txt=document.getElementById('ann-txt');
  txt.textContent=t; bar.style.display='block';
  closeModal(); renderAnnonces(); toast('Annonce publi\u00e9e !','ok');
}
function clearAnn() {
  S.set('annonce',''); document.getElementById('ann').style.display='none';
  renderAnnonces(); if(document.getElementById('ap-mod').classList.contains('on')) closeModal();
  toast('Annonce effac\u00e9e','in');
}
function saveWebhook() {
  var url=document.getElementById('wh-url').value.trim(); S.set('webhook_url',url); WEBHOOK_URL=url;
  renderStats(); closeModal(); toast('Webhook sauvegard\u00e9 !','ok');
}
function testWebhook() {
  var url=document.getElementById('wh-url').value.trim() || LHG_WEBHOOK;
  if(!url){toast('Pas d\'URL webhook','er');return;}
  var status=document.getElementById('wh-status'); if(status) status.innerHTML='<span style="color:var(--cy)">Envoi test...</span>';
  fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    username:'LHG — Candidatures',
    avatar_url: LHG_LOGO,
    embeds:[{
      title:'\uD83E\uDDEA Test Webhook — La House Gaming',
      description:'> Le webhook est correctement configur\u00e9 !\n> Les candidatures seront envoy\u00e9es dans ce salon.',
      color:0x22d3ee,
      thumbnail:{url:LHG_LOGO},
      footer:{text:'La House Gaming  \u2022  Panel Admin LHG', icon_url:LHG_LOGO},
      timestamp:new Date().toISOString()
    }]
  })})
  .then(function(res){
    if(res.ok||res.status===204){
      if(status) status.innerHTML='<span style="color:#4ade80">\u2705 Test r\u00e9ussi ! V\u00e9rifie ton salon Discord</span>';
      S.set('webhook_url',url); WEBHOOK_URL=url; renderStats();
    } else { if(status) status.innerHTML='<span style="color:#f87171">\u274C Erreur '+res.status+'</span>'; }
  })
  .catch(function(){ if(status) status.innerHTML='<span style="color:#f87171">\u274C Connexion impossible</span>'; });
}
function saveDesc(){var t=document.getElementById('m-desc').value.trim();S.set('desc',t);document.getElementById('hero-desc').textContent=t;closeModal();toast('Description mise \u00e0 jour !','ok');}
function saveHeroStats(){var hs={n1:document.getElementById('hs1n').value,l1:document.getElementById('hs1l').value,n2:document.getElementById('hs2n').value,l2:document.getElementById('hs2l').value,n3:document.getElementById('hs3n').value,l3:document.getElementById('hs3l').value};S.set('herostats',hs);['1','2','3'].forEach(function(n){document.getElementById('hs'+n+'n').textContent=hs['n'+n];document.getElementById('hs'+n+'l').textContent=hs['l'+n];});closeModal();toast('Stats mises \u00e0 jour !','ok');}
function saveTikTok(){var tk={url:document.getElementById('tk-u').value.trim(),name:document.getElementById('tk-n').value.trim(),desc:document.getElementById('tk-d').value.trim()};S.set('tiktok',tk);document.getElementById('tt-link').href=tk.url;document.getElementById('tt-name').textContent=tk.name;document.getElementById('tt-desc').textContent=tk.desc;closeModal();toast('TikTok mis \u00e0 jour !','ok');}
function saveCountdownAdmin(){var dt=document.getElementById('cd-dt').value,lb=document.getElementById('cd-lb').value.trim();if(!dt){toast('Date requise','er');return;}var cd={active:true,date:dt,label:lb||'PROCHAIN TOURNOI'};S.set('countdown',cd);startCountdown(cd);closeModal();toast('Countdown activ\u00e9 !','ok');}
function disableCountdown(){S.set('countdown',{active:false,date:'',label:''});document.getElementById('cd-wrap').style.display='none';closeModal();toast('Countdown d\u00e9sactiv\u00e9','in');}
function saveSlogan(){var t=document.getElementById('m-slogan').value.trim();S.set('slogan',t);document.getElementById('hero-slogan').textContent=t;closeModal();toast('Slogan mis \u00e0 jour !','ok');}
function saveSoc(){var so={d:document.getElementById('so-d').value.trim(),i:document.getElementById('so-i').value.trim(),e:document.getElementById('so-e').value.trim()};S.set('soc',so);document.getElementById('lk-d').textContent=so.d;document.getElementById('lk-i').textContent=so.i;document.getElementById('lk-e').textContent=so.e;closeModal();toast('Liens mis \u00e0 jour !','ok');}
function saveStream(){
  var st={
    yt:           document.getElementById('st-yt').value.trim(),
    discord:      document.getElementById('st-discord').value.trim(),
    discord_name: document.getElementById('st-discord-name').value.trim() || 'La House Gaming',
    twitch:       document.getElementById('st-twitch').value.trim(),
    twitch_name:  document.getElementById('st-twitch-name').value.trim() || 'lahousegaming'
  };
  S.set('stream', st);
  /* Mise à jour live */
  var lkYt = document.getElementById('lk-yt'); if(lkYt) lkYt.href = st.yt||'#';
  var discEl = document.getElementById('social-discord'); if(discEl && st.discord) discEl.href = st.discord;
  var twitEl = document.getElementById('social-twitch');  if(twitEl && st.twitch)  twitEl.href = st.twitch;
  var discNm = document.getElementById('social-discord-name'); if(discNm) discNm.textContent = st.discord_name;
  var twitNm = document.getElementById('social-twitch-name');  if(twitNm) twitNm.textContent = st.twitch_name;
  closeModal(); toast('Liens mis à jour !','ok');
}
function applyC1(hex){if(!hex||!hex.match(/^#[0-9a-fA-F]{3,8}$/)){toast('Hex invalide','er');return;}document.documentElement.style.setProperty('--cy',hex);S.set('accent1',hex);closeModal();toast('Couleur cyan : '+hex,'ok');}
function applyC2(hex){if(!hex||!hex.match(/^#[0-9a-fA-F]{3,8}$/)){toast('Hex invalide','er');return;}document.documentElement.style.setProperty('--vb',hex);S.set('accent2',hex);closeModal();toast('Couleur violet : '+hex,'ok');}
function applyTheme(bg,bg2){document.documentElement.style.setProperty('--bg',bg);document.documentElement.style.setProperty('--bg2',bg2);S.set('theme',{bg:bg,bg2:bg2});closeModal();toast('Th\u00e8me appliqu\u00e9','ok');}
function saveParticles(){var v=parseInt(document.getElementById('pc-range').value);applyParticles(v);closeModal();toast('Particules : '+v,'ok');}
function saveRecrit(){['1','2','3','4'].forEach(function(n){document.getElementById('req'+n+'-t').textContent=document.getElementById('rc'+n+'t').value;document.getElementById('req'+n+'-d').textContent=document.getElementById('rc'+n+'d').value;});S.set('recrit',{t1:document.getElementById('rc1t').value,d1:document.getElementById('rc1d').value,t2:document.getElementById('rc2t').value,d2:document.getElementById('rc2d').value,t3:document.getElementById('rc3t').value,d3:document.getElementById('rc3d').value,t4:document.getElementById('rc4t').value,d4:document.getElementById('rc4d').value});closeModal();toast('Crit\u00e8res mis \u00e0 jour !','ok');}
function savePass(){var u=document.getElementById('np-u').value.trim(),p=document.getElementById('np-p').value,p2=document.getElementById('np-p2').value;if(!u||!p){toast('Champs requis','er');return;}if(p!==p2){toast('Mots de passe diff\u00e9rents','er');return;}S.set('creds',{u:u,p:p});closeModal();toast('Identifiants modifi\u00e9s \u2014 reconnecte-toi','in');setTimeout(doLogout,1500);}
function importConfig(){var f=document.getElementById('imp-file').files[0];if(!f){toast('S\u00e9lectionne un fichier','er');return;}var rd=new FileReader();rd.onload=function(e){try{var cfg=JSON.parse(e.target.result);Object.keys(cfg).forEach(function(k){if(cfg[k]!==null)S.set(k,cfg[k]);});closeModal();toast('Config import\u00e9e ! Rechargement...','ok');setTimeout(function(){location.reload();},1400);}catch(e){toast('Fichier JSON invalide','er');}};rd.readAsText(f);}
function doReset(){var keys=['cands','desc','soc','annonce','annonces_list','accent1','accent2','stats','title','slogan','herostats','tiktok','countdown','twitter','stream','recrit','roster_data','palm_data','theme','pcount','webhook_url'];keys.forEach(function(k){localStorage.removeItem('lhg_'+k);});closeModal();toast('R\u00e9initialis\u00e9','in');setTimeout(function(){location.reload();},1200);}