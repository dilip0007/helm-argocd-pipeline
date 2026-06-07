const express = require('express');
const fetch   = require('node-fetch');
const app     = express();
const port    = process.env.PORT || 3000;

// ── Backend service URLs (set via env vars in Kubernetes) ───────────────────
const FAMILY_URL   = process.env.FAMILY_SERVICE_URL   || 'http://family-service:3001';
const MESSAGES_URL = process.env.MESSAGES_SERVICE_URL || 'http://messages-service:3002';
const EVENTS_URL   = process.env.EVENTS_SERVICE_URL   || 'http://events-service:3003';

// ── Helper: safe fetch (returns null on error) ──────────────────────────────
async function safeFetch(url) {
  try {
    const res = await fetch(url, { timeout: 3000 });
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ── API proxy routes (useful for learning / debugging) ──────────────────────
app.get('/api/family',   async (req, res) => res.json(await safeFetch(`${FAMILY_URL}/api/members`)   || { error: 'family-service unavailable' }));
app.get('/api/messages', async (req, res) => res.json(await safeFetch(`${MESSAGES_URL}/api/messages/all`) || { error: 'messages-service unavailable' }));
app.get('/api/events',   async (req, res) => res.json(await safeFetch(`${EVENTS_URL}/api/events`)   || { error: 'events-service unavailable' }));

app.get('/api/health', async (req, res) => {
  const [family, messages, events] = await Promise.all([
    safeFetch(`${FAMILY_URL}/health`),
    safeFetch(`${MESSAGES_URL}/health`),
    safeFetch(`${EVENTS_URL}/health`)
  ]);
  res.json({
    gateway: { status: 'UP', service: 'api-gateway' },
    services: {
      'family-service':   family   || { status: 'DOWN' },
      'messages-service': messages || { status: 'DOWN' },
      'events-service':   events   || { status: 'DOWN' }
    }
  });
});

// ── Main dashboard (server-side render) ────────────────────────────────────
app.get('/', async (req, res) => {
  // Fetch all data in parallel
  const [familyData, messagesData, eventsData] = await Promise.all([
    safeFetch(`${FAMILY_URL}/api/members`),
    safeFetch(`${MESSAGES_URL}/api/messages/all`),
    safeFetch(`${EVENTS_URL}/api/events`)
  ]);

  const members  = familyData?.members   || [];
  const messages = messagesData?.messages || [];
  const events   = eventsData?.events    || [];
  const randomMsg = messages.length ? messages[Math.floor(Math.random() * messages.length)] : { text: '❤️ Love is always running', emoji: '❤️' };

  const memberCards = members.map(m => `
    <div class="member-card">
      <div class="member-avatar">${m.avatar}</div>
      <div class="member-emoji">${m.emoji}</div>
      <h3>${m.name}</h3>
      <p class="member-role">${m.role}</p>
      <p class="member-bio">${m.bio}</p>
      <div class="skills">
        ${m.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
      <p class="fun-fact">💡 ${m.funFact}</p>
    </div>
  `).join('');

  const eventItems = events.map(e => `
    <div class="event-item">
      <div class="event-icon">${e.icon}</div>
      <div class="event-body">
        <span class="event-date">${e.date}</span>
        <h4>${e.title}</h4>
        <p>${e.description}</p>
      </div>
    </div>
  `).join('');

  const allMessages = messages.slice(0, 6).map(m => `
    <div class="msg-bubble">
      <span class="msg-emoji">${m.emoji}</span>
      <span>${m.text}</span>
    </div>
  `).join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nigam Family — Microservices App</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --rose:   #ff477e;
      --violet: #8a2be2;
      --teal:   #00d4aa;
      --gold:   #ffd700;
      --bg:     #070b14;
      --card:   rgba(255,255,255,0.03);
      --border: rgba(255,255,255,0.07);
      --text:   #ffffff;
      --muted:  #a8b2d8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    /* ── Hero Header ── */
    .hero {
      text-align: center;
      padding: 60px 20px 40px;
      background: linear-gradient(180deg, rgba(138,43,226,0.15) 0%, transparent 100%);
      border-bottom: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(255,71,126,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-emoji { font-size: 4rem; display: block; margin-bottom: 16px; animation: pulse 2s infinite alternate; }
    @keyframes pulse { from { filter: drop-shadow(0 0 10px rgba(255,71,126,0.5)); } to { filter: drop-shadow(0 0 30px rgba(255,71,126,0.9)); } }
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: 2.8rem; font-style: italic;
      background: linear-gradient(135deg, #fff 30%, var(--rose) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .hero-subtitle { color: var(--muted); font-size: 1.1rem; }
    .hero-tagline {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 24px;
      border-radius: 50px;
      border: 1px solid rgba(255,71,126,0.3);
      background: rgba(255,71,126,0.08);
      color: var(--rose);
      font-size: 1rem;
      font-weight: 600;
    }

    /* ── Microservice Architecture Banner ── */
    .arch-banner {
      display: flex; align-items: center; justify-content: center;
      flex-wrap: wrap; gap: 8px;
      padding: 20px; background: rgba(0,0,0,0.3);
      border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--muted);
    }
    .arch-svc {
      padding: 6px 14px; border-radius: 20px;
      border: 1px solid var(--border); background: var(--card);
      color: var(--text); font-weight: 600;
    }
    .arch-svc.gateway { border-color: var(--rose); color: var(--rose); }
    .arch-svc.family  { border-color: var(--teal); color: var(--teal); }
    .arch-svc.msgs    { border-color: var(--violet); color: #c084fc; }
    .arch-svc.events  { border-color: var(--gold); color: var(--gold); }
    .arch-arrow { color: rgba(255,255,255,0.3); font-size: 1rem; }

    /* ── Sections ── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    .section { padding: 50px 0; border-bottom: 1px solid var(--border); }
    .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
    .section-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .badge-family  { background: rgba(0,212,170,0.15); color: var(--teal); border: 1px solid rgba(0,212,170,0.3); }
    .badge-msgs    { background: rgba(138,43,226,0.15); color: #c084fc; border: 1px solid rgba(138,43,226,0.3); }
    .badge-events  { background: rgba(255,215,0,0.1);  color: var(--gold); border: 1px solid rgba(255,215,0,0.3); }
    .section-header h2 { font-size: 1.8rem; }
    .section-source { font-size: 0.8rem; color: var(--muted); margin-left: auto; font-style: italic; }

    /* ── Member Cards ── */
    .members-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .member-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 20px; padding: 30px; text-align: center;
      transition: all 0.3s ease; position: relative; overflow: hidden;
    }
    .member-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--rose), var(--violet));
    }
    .member-card:hover { transform: translateY(-4px); border-color: rgba(255,71,126,0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .member-avatar { font-size: 3rem; margin-bottom: 8px; }
    .member-emoji { font-size: 1.5rem; margin-bottom: 12px; }
    .member-card h3 { font-size: 1.3rem; margin-bottom: 6px; }
    .member-role { color: var(--rose); font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; }
    .member-bio { color: var(--muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 16px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 16px; }
    .skill-tag {
      padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600;
      background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: var(--muted);
    }
    .fun-fact { font-size: 0.82rem; color: rgba(255,215,0,0.8); font-style: italic; }

    /* ── Love Message Banner ── */
    .love-banner {
      text-align: center; padding: 40px 20px;
      background: linear-gradient(135deg, rgba(255,71,126,0.08) 0%, rgba(138,43,226,0.08) 100%);
      border-radius: 20px; margin: 40px 0;
      border: 1px solid rgba(255,71,126,0.15);
    }
    .love-banner .quote { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.5rem; color: var(--rose); }
    .love-banner .source { color: var(--muted); font-size: 0.85rem; margin-top: 10px; }

    /* ── Messages Grid ── */
    .messages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .msg-bubble {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 16px; padding: 16px 20px;
      display: flex; align-items: flex-start; gap: 12px;
      font-size: 0.9rem; color: var(--muted); line-height: 1.5;
      transition: all 0.3s ease;
    }
    .msg-bubble:hover { border-color: rgba(138,43,226,0.3); color: var(--text); }
    .msg-emoji { font-size: 1.4rem; flex-shrink: 0; }

    /* ── Timeline ── */
    .timeline { position: relative; padding-left: 40px; }
    .timeline::before {
      content: ''; position: absolute; left: 14px; top: 0; bottom: 0;
      width: 2px; background: linear-gradient(180deg, var(--rose), var(--violet));
    }
    .event-item { display: flex; gap: 20px; margin-bottom: 30px; position: relative; }
    .event-item::before {
      content: ''; position: absolute; left: -33px; top: 6px;
      width: 12px; height: 12px; border-radius: 50%;
      background: var(--rose); border: 2px solid var(--bg);
    }
    .event-icon { font-size: 1.8rem; flex-shrink: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--card); border-radius: 12px; border: 1px solid var(--border); }
    .event-body { flex: 1; }
    .event-date { font-size: 0.8rem; color: var(--rose); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .event-body h4 { font-size: 1rem; margin: 4px 0; }
    .event-body p { font-size: 0.88rem; color: var(--muted); line-height: 1.5; }

    /* ── Service Health ── */
    .health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .health-card {
      background: var(--card); border: 1px solid rgba(0,212,170,0.2);
      border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 14px;
    }
    .health-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--teal); flex-shrink: 0; box-shadow: 0 0 8px var(--teal); animation: blink 2s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .health-name { font-weight: 700; font-size: 0.95rem; }
    .health-status { font-size: 0.8rem; color: var(--teal); }

    /* ── Footer ── */
    footer {
      text-align: center; padding: 40px 20px;
      color: rgba(255,255,255,0.25); font-size: 0.85rem;
      border-top: 1px solid var(--border); letter-spacing: 1px;
    }
    footer strong { color: rgba(255,255,255,0.5); }

    @media (max-width: 600px) {
      .hero h1 { font-size: 2rem; }
      .arch-banner { gap: 6px; font-size: 0.78rem; }
    }
  </style>
</head>
<body>

  <!-- Hero -->
  <div class="hero">
    <span class="hero-emoji">💖</span>
    <h1>The Nigam Family</h1>
    <p class="hero-subtitle">Dilip Kumar · Akanksha · Advik</p>
    <div class="hero-tagline">Microservices App — Built with Love & Kubernetes</div>
  </div>

  <!-- Architecture Banner -->
  <div class="arch-banner">
    <span style="color:var(--muted)">Architecture:</span>
    <span class="arch-svc gateway">🌐 api-gateway :3000</span>
    <span class="arch-arrow">→</span>
    <a href="/api/family" target="_blank" class="arch-svc family" style="text-decoration:none; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">👨‍👩‍👦 family-service :3001</a>
    <span class="arch-arrow">+</span>
    <a href="/api/messages" target="_blank" class="arch-svc msgs" style="text-decoration:none; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">💌 messages-service :3002</a>
    <span class="arch-arrow">+</span>
    <a href="/api/events" target="_blank" class="arch-svc events" style="text-decoration:none; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='none';">📅 events-service :3003</a>
  </div>

  <div class="container">

    <!-- Live Message Banner -->
    <div class="love-banner">
      <div class="quote">"${randomMsg.text}"</div>
      <div class="source">✨ Live from messages-service — refreshes on every request</div>
    </div>

    <!-- Family Members -->
    <section class="section">
      <div class="section-header">
        <span class="section-badge badge-family">family-service</span>
        <h2>Our Family 👨‍👩‍👦</h2>
        <span class="section-source">Source: GET /api/members</span>
      </div>
      <div class="members-grid">
        ${memberCards || '<p style="color:var(--muted)">family-service is starting up... 🔄</p>'}
      </div>
    </section>

    <!-- Family Events -->
    <section class="section">
      <div class="section-header">
        <span class="section-badge badge-events">events-service</span>
        <h2>Our Story 📅</h2>
        <span class="section-source">Source: GET /api/events</span>
      </div>
      <div class="timeline">
        ${eventItems || '<p style="color:var(--muted)">events-service is starting up... 🔄</p>'}
      </div>
    </section>

    <!-- Love Messages -->
    <section class="section">
      <div class="section-header">
        <span class="section-badge badge-msgs">messages-service</span>
        <h2>Love Messages 💌</h2>
        <span class="section-source">Source: GET /api/messages/all</span>
      </div>
      <div class="messages-grid">
        ${allMessages || '<p style="color:var(--muted)">messages-service is starting up... 🔄</p>'}
      </div>
    </section>

    <!-- Service Health -->
    <section class="section">
      <div class="section-header">
        <h2>🟢 All Services Running</h2>
      </div>
      <div class="health-grid">
        <div class="health-card"><div class="health-dot"></div><div><div class="health-name">🌐 api-gateway</div><div class="health-status">UP — serving dashboard</div></div></div>
        <div class="health-card"><div class="health-dot"></div><div><div class="health-name">👨‍👩‍👦 family-service</div><div class="health-status">UP — ${members.length} members loaded</div></div></div>
        <div class="health-card"><div class="health-dot"></div><div><div class="health-name">💌 messages-service</div><div class="health-status">UP — ${messages.length} messages loaded</div></div></div>
        <div class="health-card"><div class="health-dot"></div><div><div class="health-name">📅 events-service</div><div class="health-status">UP — ${events.length} events loaded</div></div></div>
      </div>
    </section>

  </div>

  <footer>
    DILIP KUMAR NIGAM &bull; AKANKSHA NIGAM &bull; ADVIK NIGAM<br>
    <strong>4 Microservices · Kubernetes · ArgoCD · Jenkins CI/CD · Built with ❤️</strong>
  </footer>

</body>
</html>`);
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🌐 api-gateway running on port ${port}`);
  console.log(`   → family-service   : ${FAMILY_URL}`);
  console.log(`   → messages-service : ${MESSAGES_URL}`);
  console.log(`   → events-service   : ${EVENTS_URL}`);
});
