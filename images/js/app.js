/* ═══════════════════════════════════════
   LHG — app.js | Utilitaires & Init
═══════════════════════════════════════ */

/* ══ INTRO / SPLASH SCREEN ══ */
(function() {
  var intro    = document.getElementById('intro');
  var barFill  = document.getElementById('intro-bar-fill');
  var barLabel = document.getElementById('intro-bar-label');
  if (!intro) return;

  /* Particules flottantes */
  var colors = ['#7c3aff','#22d3ee','#a855f7','#f59e0b'];
  for (var i = 0; i < 18; i++) {
    var sp   = document.createElement('div');
    sp.className = 'i-spark';
    var size = Math.random() * 4 + 2;
    sp.style.cssText =
      'width:'+size+'px;height:'+size+'px;' +
      'left:'+(Math.random()*100)+'%;' +
      'top:'+(40+Math.random()*40)+'%;' +
      'background:'+colors[Math.floor(Math.random()*colors.length)]+';' +
      'box-shadow:0 0 6px '+colors[Math.floor(Math.random()*colors.length)]+';' +
      'animation-duration:'+(1.5+Math.random()*2)+'s;' +
      'animation-delay:'+(Math.random()*2)+'s';
    intro.appendChild(sp);
  }

  /* Barre de progression */
  var labels    = ['INITIALISATION...','CHARGEMENT...','CONNEXION...','PRÊT'];
  var progress  = 0;
  var labelIdx  = 0;
  var duration  = 2400;
  var startTime = Date.now();

  function animBar() {
    var elapsed = Date.now() - startTime;
    progress = Math.min(elapsed / duration * 100, 100);
    barFill.style.width = progress + '%';
    if (progress >= 25 && labelIdx === 0) { barLabel.textContent = labels[1]; labelIdx = 1; }
    if (progress >= 60 && labelIdx === 1) { barLabel.textContent = labels[2]; labelIdx = 2; }
    if (progress >= 90 && labelIdx === 2) { barLabel.textContent = labels[3]; labelIdx = 3; }
    if (progress < 100) {
      requestAnimationFrame(animBar);
    } else {
      barLabel.textContent = '✦  BIENVENUE  ✦';
      setTimeout(hideIntro, 500);
    }
  }
  requestAnimationFrame(animBar);

  function hideIntro() {
    intro.classList.add('hide');
    setTimeout(function() {
      intro.style.display = 'none';
      document.body.style.overflow = '';
    }, 850);
  }

  document.body.style.overflow = 'hidden';
})();

/* ── STORAGE ── */
var S = {
  get: function(k, d) {
    try { var v = localStorage.getItem('lhg_' + k); return v !== null ? JSON.parse(v) : (d === undefined ? null : d); }
    catch(e) { return d === undefined ? null : d; }
  },
  set: function(k, v) {
    try { localStorage.setItem('lhg_' + k, JSON.stringify(v)); } catch(e) {}
  }
};

/* ══ CURSEUR PERSONNALISÉ ══ */
(function() {
  /* Crée l'élément curseur */
  var cur = document.createElement('div');
  cur.id = 'custom-cursor';
  cur.style.cssText = [
    'position:fixed',
    'top:0','left:0',
    'width:32px','height:32px',
    'pointer-events:none',
    'z-index:999999',
    'transform:translate(-50%,-50%)',
    'background-image:url(images/cursor.png)',
    'background-size:contain',
    'background-repeat:no-repeat',
    'background-position:center',
    'transition:transform .1s ease',
    'will-change:transform'
  ].join(';');
  document.body.appendChild(cur);

  /* Cache le curseur natif partout */
  var style = document.createElement('style');
  style.textContent = '*, *::before, *::after { cursor: none !important; }';
  document.head.appendChild(style);

  /* Suit la souris */
  var mx = -100, my = -100;
  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  /* Légèrement plus petit au clic */
  document.addEventListener('mousedown', function() { cur.style.transform = 'translate(-50%,-50%) scale(.8)'; });
  document.addEventListener('mouseup',   function() { cur.style.transform = 'translate(-50%,-50%) scale(1)'; });

  /* Cache quand la souris quitte la fenêtre */
  document.addEventListener('mouseleave', function() { cur.style.opacity = '0'; });
  document.addEventListener('mouseenter', function() { cur.style.opacity = '1'; });
})();


function toast(msg, type) {
  type = type || 'in';
  var w = document.getElementById('toast');
  var el = document.createElement('div');
  el.className = 'ti ' + type;
  el.textContent = msg;
  w.appendChild(el);
  setTimeout(function() {
    el.style.opacity = '0'; el.style.transform = 'translateX(12px)'; el.style.transition = 'all .3s';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }, 3200);
}

/* ── PARTICULES ── */
var CNV = document.getElementById('ptc');
var CTX = CNV.getContext('2d');
var PTC_COUNT = S.get('pcount', 55);
var PTS = [];

