const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// ── Family member data ──────────────────────────────────────────────────────
const members = [
  {
    id: 'dilip',
    name: 'Dilip Kumar Nigam',
    role: 'Dad · DevOps & Cloud Engineer',
    emoji: '👨‍💻',
    avatar: '🧑‍💼',
    bio: 'Building GitOps pipelines by day, building memories with family every moment.',
    skills: ['Kubernetes', 'Jenkins', 'ArgoCD', 'Docker', 'Love'],
    funFact: 'Deployed this microservices app to prove his love is production-grade ❤️'
  },
  {
    id: 'akanksha',
    name: 'Akanksha Nigam',
    role: 'Mom · Heart & Soul of the Family',
    emoji: '🌸',
    avatar: '👩‍🦰',
    bio: 'The most stable service in the cluster. Zero downtime, infinite love.',
    skills: ['Patience', 'Love', 'Wisdom', 'Strength', 'Grace'],
    funFact: 'Her SLA for hugs is 100% — never missed a single one 🤗'
  },
  {
    id: 'advik',
    name: 'Advik Nigam',
    role: 'Baby · Chief Joy Officer',
    emoji: '👶',
    avatar: '🍼',
    bio: 'The most beautiful deployment Dilip and Akanksha ever shipped to production.',
    skills: ['Smiling', 'Laughing', 'Growing', 'Bringing Joy', 'Being Adorable'],
    funFact: 'His laughter has a latency of 0ms and throughput of infinite happiness ☀️'
  }
];

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'family-service', timestamp: new Date().toISOString() });
});

app.get('/api/members', (req, res) => {
  res.json({ service: 'family-service', members });
});

app.get('/api/members/:id', (req, res) => {
  const member = members.find(m => m.id === req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json({ service: 'family-service', member });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`👨‍👩‍👦 family-service running on port ${port}`);
});
