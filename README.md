# ⚡ ByteSynq

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react)](https://reactjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-dc382d.svg?logo=redis)](https://upstash.com/)

**ByteSynq** is an enterprise-grade webhook interception, debugging, and reverse-tunneling platform. It acts as a secure, real-time bridge between third-party API providers (Stripe, GitHub, Shopify) and your local development environment.

Say goodbye to exposing your localhost to the public internet. Catch, inspect, validate, and tunnel webhooks securely.

---

## ✨ Core Features

* **⚡ Real-Time Telemetry:** Incoming webhooks are intercepted, processed, and streamed to the UI in milliseconds via a Redis Pub/Sub message broker and WebSockets.
* **💻 Localhost CLI Tunneling:** Use the `bytesynq-cli` to securely route cloud payloads directly to your local application ports, bypassing firewalls and NATs.
* **🛡️ Cryptographic Proxy Forwarding:** Automatically forward events to staging/production servers with injected HMAC-SHA256 signatures to prevent spoofing.
* **📊 Live Analytics Dashboard:** Track 24-hour volume, HTTP status code distributions, and real microsecond latency using MongoDB aggregation pipelines.
* **🔄 Instant Replay:** Re-trigger any historical payload with a single click—no need to manually reset states in third-party dashboards.
* **🚦 Schema Validation & Mocking:** Validate incoming payloads against custom JSON schemas and configure specific HTTP mock responses (e.g., `200 OK` or `400 Bad Request`).

---

## 🛠️ System Architecture

ByteSynq is built on a modern MERN stack with a high-performance event-driven core.

* **Frontend:** React, Vite, Tailwind CSS, Recharts.
* **Backend:** Node.js, Express, Socket.io, Passport.js (GitHub OAuth).
* **Database:** MongoDB (Persistent Payload Storage).
* **Message Broker:** Upstash Serverless Redis (TCP for Real-Time Pub/Sub).
* **Distribution:** Globally installable Node.js CLI package.

---

## 🚀 Getting Started (Local Development)

ByteSynq is structured as a monorepo containing the frontend, backend, and CLI.

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas cluster)
* An Upstash Redis Database (or local Redis instance)
* A GitHub OAuth App (for authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/Prajitsingh1105/ByteSynq.git
cd ByteSynq
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:

```env
PORT=3001
MONGO_URI="mongodb://localhost:27017/bytesynq"
REDIS_URL="rediss://default:your_password@your-upstash-url:port"

SESSION_SECRET="generate_a_secure_random_string"
JWT_SECRET="generate_a_secure_random_string"

GITHUB_CLIENT_ID="your_github_oauth_client_id"
GITHUB_CLIENT_SECRET="your_github_oauth_client_secret"
GITHUB_CALLBACK_URL="http://localhost:3001/api/v1/auth/github/callback"

FRONTEND_URL="http://localhost:5173"
```
Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:

```bash
cd client
npm install
```
Start the Vite development server:

```bash
npm run dev
```
Navigate to `http://localhost:5173` to access the dashboard.

### 4. CLI Setup (Local Testing)
To test the CLI locally before publishing to npm:

```bash
cd cli
npm link
```
You can now run the `bytesynq` command globally on your machine:

```bash
bytesynq listen --endpoint <your_endpoint_id> --port 3000
```

## 📖 Webhook Signature Verification (Proxy)
If you are using ByteSynq's proxy forwarding to send data to your own API, you must verify the request to ensure it came securely from ByteSynq.

Every outbound request includes:

* `X-ByteSynq-Signature`: HMAC-SHA256 hash of the raw payload.
* `X-ByteSynq-Forwarded-From`: Your unique Endpoint ID.

Node.js Verification Example:

```javascript
const crypto = require('crypto');

function verifyWebhook(req, res, next) {
  const secretKey = process.env.BYTESYNQ_SECRET; 
  const signature = req.headers['x-bytesynq-signature'];
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid Signature' });
  }
  next();
}
```

## 🤝 Contributing
Contributions are welcome! If you'd like to improve ByteSynq, please fork the repository, create a feature branch, and submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