function resizeCanvas() { CNV.width = window.innerWidth; CNV.height = window.innerHeight; }
function mkPt() {
  return {
    x: Math.random() * CNV.width, y: Math.random() * CNV.height,
    vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
    sz: Math.random() * 1.4 + .4,
    col: ['#7c3aff','#22d3ee','#a855f7','#f59e0b'][Math.floor(Math.random() * 4)]
  };
}
function initParticles(n) {
  PTC_COUNT = n; PTS = [];
  for (var i = 0; i < n; i++) PTS.push(mkPt());
}
function applyParticles(n) { S.set('pcount', n); initParticles(n); }

(function animParticles() {
  CTX.clearRect(0, 0, CNV.width, CNV.height);
  PTS.forEach(function(p) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = CNV.width; if (p.x > CNV.width) p.x = 0;
    if (p.y < 0) p.y = CNV.height; if (p.y > CNV.height) p.y = 0;
    CTX.beginPath(); CTX.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
    CTX.fillStyle = p.col; CTX.fill();
  });
  PTS.forEach(function(a, i) {
    PTS.slice(i + 1).forEach(function(b) {
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 110) {
        CTX.beginPath(); CTX.moveTo(a.x, a.y); CTX.lineTo(b.x, b.y);
        CTX.strokeStyle = 'rgba(124,58,255,' + ((1 - d / 110) * .12) + ')';
        CTX.lineWidth = .5; CTX.stroke();
      }
    });
  });
  requestAnimationFrame(animParticles);
})();

/* ── RING DOTS LOGO ── */
(function() {
  var rdots = document.getElementById('rdots');
  if (!rdots) return;
  [{a:0,c:'c'},{a:60,c:'v'},{a:120,c:'g'},{a:180,c:'c'},{a:240,c:'v'},{a:300,c:'g'}].forEach(function(d) {
    var el = document.createElement('div'); el.className = 'rd ' + d.c;
    var r = d.a * Math.PI / 180;
    el.style.left = (180 + 90 * Math.cos(r) - 3.5) + 'px';
    el.style.top  = (180 + 90 * Math.sin(r) - 3.5) + 'px';
    rdots.appendChild(el);
  });
})();

/* ── SCROLL ANIM ── */
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(x) {
    if (x.isIntersecting) { x.target.style.opacity = '1'; x.target.style.transform = 'translateY(0)'; }
  });
}, { threshold: .08 });
document.querySelectorAll('.pi, .cc, .rr').forEach(function(el) {
  el.style.opacity = '0'; el.style.transform = 'translateY(22px)'; el.style.transition = 'opacity .5s ease, transform .5s ease';
  obs.observe(el);
});

/* ── NAV SCROLL ── */
window.addEventListener('scroll', function() {
  document.querySelector('nav').style.background = window.scrollY > 50 ? 'rgba(7,5,15,.97)' : 'rgba(7,5,15,.92)';
});

/* ── ANNONCE ── */
document.getElementById('ann-close').onclick = function() { document.getElementById('ann').style.display = 'none'; };

/* ── CANDIDATURE FORM ── */
document.getElementById('cand-submit').onclick = function() {
  var p = document.getElementById('cf-p').value.trim();
  var d = document.getElementById('cf-d').value.trim();
  if (!p || !d) { toast('Pseudo et Discord requis', 'er'); return; }
  var cand = {
    id: Date.now(), p: p, d: d,
    a: document.getElementById('cf-a').value.trim(),
    k: document.getElementById('cf-k').value.trim(),
    h: document.getElementById('cf-h').value.trim(),
    b: document.getElementById('cf-b').value.trim(),
    date: new Date().toLocaleDateString('fr-FR'), st: 'new', wh_sent: false, wh_msg_id: null
  };
  var cands = S.get('cands', []);
  cands.unshift(cand);
  S.set('cands', cands);
  var sv = S.get('stats', {v:0,c:0}); sv.c = (sv.c || 0) + 1; S.set('stats', sv);
  document.getElementById('cand-form').style.display = 'none';
  document.getElementById('cand-ok').style.display = 'block';
  toast('Candidature envoyée !', 'ok');
  // Envoi webhook Discord automatique + sauvegarde de l'ID du message
  if (typeof sendWebhook === 'function') {
    sendWebhook(cand).then(function(msgId) {
      if (msgId) {
        var c2 = S.get('cands', []);
        var i  = c2.findIndex(function(x){ return x.id === cand.id; });
        if (i >= 0) {
          c2[i].wh_sent   = true;
          c2[i].wh_msg_id = (typeof msgId === 'string') ? msgId : null;
          S.set('cands', c2);
        }
      }
    });
  }
};

/* ── DISCORD WIDGET — Membres en ligne ── */
var DISCORD_SERVER_ID = '1363148994053804062';

