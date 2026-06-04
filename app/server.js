const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Static configuration defined directly in application code
const message = "Hello from Dilip, Akanksha, and Advik! ❤️";
const uiColor = "#e74c3c"; 


app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitOps Pipeline Demo</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: ${uiColor};
            --bg-color: #0f0c1b;
            --card-bg: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #ffffff;
            --text-secondary: #a0aec0;
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
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(123, 31, 162, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(231, 76, 60, 0.15) 0%, transparent 40%);
        }

        .container {
            max-width: 800px;
            width: 90%;
            padding: 40px 20px;
            text-align: center;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 50px 30px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            margin-bottom: 40px;
            position: relative;
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), #9b59b6);
        }

        .heart-icon {
            font-size: 80px;
            display: inline-block;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 15px var(--primary-color));
            animation: beat 1.2s infinite alternate;
        }

        h1 {
            font-size: 2.8rem;
            font-weight: 800;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ffffff 30%, #e2e8f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1.2;
        }

        .message {
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 30px;
            text-shadow: 0 0 10px rgba(231, 76, 60, 0.2);
        }

        .pipeline-badge {
            display: inline-flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 0.9rem;
            color: var(--text-secondary);
            gap: 8px;
            margin-bottom: 20px;
        }

        .badge-dot {
            width: 8px;
            height: 8px;
            background-color: #2ecc71;
            border-radius: 50%;
            box-shadow: 0 0 8px #2ecc71;
        }

        .flow {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .flow-step {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            flex: 1;
            min-width: 120px;
            transition: all 0.3s ease;
        }

        .flow-step.active {
            border-color: var(--primary-color);
            color: var(--text-primary);
            background: rgba(231, 76, 60, 0.05);
            box-shadow: 0 0 15px rgba(231, 76, 60, 0.1);
        }

        @keyframes beat {
            0% { transform: scale(1); }
            100% { transform: scale(1.12); }
        }

        footer {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="pipeline-badge">
            <span class="badge-dot"></span>
            <span>Live GitOps Pipeline Active</span>
        </div>
        
        <div class="card">
            <div class="heart-icon">❤️</div>
            <h1>Greetings</h1>
            <div class="message">${message}</div>
            
            <div class="flow">
                <div class="flow-step">1. Code Push</div>
                <div class="flow-step">2. Jenkins CI</div>
                <div class="flow-step">3. Docker Hub</div>
                <div class="flow-step">4. ArgoCD Pull</div>
                <div class="flow-step active">5. K8s Live</div>
            </div>
        </div>

        <footer>
            Built dynamically using Node.js &bull; Managed by ArgoCD &bull; Hosted on Minikube
        </footer>
    </div>
</body>
</html>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
