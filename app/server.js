const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dilip, Akanksha, and Advik ❤️ GitOps</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@1,600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-rose: #ff477e;
            --secondary-violet: #8a2be2;
            --bg-color: #0b0713;
            --card-bg: rgba(255, 255, 255, 0.02);
            --border-color: rgba(255, 255, 255, 0.06);
            --text-primary: #ffffff;
            --text-secondary: #c3b5d9;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }

        /* Ambient glowing background gradients */
        .ambient-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            z-index: 1;
            overflow: hidden;
            pointer-events: none;
        }

        .glow-circle-1 {
            position: absolute;
            top: 20%;
            left: 15%;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 71, 126, 0.15) 0%, transparent 70%);
            filter: blur(50px);
        }

        .glow-circle-2 {
            position: absolute;
            bottom: 10%;
            right: 15%;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%);
            filter: blur(50px);
        }

        /* Canvas for floating hearts particle system */
        #heart-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        }

        .container {
            max-width: 700px;
            width: 90%;
            z-index: 3;
            text-align: center;
            position: relative;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid var(--border-color);
            border-radius: 30px;
            padding: 60px 40px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 
                        inset 0 0 100px rgba(255, 255, 255, 0.01);
            position: relative;
            overflow: hidden;
            transition: border-color 0.5s ease, box-shadow 0.5s ease;
        }

        .card:hover {
            border-color: rgba(255, 71, 126, 0.2);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 
                        0 0 40px rgba(255, 71, 126, 0.1);
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--primary-rose), var(--secondary-violet));
        }

        /* Pulsing 3D Heart Styling */
        .glowing-heart-container {
            margin-bottom: 25px;
            display: inline-block;
            cursor: pointer;
        }

        .glowing-heart {
            font-size: 90px;
            display: inline-block;
            filter: drop-shadow(0 0 20px rgba(255, 71, 126, 0.7));
            animation: pulse 1s infinite alternate cubic-bezier(0.25, 0.8, 0.25, 1);
            transition: transform 0.2s ease;
        }

        .glowing-heart-container:hover .glowing-heart {
            transform: scale(1.15);
            filter: drop-shadow(0 0 35px rgba(255, 71, 126, 0.9));
        }

        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.2rem;
            font-style: italic;
            margin-bottom: 15px;
            color: var(--text-secondary);
        }

        .message {
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff 40%, rgba(255, 255, 255, 0.7) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 25px;
            line-height: 1.3;
        }

        /* Romantic Message Ticker */
        .ticker-container {
            height: 40px;
            overflow: hidden;
            margin-bottom: 40px;
            position: relative;
        }

        .ticker-message {
            font-size: 1.25rem;
            font-weight: 400;
            color: var(--primary-rose);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            position: absolute;
            left: 0;
            right: 0;
        }

        .ticker-message.active {
            opacity: 1;
            transform: translateY(0);
        }

        /* Flow steps styling */
        .pipeline-flow {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-top: 40px;
        }

        .flow-step {
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid var(--border-color);
            padding: 14px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-secondary);
            position: relative;
            transition: all 0.3s ease;
        }

        .flow-step::after {
            content: '➔';
            position: absolute;
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.15);
            z-index: 10;
        }

        .flow-step:last-child::after {
            content: '';
        }

        .flow-step.active {
            border-color: var(--primary-rose);
            color: #ffffff;
            background: rgba(255, 71, 126, 0.03);
            box-shadow: 0 0 15px rgba(255, 71, 126, 0.1);
            animation: flowGlow 2s infinite alternate;
        }

        @keyframes pulse {
            0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 71, 126, 0.6)); }
            100% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255, 71, 126, 0.9)); }
        }

        @keyframes flowGlow {
            0% { border-color: rgba(255, 71, 126, 0.3); }
            100% { border-color: rgba(255, 71, 126, 0.7); }
        }

        footer {
            color: rgba(255, 255, 255, 0.3);
            font-size: 0.8rem;
            margin-top: 30px;
            letter-spacing: 1px;
        }

        @media (max-width: 600px) {
            .pipeline-flow {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            .flow-step::after {
                content: '▼';
                bottom: -15px;
                right: 50%;
                transform: translateX(50%);
                top: auto;
            }
        }
    </style>
</head>
<body>
    <div class="ambient-glow">
        <div class="glow-circle-1"></div>
        <div class="glow-circle-2"></div>
    </div>
    
    <canvas id="heart-canvas"></canvas>

    <div class="container">
        <div class="card">
            <div class="glowing-heart-container" onclick="spawnHearts(30)">
                <div class="glowing-heart">💖</div>
            </div>
            
            <h1>For the most beautiful family...</h1>
            <div class="message">Dilip + Akanksha + Advik</div>
            
            <!-- Love message rotating ticker -->
            <div class="ticker-container">
                <div class="ticker-message active" id="msg-0">Our love runs in an infinite loop ♾️</div>
                <div class="ticker-message" id="msg-1">Advik's laughter is our sunshine ☀️</div>
                <div class="ticker-message" id="msg-2">Akanksha's love is our foundation 🌸</div>
                <div class="ticker-message" id="msg-3">Dilip's vision leads our way 🚀</div>
                <div class="ticker-message" id="msg-4">A GitOps Pipeline built with true love ❤️</div>
            </div>
            
            <div class="pipeline-flow">
                <div class="flow-step">Code Push</div>
                <div class="flow-step">Jenkins CI</div>
                <div class="flow-step">Docker Hub</div>
                <div class="flow-step">ArgoCD Pull</div>
                <div class="flow-step active">K8s Live</div>
            </div>
        </div>

        <footer>
            DILIP &bull; AKANKSHA &bull; ADVIK
        </footer>
    </div>

    <script>
        // --- Floating Heart Particles ---
        const canvas = document.getElementById('heart-canvas');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        class Heart {
            constructor(x, y, size, speedX, speedY, opacity, color) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.speedX = speedX;
                this.speedY = speedY;
                this.opacity = opacity;
                this.decay = 0.003 + Math.random() * 0.004;
                this.color = color;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                
                // Draw heart shape
                const d = this.size;
                ctx.moveTo(0, -d / 4);
                ctx.bezierCurveTo(-d / 2, -d, -d, -d / 3, 0, d);
                ctx.bezierCurveTo(d, -d / 3, d / 2, -d, 0, -d / 4);
                
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= this.decay;
                
                // Add minor swaying
                this.speedX += Math.sin(this.y / 30) * 0.02;
            }
        }

        const hearts = [];
        const colors = ['#ff477e', '#ff7096', '#ff85a1', '#f72585', '#7209b7', '#b5179e'];

        function createHeart() {
            const size = 5 + Math.random() * 20;
            const x = Math.random() * width;
            const y = height + 20;
            const speedX = -0.5 + Math.random() * 1;
            const speedY = -1 - Math.random() * 1.5;
            const opacity = 0.5 + Math.random() * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            hearts.push(new Heart(x, y, size, speedX, speedY, opacity, color));
        }

        // Action when heart is clicked
        function spawnHearts(count) {
            for (let i = 0; i < count; i++) {
                const size = 10 + Math.random() * 25;
                const x = width / 2 + (-50 + Math.random() * 100);
                const y = height / 2 + (-50 + Math.random() * 100) - 100;
                const speedX = -3 + Math.random() * 6;
                const speedY = -2 - Math.random() * 5;
                const opacity = 0.8 + Math.random() * 0.2;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                hearts.push(new Heart(x, y, size, speedX, speedY, opacity, color));
            }
        }

        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Periodically spawn natural hearts
            if (Math.random() < 0.1) {
                createHeart();
            }

            for (let i = hearts.length - 1; i >= 0; i--) {
                hearts[i].update();
                hearts[i].draw();

                if (hearts[i].opacity <= 0 || hearts[i].y < -20) {
                    hearts.splice(i, 1);
                }
            }
            
            requestAnimationFrame(animate);
        }

        animate();

        // --- Message Ticker Rotation ---
        let currentMsgIndex = 0;
        const msgCount = 5;

        setInterval(() => {
            const oldMsg = document.getElementById('msg-' + currentMsgIndex);
            oldMsg.classList.remove('active');
            
            currentMsgIndex = (currentMsgIndex + 1) % msgCount;
            
            const newMsg = document.getElementById('msg-' + currentMsgIndex);
            newMsg.classList.add('active');
        }, 5000);
    </script>
</body>
</html>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
