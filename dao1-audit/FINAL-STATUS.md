# day1.build - Final Status & Testing Guide

**Date:** 2026-05-12  
**Status:** Backend fully functional, WebSocket configured, AI ready

---

## What's Working ✅

### 1. All API Endpoints Connected
- Authentication (login, register, Google OAuth)
- Messaging/Chat
- Social feed (discover, trending, suggested)
- Payments & invoices
- Notifications
- User profiles
- Business pages
- AI chat & generation
- Organization settings
- User settings & API keys

### 2. WebSocket Real-Time Communication
- WebSocket server running on `/ws`
- Configured in backend (`path: '/ws'`)
- Proxied through Caddy
- Ready for frontend connections

### 3. AI Integration
- Anthropic Claude integration (`/api/chat`)
- Bid/estimate generation (`/api/ai/generate`)
- User API key storage (`/api/settings/api-keys`)

---

## How To Test

### Test 1: WebSocket Connection

**Visit:** https://day1.build/ws-test.html

1. First, get an auth token:
   - Open https://day1.build
   - Sign in with Google
   - Open browser DevTools → Application → Local Storage
   - Find `auth_token` or similar
   - Copy the token value

2. On the test page:
   - Paste your token in the input field
   - Click "Connect"
   - Should see: "Connected! Authenticating..." then "Authenticated!"
   - Messages panel will show incoming WebSocket messages

3. Send a test message:
   - Type anything in the message field
   - Click "Send"
   - Should see the message echoed back (if server handles it)

**What This Tests:**
- WebSocket connection through HTTPS
- Authentication via token
- Bi-directional communication

---

### Test 2: API Key Management

```bash
# 1. Login to get token
curl -X POST https://day1.build/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Returns: {"token":"eyJhbGc..."}

# 2. Save your Anthropic API key
curl -X PUT https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer <your-token-here>" \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","apiKey":"sk-ant-YOUR-KEY-HERE"}'

# 3. Check it was saved
curl https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer <your-token-here>"

# Returns: {"anthropic":true,"openai":false}
```

---

### Test 3: AI Chat

```bash
curl -X POST https://day1.build/api/chat \
  -H "Authorization: Bearer <your-token-here>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, can you help me create a construction bid?"}
    ]
  }'

# Returns: {"message":"Yes, I can help you create a construction bid..."}
```

---

### Test 4: Chat Messages (Real-Time)

**To test that messages appear in real-time:**

1. Open https://day1.build in TWO browser windows/tabs
2. Login with the same account (or different accounts)
3. Start a conversation in one window
4. Send a message
5. Check if it appears in the other window instantly

**If messages DON'T appear instantly:**
- Check browser console for WebSocket connection
- Look for errors or failed connections
- Open DevTools → Network → WS (WebSocket filter)
- Should see an active connection to `wss://day1.build/ws`

---

## Frontend Needs To Do

### 1. Add Settings Page UI

The backend endpoints exist, frontend just needs a settings page:

```javascript
// Example: Settings page component
function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('anthropic');
  
  async function saveApiKey() {
    await fetch('/api/settings/api-keys', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, apiKey })
    });
    alert('API key saved!');
  }
  
  return (
    <div>
      <h2>AI Settings</h2>
      <select value={provider} onChange={e => setProvider(e.target.value)}>
        <option value="anthropic">Anthropic (Claude)</option>
        <option value="openai">OpenAI (GPT)</option>
      </select>
      <input 
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="sk-ant-..."
      />
      <button onClick={saveApiKey}>Save</button>
    </div>
  );
}
```

---

### 2. Connect WebSocket Properly

The frontend needs to connect to `wss://day1.build/ws` on login:

