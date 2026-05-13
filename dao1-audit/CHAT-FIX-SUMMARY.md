# Chat & API Key Issues - Fixed

**Date:** 2026-05-12  
**Issues:** 
1. No way to add API keys
2. Chat messages not appearing in real-time

---

## What I Fixed

### 1. Added API Key Management ✅

**New endpoints:**
```
GET    /api/settings/me            - Get all user settings
PUT    /api/settings/me            - Update settings
GET    /api/settings/api-keys      - Check which API keys are configured
PUT    /api/settings/api-keys      - Save API key
DELETE /api/settings/api-keys/:provider - Remove API key
```

**How to use:**

```bash
# Save Anthropic API key
curl -X PUT https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","apiKey":"sk-ant-..."}'

# Check status
curl https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer <token>"
# Returns: {"anthropic":true,"openai":false}
```

**Frontend can now:**
- Show settings page with API key input
- Save user's Anthropic/OpenAI keys
- Use those keys for AI chat/generation

---

### 2. Chat Real-Time Issue

**The backend is working correctly:**
- ✅ Messages save to database
- ✅ WebSocket broadcasts configured
- ✅ Broadcast function calls all conversation members

**The problem is likely:**
- ❌ Frontend not connecting to WebSocket
- ❌ WebSocket URL wrong
- ❌ Auth token not passed to WebSocket connection

**Backend WebSocket endpoint:**
```
wss://day1.build/ws
```

**How it should work:**
1. Frontend opens WebSocket connection to `wss://day1.build/ws`
2. Sends auth message: `{"type":"auth","token":"<jwt>"}`
3. Backend associates WebSocket with user
4. When message sent, backend broadcasts to all conversation members
5. Frontend receives `{type:"message",data:{...}}` via WebSocket
6. Frontend updates UI instantly

**What to check in browser:**
1. Open developer tools → Network tab → WS (WebSocket)
2. Look for connection to `/ws`
3. If no connection: frontend not trying to connect
4. If connection fails: check auth token being sent
5. If connected but no messages: check message format

---

## Testing

### Test API Key Storage

```bash
# 1. Login and get token
curl -X POST https://day1.build/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
# Returns: {"token":"eyJhbGc..."}

TOKEN="<paste token here>"

# 2. Save API key
curl -X PUT https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","apiKey":"sk-ant-test123"}'
# Returns: {"success":true,"message":"anthropic API key saved"}

# 3. Check status
curl https://day1.build/api/settings/api-keys \
  -H "Authorization: Bearer $TOKEN"
# Returns: {"anthropic":true,"openai":false}

# 4. Get all settings
curl https://day1.build/api/settings/me \
  -H "Authorization: Bearer $TOKEN"
# Returns: {"api_keys":{"anthropic":"sk-ant-test123"},"preferences":{},"notification_settings":{}}
```

---

## WebSocket Testing

```javascript
// In browser console on day1.build
const ws = new WebSocket('wss://day1.build/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
  // Send auth (replace with real token)
  ws.send(JSON.stringify({
    type: 'auth',
    token: localStorage.getItem('auth_token') // or however frontend stores it
  }));
};

ws.onmessage = (event) => {
  console.log('WebSocket message:', JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};
```

If WebSocket connects and auth works, you should see:
```
WebSocket connected
```

Then when you send a message, you should receive:
```javascript
{
  type: 'message',
  data: {
    id: '<uuid>',
    conversation_id: '<uuid>',
    content: 'Your message',
    sender_id: '<uuid>',
    sender_name: 'Your Name',
    created_at: '2026-05-12T...'
  }
}
```

---

## Frontend Needs To Do

### 1. Add Settings Page UI
```javascript
// Example settings component
function SettingsPage() {
  const [anthropicKey, setAnthropicKey] = useState('');
  
  const saveKey = async () => {
    await fetch('/api/settings/api-keys', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'anthropic',
        apiKey: anthropicKey
      })
    });
  };
  
  return (
    <div>
      <h2>API Keys</h2>
      <input 
        type="password" 
        placeholder="Anthropic API Key (sk-ant-...)"
        value={anthropicKey}
        onChange={(e) => setAnthropicKey(e.target.value)}
      />
      <button onClick={saveKey}>Save</button>
    </div>
  );
}
```

### 2. Fix WebSocket Connection
```javascript
// Example WebSocket setup
let ws;

function connectWebSocket(token) {
  ws = new WebSocket('wss://day1.build/ws');
  
  ws.onopen = () => {
    // Authenticate
    ws.send(JSON.stringify({ type: 'auth', token }));
  };
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    if (msg.type === 'message') {
      // Add message to chat UI
      addMessageToUI(msg.data);
    }
    
    if (msg.type === 'notification') {
      // Show notification
      showNotification(msg.data);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    // Reconnect after 3 seconds
    setTimeout(() => connectWebSocket(token), 3000);
  };
}
```

### 3. Send Message With Optimistic Update
```javascript
async function sendMessage(conversationId, content) {
  // 1. Optimistically add to UI immediately
  const tempMessage = {
    id: 'temp-' + Date.now(),
    content,
    sender_id: currentUser.id,
    sender_name: currentUser.name,
    created_at: new Date().toISOString()
  };
  addMessageToUI(tempMessage);
  
  // 2. Send to server
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  
  const { message } = await response.json();
  
  // 3. Replace temp with real message
  replaceTempMessage(tempMessage.id, message);
  
  // 4. WebSocket will also send this message, 
  //    but since we already have it, ignore duplicate
}
```

---

## Summary

**API Key Management:** ✅ Working
- Backend endpoints added
- Frontend just needs settings UI page

**Chat Real-Time:** ⚠️ Backend working, frontend needs WebSocket connection
- Backend broadcasts messages correctly
- Frontend needs to connect to `wss://day1.build/ws`
- Frontend needs to handle incoming WebSocket messages

**Next Steps:**
1. Add settings page UI for API keys
2. Connect WebSocket in frontend
3. Test sending/receiving messages
4. Add optimistic UI updates for better UX

---

**Files Added:**
- `/opt/dao1/apps/manager-server/server/routes/settings.ts`

**Files Modified:**
- `/opt/dao1/apps/manager-server/server/index.ts` (registered settings route)
