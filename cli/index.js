#!/usr/bin/env node

const { program } = require('commander');
const { io } = require('socket.io-client');
const axios = require('axios');

program
  .name('bytesynq')
  .description('ByteSynq Localhost Forwarding CLI')
  .version('1.0.0');

program
  .command('listen')
  .description('Listen for webhooks and forward them locally')
  .requiredOption('-e, --endpoint <id>', 'Endpoint ID to listen to')
  .requiredOption('-p, --port <port>', 'Local port to forward to (e.g., 3000)')
  .option('-s, --server <url>', 'ByteSynq server URL', 'https://bytesynq.onrender.com')
  .action((options) => {
    const { endpoint, port, server } = options;
    const targetUrl = `http://localhost:${port}`;

    console.log(`\n🚀 Starting ByteSynq CLI...`);
    console.log(`📡 Connecting to server: ${server}`);
    console.log(`🔗 Listening on Endpoint: ${endpoint}`);
    console.log(`🎯 Forwarding to: ${targetUrl}\n`);

    const socket = io(server);

    socket.on('connect', () => {
      console.log(`[✔] Connected to ByteSynq Server.`);
      socket.emit('join_endpoint', endpoint);
      console.log(`[✔] Joined endpoint room: ${endpoint}. Waiting for webhooks...\n`);
    });

    socket.on('connect_error', (err) => {
      console.error(`[✖] Connection Error: ${err.message}`);
    });

    socket.on('new_webhook', async (webhook) => {
      console.log(`\n[⚡] Webhook Received! ID: ${webhook.id}`);
      console.log(`     Method: ${webhook.method} | Path: ${webhook.path}`);
      
      try {
        // Prepare headers (excluding host and connection to avoid conflicts)
        const forwardHeaders = { ...webhook.headers };
        delete forwardHeaders.host;
        delete forwardHeaders.connection;
        delete forwardHeaders['content-length'];

        const startTime = Date.now();
        
        const response = await axios({
          method: webhook.method,
          url: targetUrl + webhook.path,
          headers: forwardHeaders,
          data: webhook.payload,
          validateStatus: () => true // Resolve on any status code
        });

        const latency = Date.now() - startTime;
        
        console.log(`[✔] Forwarded locally!`);
        console.log(`     Response: ${response.status} ${response.statusText} (${latency}ms)`);
        
      } catch (err) {
        console.error(`[✖] Failed to forward locally: ${err.message}`);
        console.error(`     Ensure your local app is running on port ${port}.`);
      }
    });
  });

program.parse(process.argv);