```javascript
// In your app initialization
let ws;

function connectWebSocket(authToken) {
  const wsUrl = `wss://${window.location.host}/ws`;
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
    // Authenticate
    ws.send(JSON.stringify({ 
      type: 'auth', 
      token: authToken 
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'auth_success') {
      console.log('WebSocket authenticated');
    }
    
    if (data.type === 'message') {
      // New message received
      handleNewMessage(data.data);
    }
    
    if (data.type === 'notification') {
      // New notification
      showNotification(data.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting...');
    setTimeout(() => connectWebSocket(authToken), 3000);
  };
}

// Call on login
connectWebSocket(userToken);
```

---

### 3. Send Messages With Real-Time Updates

```javascript
async function sendMessage(conversationId, content) {
  // Optimistically add to UI
  addMessageToUI({
    id: 'temp-' + Date.now(),
    content,
    sender: currentUser,
    created_at: new Date()
  });
  
  // Send to backend
  await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  
  // WebSocket will broadcast the real message
  // So other users see it instantly
}
```

---

## Server Configuration

### Backend (PM2)
```
Name: day1-api
Status: Online
Port: 3002
WebSocket: Enabled on /ws
Database: PostgreSQL connected
Stripe: Configured
AI: Ready (needs user API keys)
```

### Proxy (Caddy)
```
Domain: day1.build
HTTPS: Auto (Let's Encrypt)
Routes:
  /api/* → localhost:3002
  /ws → localhost:3002 (WebSocket)
  /* → Static files (/opt/dao1/apps/manager)
```

---

## Environment Variables

Current config (`/opt/dao1/apps/manager-server/ecosystem.config.js`):

```javascript
{
  DATABASE_URL: '...',
  DB_PASSWORD: '...',
  JWT_SECRET: '...',
  PORT: '3002',
  NODE_ENV: 'production',
  ALLOWED_ORIGINS: 'https://day1.build,https://www.day1.build',
  GOOGLE_CLIENT_ID: '...',
  GOOGLE_CLIENT_SECRET: '...',
  GOOGLE_REDIRECT_URI: 'https://day1.build/api/auth/google/callback',
  STRIPE_SECRET_KEY: '...'
}
```

**Missing (intentionally):**
- `ANTHROPIC_API_KEY` - Users provide their own via `/api/settings/api-keys`

---

## Database Tables

All tables created and indexed:
- `users` - User accounts
- `sessions` - Auth tokens
- `user_settings` - API keys, preferences
- `conversations` - Chat threads
- `conversation_members` - Who's in each chat
- `messages` - Chat messages
- `posts` - Social feed
- `businesses` - Business pages
- `notifications` - User notifications
- `widget_templates` - Dashboard templates
- `properties` - Real estate (if used)
- `payments` - Stripe transactions

---

## Known Issues & Limitations

### ✅ Fixed
- All API endpoints connected
- WebSocket configured
- API key storage working
- OAuth redirects correct
- Route aliases working

### ⚠️ Frontend Needs
- Connect to WebSocket on app load
- Add settings page for API keys
- Handle WebSocket messages for real-time updates
- Show typing indicators (optional)
- Handle reconnection on network changes

### 🔮 Not Built Yet
- AI Agent as a chat user
- Bid request form UI
- Photo upload for bid estimates
- Properties/units management UI
- Voting/governance UI

---

## Next Steps for Beta Testing

1. **Test WebSocket** - Use https://day1.build/ws-test.html
2. **Add Settings UI** - Let users enter API keys
3. **Connect WebSocket in frontend** - Real-time chat
4. **Test with multiple users** - Verify messages appear instantly
5. **Build bid request form** - Primary use case
6. **Create AI Agent user** - Chat with AI to create bids

---

## Files Created/Modified

**New Files:**
- `/opt/dao1/apps/manager-server/server/routes/aliases.ts`
- `/opt/dao1/apps/manager-server/server/routes/ai-addon.ts`
- `/opt/dao1/apps/manager-server/server/routes/org.ts`
- `/opt/dao1/apps/manager-server/server/routes/settings.ts`
- `/opt/dao1/apps/manager/ws-test.html`

**Modified Files:**
- `/opt/dao1/apps/manager-server/server/index.ts` (added WebSocket path, registered new routes)
- `/opt/dao1/apps/manager-server/server/routes/social.ts` (added trending/suggested feeds)
- `/opt/dao1/apps/manager-server/server/routes/auth.ts` (fixed OAuth redirects)

**Config Files:**
- `/opt/dao1/apps/manager-server/ecosystem.config.js` (PM2 config with env vars)
- `/etc/caddy/Caddyfile` (WebSocket proxy)

---

## Quick Health Check

```bash
# Check backend
curl https://day1.build/api/health
# Should return: {"status":"ok",...}

# Check WebSocket (use browser on https://day1.build/ws-test.html)

# Check database
ssh roan@159.223.161.253 'psql -U dao1 -d dao1_prod -c "SELECT COUNT(*) FROM users;"'

# Check PM2
ssh roan@159.223.161.253 'pm2 list'
# Should show: day1-api | online

# Check logs
ssh roan@159.223.161.253 'pm2 logs day1-api --lines 50'
```

---

**Status:** Backend complete and functional. Frontend just needs WebSocket connection and settings UI.

**Ready for beta testing** once frontend WebSocket is connected.