function fetchDiscordMembers() {
  var el = document.getElementById('discord-count');
  if (!el) return;

  // Animation de chargement
  el.textContent = '...';
  el.style.fontSize = '16px';

  fetch('https://discord.com/api/guilds/' + DISCORD_SERVER_ID + '/widget.json')
    .then(function(res) {
      if (!res.ok) throw new Error('Widget désactivé ou erreur');
      return res.json();
    })
    .then(function(data) {
      // Le widget retourne presence_count (membres en ligne)
      var count = data.presence_count || 0;
      el.style.fontSize = '';
      // Animation compteur
      animateCount(el, 0, count, 1200);
      // Mettre à jour le label
      var lbl = document.getElementById('hs1l');
      if (lbl) lbl.textContent = 'En ligne maintenant';
      // Relancer toutes les 60 secondes
      setTimeout(fetchDiscordMembers, 60000);
    })
    .catch(function() {
      // Widget pas encore activé — affiche un fallback propre
      el.style.fontSize = '';
      el.textContent = '—';
      var lbl = document.getElementById('hs1l');
      if (lbl) lbl.textContent = 'Membres Discord';
      // Réessayer dans 30 secondes
      setTimeout(fetchDiscordMembers, 30000);
    });
}

/* Animation compteur (0 → nombre final) */
function animateCount(el, from, to, duration) {
  var start = Date.now();
  var diff = to - from;
  (function step() {
    var elapsed = Date.now() - start;
    var progress = Math.min(elapsed / duration, 1);
    // Easing ease-out
    var ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = to;
  })();
}

/* ── COUNTDOWN ── */
function startCountdown(cd) {
  if (!cd || !cd.active) return;
  document.getElementById('cd-wrap').style.display = 'block';
  document.getElementById('cd-lbl').textContent = '⏱ ' + cd.label;
  var target = new Date(cd.date).getTime();
  (function tick() {
    var diff = target - Date.now();
    if (diff <= 0) { ['cd-d','cd-h','cd-m','cd-s'].forEach(function(id){ document.getElementById(id).textContent='00'; }); return; }
    document.getElementById('cd-d').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(Math.floor(diff % 86400000 / 3600000)).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(Math.floor(diff % 3600000 / 60000)).padStart(2, '0');
    document.getElementById('cd-s').textContent = String(Math.floor(diff % 60000 / 1000)).padStart(2, '0');
    setTimeout(tick, 1000);
  })();
}

/* ── LOAD SAVED DATA ── */
function loadSaved() {
  var desc = S.get('desc', null); if (desc) document.getElementById('hero-desc').textContent = desc;
  var so = S.get('soc', null);
  if (so) { document.getElementById('lk-d').textContent = so.d; document.getElementById('lk-i').textContent = so.i; document.getElementById('lk-e').textContent = so.e; }
  var ann = S.get('annonce', '');
  if (ann) { document.getElementById('ann-txt').textContent = ann; document.getElementById('ann').style.display = 'block'; }
  var a1 = S.get('accent1', null); if (a1) document.documentElement.style.setProperty('--cy', a1);
  var a2 = S.get('accent2', null); if (a2) document.documentElement.style.setProperty('--vb', a2);
  var th = S.get('theme', null);
  if (th) { document.documentElement.style.setProperty('--bg', th.bg); document.documentElement.style.setProperty('--bg2', th.bg2); }
  var hs = S.get('herostats', null);
  if (hs) { ['1','2','3'].forEach(function(n){ document.getElementById('hs'+n+'n').textContent = hs['n'+n]; document.getElementById('hs'+n+'l').textContent = hs['l'+n]; }); }
  var tk = S.get('tiktok', null);
  if (tk) { document.getElementById('tt-link').href = tk.url; document.getElementById('tt-name').textContent = tk.name; document.getElementById('tt-desc').textContent = tk.desc; }
  var sl = S.get('slogan', null); if (sl) document.getElementById('hero-slogan').textContent = sl;
  var ti = S.get('title', null); if (ti) document.title = ti;
  var tw = S.get('twitter', null); if (tw) document.getElementById('lk-tw').href = tw;
  var st = S.get('stream', null);
  if (st) {
    document.getElementById('lk-yt').href = st.yt || '#';
    /* Bannières sociales */
    var discEl = document.getElementById('social-discord');
    var twitEl = document.getElementById('social-twitch');
    var discNm = document.getElementById('social-discord-name');
    var twitNm = document.getElementById('social-twitch-name');
    if (discEl && st.discord) discEl.href = st.discord;
    if (twitEl && st.twitch)  twitEl.href = st.twitch;
    if (discNm && st.discord_name) discNm.textContent = st.discord_name;
    if (twitNm && st.twitch_name)  twitNm.textContent = st.twitch_name;
  }
  var rc = S.get('recrit', null);
  if (rc) { ['1','2','3','4'].forEach(function(n){ if(rc['t'+n]) document.getElementById('req'+n+'-t').textContent=rc['t'+n]; if(rc['d'+n]) document.getElementById('req'+n+'-d').textContent=rc['d'+n]; }); }
  var cd = S.get('countdown', null); if (cd && cd.active) startCountdown(cd);
  var sv = S.get('stats', {v:0,c:0}); sv.v = (sv.v || 0) + 2; S.set('stats', sv);
}

/* ── INIT ── */
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initParticles(PTC_COUNT);
loadSaved();
checkSession();
fetchDiscordMembers();