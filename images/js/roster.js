/* LHG — roster.js v5.0 | Flip Cards + 2 Teams */

/* ══ DONNÉES PAR DÉFAUT ══
   photo    : URL image (Imgur, Discord CDN...)
   role     : Rôle ingame
   wins     : Victoires / Top 1
   hours    : Heures de jeu approximatives
   platform : PC / PS5 / Xbox
   twitch   : URL Twitch (optionnel)
   youtube  : URL YouTube (optionnel)
   kd       : K/D ratio
   team     : 1 ou 2
*/
var DEFAULT_ROSTER = [
  { id:1, team:1, flag:'🇫🇷', ini:'IGL', role:'Capitaine · IGL', name:'LHG Berloque', real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' },
  { id:2, team:1, flag:'🇫🇷', ini:'FR',  role:'Fragger',         name:'LHG Flynners', real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' },
  { id:3, team:1, flag:'🇫🇷', ini:'SP',  role:'Support',          name:'LHG Eryo',     real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' },
  { id:4, team:2, flag:'🇫🇷', ini:'SN',  role:'Sniper',           name:'LHG Avada',    real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' },
  { id:5, team:2, flag:'🇫🇷', ini:'SN',  role:'Sniper',           name:'LHG Se7en',    real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' },
  { id:6, team:2, flag:'🇫🇷', ini:'SN',  role:'Sniper',           name:'LHG Klaarq',   real:'',     kd:'—',   wins:'—',  hours:'—',   platform:'PC',  twitch:'', youtube:'' }
];

function getRoster() {
  var data = S.get('roster_data', null);
  /* Si pas de données ou ancien format sans champ team → reset vers défaut */
  if (!data || !data.length || data[0].team === undefined) {
    S.set('roster_data', DEFAULT_ROSTER);
    return DEFAULT_ROSTER;
  }
  return data;
}
function saveRoster(r)  { S.set('roster_data', r); }

/* SVG silhouette placeholder */
var SIL_SVG = '<svg class="rcard-sil-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="65" rx="38" ry="42" fill="currentColor"/><path d="M30 280 Q30 160 100 155 Q170 160 170 280Z" fill="currentColor"/></svg>';

/* ══ RENDU CARTES FLIP PUBLIC ══ */
function renderRosterDOM() {
  var roster = getRoster();
  var t1 = roster.filter(function(p){ return p.team !== 2; });
  var t2 = roster.filter(function(p){ return p.team === 2; });

  renderTeamGrid('team-1-grid', t1, 1);
  renderTeamGrid('team-2-grid', t2, 2);

  /* Noms équipes perso */
  var names = S.get('team_names', {t1:'LHG Requiem', t2:'LHG BETA'});
  var n1 = document.getElementById('team-1-name');
  var n2 = document.getElementById('team-2-name');
  if (n1) n1.textContent = names.t1 || 'LHG Requiem';
  if (n2) n2.textContent = names.t2 || 'LHG BETA';

  /* Masquer un bloc si vide */
  var b1 = document.getElementById('team-1-block');
  var b2 = document.getElementById('team-2-block');
  if (b1) b1.style.display = t1.length ? '' : 'none';
  if (b2) b2.style.display = t2.length ? '' : 'none';
}

function renderTeamGrid(gridId, players, teamNum) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';

  players.forEach(function(p, idx) {
    var wrap = document.createElement('div');
    wrap.className = 'rcard-wrap';
    wrap.setAttribute('data-id', p.id);

    /* Face photo ou silhouette */
    var photoFront = p.photo
      ? '<img src="' + p.photo + '" alt="' + p.name + '" onerror="this.parentNode.innerHTML=\'' + SIL_SVG.replace(/'/g,"\\'") + '\'">'
      : SIL_SVG;

    /* Face arrière — avatar miniature */
    var avaBack = p.photo
      ? '<img src="' + p.photo + '" alt="' + p.name + '">'
      : (p.ini || '?');

    /* Liens sociaux */
    var socials = '';
    if (p.twitch)  socials += '<a href="' + p.twitch  + '" target="_blank" class="rcard-social-btn twitch"><svg viewBox="0 0 24 24" width="12" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg> TWITCH</a>';
    if (p.youtube) socials += '<a href="' + p.youtube + '" target="_blank" class="rcard-social-btn youtube"><svg viewBox="0 0 24 24" width="12" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> YOUTUBE</a>';

    /* Plateforme icône */
    var platIco = p.platform === 'PC' ? '🖥️' : p.platform === 'PS5' ? '🎮' : p.platform === 'Xbox' ? '🕹️' : '🎮';

    wrap.innerHTML =
      '<div class="rcard-inner">'
        /* ── FACE AVANT ── */
        +'<div class="rcard-front">'
          +'<div class="rcard-num">#' + String(idx+1).padStart(2,'0') + '</div>'
          +'<div class="rcard-flag">' + (p.flag||'🇫🇷') + '</div>'
          +'<div class="rcard-photo">' + photoFront + '</div>'
          +'<div class="rcard-info">'
            +'<div class="rcard-role">' + (p.role||'') + '</div>'
            +'<div class="rcard-name">' + (p.name||'') + '</div>'
            +'<div class="rcard-real">' + (p.real||'') + '</div>'
            +'<div class="rcard-kd-row">'
              +'<div><div class="rcard-kd-lbl">K/D RATIO</div><div class="rcard-kd-val">' + (p.kd||'—') + '</div></div>'
              +'<div class="rcard-hint">↺ VOIR STATS</div>'
            +'</div>'
          +'</div>'
        +'</div>'
        /* ── FACE ARRIÈRE ── */
        +'<div class="rcard-back">'
          +'<div class="rcard-back-header">'
            +'<div class="rcard-back-ava">' + avaBack + '</div>'
            +'<div><div class="rcard-back-nm">' + (p.name||'') + '</div><div class="rcard-back-role">' + (p.role||'') + '</div></div>'
          +'</div>'
          +'<div class="rcard-stats">'
            +'<div class="rcard-stat"><span class="rcard-stat-lbl"><span class="rcard-stat-ico">🏆</span>WINS / TOP 1</span><span class="rcard-stat-val gold">' + (p.wins||'—') + '</span></div>'
            +'<div class="rcard-stat"><span class="rcard-stat-lbl"><span class="rcard-stat-ico">📊</span>K/D RATIO</span><span class="rcard-stat-val gold">' + (p.kd||'—') + '</span></div>'
            +'<div class="rcard-stat"><span class="rcard-stat-lbl"><span class="rcard-stat-ico">⏱️</span>HEURES DE JEU</span><span class="rcard-stat-val">' + (p.hours||'—') + '</span></div>'
            +'<div class="rcard-stat"><span class="rcard-stat-lbl"><span class="rcard-stat-ico">' + platIco + '</span>PLATEFORME</span><span class="rcard-stat-val green">' + (p.platform||'PC') + '</span></div>'
          +'</div>'
          +(socials ? '<div class="rcard-socials">' + socials + '</div>' : '')
          +'<button class="rcard-back-close" onclick="event.stopPropagation()">↺ RETOURNER</button>'
        +'</div>'
      +'</div>';

    /* Flip au clic */
    wrap.addEventListener('click', function(e) {
      if (e.target.closest('a')) return; // ne pas flip si clic sur un lien
      this.classList.toggle('flipped');
    });
    /* Bouton retour */
    var closeBtn = wrap.querySelector('.rcard-back-close');
    if (closeBtn) closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      wrap.classList.remove('flipped');
    });

    grid.appendChild(wrap);
  });

  /* Animation entrée */
  grid.querySelectorAll('.rcard-wrap').forEach(function(el, i) {
    el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    setTimeout(function() { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 80 + i * 100);
  });
}

/* ══ TABLEAU ADMIN ══ */
function renderRosterTbl() {
  var wrap = document.getElementById('roster-tbl'); if (!wrap) return;
  var roster = getRoster();
  var bdg = document.getElementById('roster-bdg');
  if (bdg) bdg.textContent = roster.length + ' joueur' + (roster.length > 1 ? 's' : '');
  if (!roster.length) { wrap.innerHTML = '<div class="empty"><span>👥</span>AUCUN JOUEUR</div>'; return; }
  var h = '<table class="tbl"><thead><tr><th>EQ</th><th>FLAG</th><th>PSEUDO</th><th>RÔLE</th><th>K/D</th><th>WINS</th><th>PLATFORM</th><th>ACTIONS</th></tr></thead><tbody>';
  roster.forEach(function(p) {
    h += '<tr>'
      +'<td><span style="font-family:\'Orbitron\',monospace;font-size:10px;color:' + (p.team===2?'var(--vb)':'var(--cy)') + '">T' + (p.team||1) + '</span></td>'
      +'<td>' + (p.flag||'🇫🇷') + '</td>'
      +'<td><strong>' + p.name + '</strong></td>'
      +'<td style="color:var(--vb);font-size:11px">' + p.role + '</td>'
      +'<td style="font-family:\'Orbitron\',monospace;color:var(--go)">' + (p.kd||'—') + '</td>'
      +'<td style="color:#4ade80">' + (p.wins||'—') + '</td>'
      +'<td style="color:var(--dm);font-size:11px">' + (p.platform||'PC') + '</td>'
      +'<td>'
        +'<button class="tb ed" onclick="editPlayer(' + p.id + ')">✏️</button>'
        +'<button class="tb dl" onclick="deletePlayer(' + p.id + ')">🗑</button>'
      +'</td>'
    +'</tr>';
  });
  wrap.innerHTML = h + '</tbody></table>';
}

function editPlayer(id) {
  var p = getRoster().find(function(x){ return x.id === id; }); if (!p) return;
  document.getElementById('modal-title').textContent = 'ÉDITER — ' + p.name;
  document.getElementById('modal-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div class="mfg"><label class="mfl">Pseudo</label><input class="mfi" id="ep-name" value="'+p.name+'"></div>'
    +'<div class="mfg"><label class="mfl">Prénom Nom</label><input class="mfi" id="ep-real" value="'+(p.real||'')+'"></div>'
    +'<div class="mfg"><label class="mfl">Rôle</label><input class="mfi" id="ep-role" value="'+p.role+'"></div>'
    +'<div class="mfg"><label class="mfl">Initiales</label><input class="mfi" id="ep-ini" value="'+p.ini+'" maxlength="3"></div>'
    +'<div class="mfg"><label class="mfl">K/D</label><input class="mfi" id="ep-kd" value="'+(p.kd||'')+'"></div>'
    +'<div class="mfg"><label class="mfl">🏆 Wins / Top 1</label><input class="mfi" id="ep-wins" value="'+(p.wins||'')+'"></div>'
    +'<div class="mfg"><label class="mfl">⏱ Heures de jeu</label><input class="mfi" id="ep-hours" value="'+(p.hours||'')+'" placeholder="ex: 2500h"></div>'
    +'<div class="mfg"><label class="mfl">🖥 Plateforme</label><select class="mfsel" id="ep-plat"><option'+(p.platform==='PC'?' selected':'')+'>PC</option><option'+(p.platform==='PS5'?' selected':'')+'>PS5</option><option'+(p.platform==='Xbox'?' selected':'')+'>Xbox</option></select></div>'
    +'<div class="mfg"><label class="mfl">Équipe</label><select class="mfsel" id="ep-team"><option value="1"'+(p.team!==2?' selected':'')+'>Équipe 1</option><option value="2"'+(p.team===2?' selected':'')+'>Équipe 2</option></select></div>'
    +'<div class="mfg"><label class="mfl">Drapeau emoji</label><input class="mfi" id="ep-flag" value="'+(p.flag||'🇫🇷')+'"></div>'
    +'</div>'
    +'<div class="mfg" style="margin-top:6px"><label class="mfl">📸 URL Photo</label><input class="mfi" id="ep-photo" value="'+(p.photo||'')+'" placeholder="https://i.imgur.com/xxxxx.png"></div>'
    +'<div class="mfg"><label class="mfl">🟣 Twitch</label><input class="mfi" id="ep-twitch" value="'+(p.twitch||'')+'" placeholder="https://twitch.tv/pseudo"></div>'
    +'<div class="mfg"><label class="mfl">🔴 YouTube</label><input class="mfi" id="ep-youtube" value="'+(p.youtube||'')+'" placeholder="https://youtube.com/@pseudo"></div>'
    +(p.photo ? '<div style="margin-bottom:10px;text-align:center"><img src="'+p.photo+'" style="height:70px;border:1px solid var(--br)" onerror="this.style.display=\'none\'"></div>' : '')
    +'<div style="display:flex;gap:10px;margin-top:8px">'
      +'<button class="msv" onclick="saveEditPlayer('+id+')">💾 SAUVEGARDER →</button>'
      +'<button class="msv msv-r" onclick="deletePlayer('+id+');closeModal()">🗑 SUPPRIMER</button>'
    +'</div>';
  document.getElementById('ap-mod').classList.add('on');
}

function saveEditPlayer(id) {
  var roster = getRoster();
  var i = roster.findIndex(function(x){ return x.id === id; }); if (i < 0) return;
  roster[i] = {
    id:       id,
    name:     document.getElementById('ep-name').value.trim(),
    real:     document.getElementById('ep-real').value.trim(),
    role:     document.getElementById('ep-role').value.trim(),
    ini:      document.getElementById('ep-ini').value.trim().toUpperCase(),
    kd:       document.getElementById('ep-kd').value.trim() || '—',
    wins:     document.getElementById('ep-wins').value.trim() || '—',
    hours:    document.getElementById('ep-hours').value.trim() || '—',
    platform: document.getElementById('ep-plat').value,
    team:     parseInt(document.getElementById('ep-team').value) || 1,
    flag:     document.getElementById('ep-flag').value.trim() || '🇫🇷',
    photo:    document.getElementById('ep-photo').value.trim() || '',
    twitch:   document.getElementById('ep-twitch').value.trim() || '',
    youtube:  document.getElementById('ep-youtube').value.trim() || ''
  };
  saveRoster(roster);
  renderRosterDOM(); renderRosterTbl();
  if (typeof renderStats === 'function') renderStats();
  closeModal(); toast('Joueur mis à jour ✓', 'ok');
}

function deletePlayer(id) {
  if (!confirm('Supprimer ce joueur ?')) return;
  saveRoster(getRoster().filter(function(p){ return p.id !== id; }));
  renderRosterDOM(); renderRosterTbl();
  if (typeof renderStats === 'function') renderStats();
  toast('Joueur supprimé', 'in');
}

function addPlayer() {
  var name = document.getElementById('np-name').value.trim();
  if (!name) { toast('Pseudo requis', 'er'); return; }
  var roster = getRoster();
  roster.push({
    id:       Date.now(),
    name:     name,
    real:     document.getElementById('np-real').value.trim(),
    role:     document.getElementById('np-role').value.trim(),
    ini:      (document.getElementById('np-ini').value.trim() || '??').toUpperCase(),
    kd:       document.getElementById('np-kd').value.trim() || '—',
    wins:     document.getElementById('np-wins') ? document.getElementById('np-wins').value.trim() || '—' : '—',
    hours:    document.getElementById('np-hours') ? document.getElementById('np-hours').value.trim() || '—' : '—',
    platform: document.getElementById('np-plat') ? document.getElementById('np-plat').value : 'PC',
    team:     document.getElementById('np-team') ? parseInt(document.getElementById('np-team').value) || 1 : 1,
    flag:     document.getElementById('np-flag').value.trim() || '🇫🇷',
    photo:    document.getElementById('np-photo') ? document.getElementById('np-photo').value.trim() : '',
    twitch:   document.getElementById('np-twitch') ? document.getElementById('np-twitch').value.trim() : '',
    youtube:  document.getElementById('np-youtube') ? document.getElementById('np-youtube').value.trim() : ''
  });
  saveRoster(roster);
  renderRosterDOM(); renderRosterTbl();
  if (typeof renderStats === 'function') renderStats();
  closeModal(); toast('Joueur ' + name + ' ajouté !', 'ok');
}

/* ══ PALMARÈS ══ */
function getPalmData()   { return S.get('palm_data', []); }
function savePalmData(d) { S.set('palm_data', d); }

function renderPalmDOM() {
  var list = document.getElementById('palm-list'); if (!list) return;
  var data = getPalmData();
  if (!data.length) { list.innerHTML = '<p style="color:var(--dm);font-family:\'Share Tech Mono\',monospace;font-size:12px">AUCUN RÉSULTAT ENREGISTRÉ</p>'; return; }
  list.innerHTML = data.map(function(r) {
    var cls = r.p==='1ST'?'p1':r.p==='2ND'?'p2':r.p==='3RD'?'p3':'px';
    return '<div class="pi '+cls+'">'
      +'<div class="pp">'+r.p+'</div>'
      +'<div class="pdet"><div class="pn">'+r.n+'</div><div class="pm">'+r.m+'</div></div>'
      +(r.b?'<div class="pb">'+r.b+'</div>':'')
      +'</div>';
  }).join('');
}

function renderPalmTbl() {
  var wrap = document.getElementById('palm-tbl'); if (!wrap) return;
  var data = getPalmData();
  var bdg = document.getElementById('palm-bdg');
  if (bdg) bdg.textContent = data.length + ' résultat' + (data.length > 1 ? 's' : '');
  if (!data.length) { wrap.innerHTML = '<div class="empty"><span>🏆</span>AUCUN RÉSULTAT</div>'; return; }
  var h = '<table class="tbl"><thead><tr><th>PLACE</th><th>TOURNOI</th><th>DÉTAILS</th><th>BADGE</th><th>ACTION</th></tr></thead><tbody>';
  data.forEach(function(r, i) {
    h += '<tr><td style="font-family:\'Orbitron\',monospace;color:var(--go)">'+r.p+'</td><td><strong>'+r.n+'</strong></td><td style="color:var(--dm);font-size:11px">'+r.m+'</td><td>'+(r.b||'')+'</td><td><button class="tb dl" onclick="deletePalm('+i+')">🗑</button></td></tr>';
  });
  wrap.innerHTML = h + '</tbody></table>';
}

function addPalm() {
  var n=document.getElementById('np-pn').value.trim(); if(!n){toast('Nom requis','er');return;}
  var data=getPalmData();
  data.push({n:n, p:document.getElementById('np-pp').value, m:document.getElementById('np-pm').value.trim(), b:document.getElementById('np-pb').value.trim()});
  savePalmData(data); renderPalmDOM(); renderPalmTbl();
  if (typeof renderStats === 'function') renderStats();
  closeModal(); toast('Résultat ajouté !','ok');
}

function deletePalm(i) {
  if(!confirm('Supprimer ce résultat ?')) return;
  var data=getPalmData(); data.splice(i,1); savePalmData(data);
  renderPalmDOM(); renderPalmTbl();
  if (typeof renderStats === 'function') renderStats();
  toast('Supprimé','in');
}