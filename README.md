# ⚡ ByteSynq

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react)](https://reactjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-dc382d.svg?logo=redis)](https://upstash.com/)

**ByteSynq** is an enterprise-grade webhook proxy, management, and analytics platform. It acts as a secure, real-time bridge between third-party API providers (Stripe, GitHub, Shopify) and your local development environment.

Say goodbye to exposing your localhost to the public internet. Catch, inspect, validate, search, and tunnel webhooks securely.

---

## ✨ Core Features

### 🔗 Core Proxy & Forwarding
* **Secure Webhook Ingestion:** Dynamically generated unique endpoint URLs to catch incoming webhooks securely.
* **Cryptographic Proxy Forwarding:** Automatically forward events to staging/production servers with injected `X-ByteSynq-Signature` (HMAC-SHA256) signatures to prevent spoofing.
* **Localhost Streaming (CLI):** Full Socket.io integration allowing developers to stream webhooks directly into their local development environments without messing with ngrok.
* **Custom Responses:** Ability to configure custom mock HTTP Status Codes and JSON body responses to return to the webhook sender.

### 🛡️ Enterprise Security & Validation
* **Redis-Backed Rate Limiting:** High-speed rate limiting (per Second, Minute, or Hour) to automatically block spam and abuse with `429 Too Many Requests`.
* **IP Whitelisting:** Strict security rules to only accept incoming traffic from explicitly trusted IPv4/IPv6 addresses (returning `403 Forbidden` otherwise).
* **JSON Schema Validation:** Write custom Ajv JSON schemas to strictly validate the structure of incoming payloads; automatically rejecting malformed webhooks with a `400 Bad Request`.
* **Provider Native Signature Verification:** Built-in secret verification for major providers like GitHub.

### 📊 Advanced Analytics & Dashboards
* **Global Command Center:** A macro-level dashboard aggregating traffic volume, total events, and average latency across *all* endpoints in your account simultaneously.
* **Endpoint Drill-down:** Micro-level analytics for specific endpoints featuring dual real-time AreaCharts (live volume over 24h) and Status Code distribution BarCharts.
* **MongoDB Persistence:** All webhook data (headers, latency, status codes, deep payload data) is safely persisted for historical analysis and debugging.

### 🔍 Data Stream & Debugging
* **Deep JSON Payload Searching:** An advanced search syntax (`key:value`) allowing users to query deeply nested properties directly from the MongoDB payload objects (e.g., `user.email:john@example.com`).
* **One-Click Replay:** Instantly resend any historical webhook to your destination server or CLI for rapid debugging and bug fixing.
* **Live Socket Streaming:** The Data Stream UI updates in true real-time as webhooks hit the server, drawing metrics and logging events without refreshing the page.

### 📧 Alerts & Notifications
* **Discord / Slack Integration:** Configure a webhook URL to receive instant pings if your proxy forwarding fails.
* **Premium Email Alerts:** Fully styled, responsive HTML emails sent directly to your inbox using a REST-based provider (Brevo/SendGrid/Resend) when consecutive forwarding failures occur.
* **Inactivity Thresholds:** Receive alerts if a mission-critical endpoint stops receiving traffic for a specified number of hours.

### 🔐 Authentication & Identity
* **Secure JWT Auth:** Stateless JSON Web Token authentication system.
* **Regex Password Policies:** Strict client-side and server-side enforcement of strong passwords.
* **Seamless Password Reset:** Integrated OTP (One-Time Password) flow embedded directly in the UI with dark-themed, premium HTML OTP emails.

---

## 🛠️ System Architecture

ByteSynq is built on a modern MERN stack with a high-performance event-driven core.

* **Frontend:** React, Vite, Tailwind CSS, Recharts.
* **Backend:** Node.js, Express, Socket.io.
* **Database:** MongoDB (Persistent Payload Storage).
* **Message Broker:** Upstash Serverless Redis (TCP for Real-Time Pub/Sub & High-Speed Rate Limiting).
* **Distribution:** Globally installable Node.js CLI package.

---

## 🚀 Getting Started (Local Development)

ByteSynq is structured as a monorepo containing the frontend, backend, and CLI.

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas cluster)
* An Upstash Redis Database (or local Redis instance)
* Email API Key (Brevo, SendGrid, or Resend)

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

BREVO_API_KEY="your_api_key_here" # Or SENDGRID_API_KEY / RESEND_API_KEY
SMTP_FROM_EMAIL="noreply@bytesynq.io"

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
