# ⚡ ByteSynq CLI

[![npm version](https://img.shields.io/npm/v/bytesynq-cli.svg?style=flat)](https://www.npmjs.com/package/bytesynq-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**ByteSynq CLI** is the official command-line companion for the ByteSynq platform. It acts as a secure, real-time reverse tunnel that intercepts third-party cloud webhooks (like Stripe, GitHub, or Shopify) and routes them directly to your local development environment—bypassing firewalls and NATs instantly.

Say goodbye to exposing your localhost to the public internet using clunky proxy tools. Catch, inspect, validate, and tunnel webhooks securely via WebSockets and Redis.

## 🚀 Installation

Install the CLI globally using npm:

```bash
npm install -g bytesynq-cli
```

## 🛠️ Usage

To start forwarding webhooks to your local machine, you need an **Endpoint ID**. 
1. Log into your [ByteSynq Dashboard](https://byte-synq.vercel.app/).
2. Create a new Endpoint (e.g., `req_123abc`).
3. Point your third-party API (Stripe, GitHub, etc.) to your public ByteSynq webhook URL.
4. Run the CLI to catch the incoming traffic!

### Forwarding to localhost

Listen for incoming webhooks and forward them to a local port (e.g., port `3000`):

```bash
bytesynq listen --endpoint <YOUR_ENDPOINT_ID> --port 3000
```

Example:
```bash
bytesynq listen --endpoint req_znwx7 --port 3000
```

### Advanced Options

```text
Usage: bytesynq listen [options]

Listen for webhooks and forward them locally

Options:
  -e, --endpoint <id>   Endpoint ID to listen to (required)
  -p, --port <port>     Local port to forward to (e.g., 3000) (required)
  -s, --server <url>    ByteSynq server URL (default: "https://bytesynq.onrender.com")
  -h, --help            display help for command
```

## 🌐 How it works

1. The CLI establishes a persistent **WebSocket connection** to the ByteSynq production server.
2. It joins a dedicated Redis Pub/Sub room specific to your Endpoint ID.
3. When the server receives a webhook on your public endpoint URL, it instantly broadcasts the payload.
4. The CLI intercepts the broadcast in milliseconds and executes a mirror HTTP request against your local application port.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve ByteSynq, please visit the [Main GitHub Repository](https://github.com/Prajitsingh1105/ByteSynq).

## 📄 License

Distributed under the MIT License.
