export const webhookEvents = [
  {
    id: 'evt01',
    method: 'POST',
    path: '/webhooks/stripe',
    source: 'Stripe',
    timestamp: '12:04:51.221',
    latency: '1.2ms',
    status: 200,
    payload: {
      id: 'evt_1Qk2x9LkdIwHu7ix',
      object: 'event',
      type: 'customer.subscription.created'
    },
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': 't=1719763491,v1=8f3a...c21d'
    }
  },
  {
    id: 'evt02',
    method: 'POST',
    path: '/webhooks/github',
    source: 'GitHub',
    timestamp: '12:04:49.882',
    latency: '0.8ms',
    status: 200,
    payload: {
      ref: 'refs/heads/main',
      repository: 'bytesynq',
      private: true
    },
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push'
    }
  },
  {
    id: 'evt03',
    method: 'GET',
    path: '/webhooks/healthcheck',
    source: 'Uptime',
    timestamp: '12:04:47.300',
    latency: '0.3ms',
    status: 200,
    payload: {
      ping: 'ok',
      region: 'iad1'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    id: 'evt04',
    method: 'POST',
    path: '/webhooks/shopify',
    source: 'Shopify',
    timestamp: '12:04:45.114',
    latency: '2.4ms',
    status: 201,
    payload: {
      order_number: 1234,
      total_price: '129.00',
      currency: 'USD'
    },
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    id: 'evt05',
    method: 'DELETE',
    path: '/webhooks/clerk',
    source: 'Clerk',
    timestamp: '12:04:42.557',
    latency: '1.0ms',
    status: 200,
    payload: {
      type: 'user.deleted',
      deleted: true
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }
]

export const latencySamples = [
  1.8, 1.2, 1.6, 0.9, 1.4, 1.1, 2.1, 1.3, 0.8, 1.5,
  1.0, 1.7, 1.2, 0.7, 1.3, 1.9, 1.1, 1.4, 0.9, 1.2
]

export const rpmSamples = [42, 58, 49, 73, 61, 88, 95, 79, 102, 91, 118, 134]