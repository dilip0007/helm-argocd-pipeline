const express = require('express');
const app = express();
const port = process.env.PORT || 3003;

// ── Family timeline events ──────────────────────────────────────────────────
const events = [
  {
    id: 1,
    date: '2019',
    title: 'Dilip & Akanksha Got Married 💒',
    description: 'Two hearts merged into one perfect cluster.',
    type: 'milestone',
    icon: '💍'
  },
  {
    id: 2,
    date: '2022',
    title: 'Advik Nigam Joined the Cluster 👶',
    description: 'The most joyful pod was successfully scheduled. Healthy and running!',
    type: 'milestone',
    icon: '🍼'
  },
  {
    id: 3,
    date: '2024',
    title: 'First Steps — Advik Walking! 👟',
    description: 'Our little one began rolling out new features — first steps!',
    type: 'milestone',
    icon: '👣'
  },
  {
    id: 4,
    date: '2025',
    title: 'Dilip Started the GitOps Journey 🚀',
    description: 'Learning Kubernetes, Jenkins, and ArgoCD to build better pipelines.',
    type: 'tech',
    icon: '☸️'
  },
  {
    id: 5,
    date: 'Jun 2026',
    title: 'Family Microservices App Deployed! 🎉',
    description: 'This very app went live — 4 microservices, deployed with ArgoCD, built with love.',
    type: 'tech',
    icon: '🚀'
  }
];

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'events-service', timestamp: new Date().toISOString() });
});

app.get('/api/events', (req, res) => {
  res.json({ service: 'events-service', count: events.length, events });
});

app.get('/api/events/:type', (req, res) => {
  const filtered = events.filter(e => e.type === req.params.type);
  res.json({ service: 'events-service', count: filtered.length, events: filtered });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`📅 events-service running on port ${port}`);
});
