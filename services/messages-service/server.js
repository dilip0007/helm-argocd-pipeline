const express = require('express');
const app = express();
const port = process.env.PORT || 3002;

// ── Love messages ───────────────────────────────────────────────────────────
const messages = [
  { id: 1, to: 'family',    text: 'Our love runs in an infinite loop ♾️',                          emoji: '♾️' },
  { id: 2, to: 'advik',     text: "Advik's laughter is our sunshine ☀️",                           emoji: '☀️' },
  { id: 3, to: 'akanksha',  text: "Akanksha's love is our foundation 🌸",                          emoji: '🌸' },
  { id: 4, to: 'dilip',     text: "Dilip's vision leads our way 🚀",                               emoji: '🚀' },
  { id: 5, to: 'family',    text: 'A GitOps Pipeline built with true love ❤️',                     emoji: '❤️' },
  { id: 6, to: 'akanksha',  text: 'You are the master node of my heart, Akanksha ☸️',             emoji: '☸️' },
  { id: 7, to: 'advik',     text: "Advik is the most beautiful deployment we've ever made 🌟",    emoji: '🌟' },
  { id: 8, to: 'family',    text: 'Scaling our happiness together, infinitely 📈',                 emoji: '📈' },
  { id: 9, to: 'akanksha',  text: 'My love for Akanksha comes with a 100% uptime guarantee ⏱️',  emoji: '⏱️' },
  { id: 10, to: 'family',   text: 'Dilip, Akanksha & Advik: A perfectly orchestrated cluster 👨‍👩‍👦', emoji: '👨‍👩‍👦' },
  { id: 11, to: 'family',   text: 'Provisioning a lifetime of joy together 🌍',                    emoji: '🌍' },
  { id: 12, to: 'advik',    text: "Advik's smile instantly resolves all my error codes ✨",        emoji: '✨' },
  { id: 13, to: 'akanksha', text: 'Every heartbeat is a successful ping to your soul 💓',         emoji: '💓' },
  { id: 14, to: 'family',   text: 'Continuous Integration of love, joy, and family 🔄',            emoji: '🔄' },
  { id: 15, to: 'family',   text: 'Our family state is safely stored in the backend of my heart 🔒', emoji: '🔒' }
];

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'messages-service', timestamp: new Date().toISOString() });
});

app.get('/api/messages/all', (req, res) => {
  res.json({ service: 'messages-service', count: messages.length, messages });
});

app.get('/api/messages/random', (req, res) => {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  res.json({ service: 'messages-service', message: msg });
});

app.get('/api/messages/to/:recipient', (req, res) => {
  const filtered = messages.filter(m => m.to === req.params.recipient);
  res.json({ service: 'messages-service', count: filtered.length, messages: filtered });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`💌 messages-service running on port ${port}`);
});
