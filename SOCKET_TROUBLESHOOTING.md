# Socket Connection Troubleshooting Guide

## XHR Poll Error Analysis

When you see repeated "xhr poll error" messages, this indicates Socket.IO is having trouble maintaining a connection to the audio server. Here's what each error means and how to fix it:

### What are XHR Poll Errors?

Socket.IO uses different transport methods to communicate:
1. **WebSocket** - Fast, persistent connection (preferred)
2. **Polling (XHR)** - Fallback method using HTTP requests

XHR poll errors occur when:
- The server is unreachable or overloaded
- Network connectivity issues
- Firewall/proxy blocking connections
- Server is experiencing high load (common with free hosting)

### Current Configuration

Your audio system is configured with:
- **Server**: `https://audio-room-full-fina-sih-backend.onrender.com`
- **Retry Logic**: 5 attempts with 2-second delays
- **Transports**: WebSocket first, then polling fallback
- **Timeout**: 10 seconds per attempt

### Troubleshooting Steps

#### 1. Check Debug Panel
- Look at the **Audio Debug Panel** (top-left corner)
- Check if "Socket: CONNECTED" is green or red
- Review the debug logs for specific error patterns

#### 2. Server Status Check
The audio server is hosted on Render.com (free tier), which can:
- Go to sleep after 15 minutes of inactivity
- Have slower response times
- Experience temporary outages

**Solution**: Wait 30-60 seconds for the server to wake up, then click "Retry Connection"

#### 3. Network Issues
```bash
# Test server connectivity in terminal:
curl -I https://audio-room-full-fina-sih-backend.onrender.com

# Should return HTTP 200 or similar
```

#### 4. Browser-Specific Issues

**Chrome/Edge**:
- Check Console (F12) for CORS errors
- Try disabling extensions temporarily
- Clear browser cache

**Firefox**:
- Check if Enhanced Tracking Protection is blocking connections
- Try in Private/Incognito mode

**Safari**:
- Check Develop menu for WebRTC restrictions
- Try enabling "Allow WebRTC" in settings

#### 5. Firewall/Corporate Network
If you're on a corporate network:
- WebSocket connections might be blocked
- Ask IT to whitelist: `audio-room-full-fina-sih-backend.onrender.com`
- Try using mobile hotspot to test

### Quick Fixes

#### Method 1: Manual Retry
1. Open the Audio Debug Panel
2. Click "Retry Connection" button
3. Wait 10-15 seconds for connection attempt

#### Method 2: Page Refresh
1. Refresh the browser page (F5)
2. Allow microphone access when prompted
3. Check debug panel for connection status

#### Method 3: Different Browser
- Try Chrome, Firefox, or Edge
- Use Incognito/Private mode
- Test with different users in separate browsers

### Understanding Error Patterns

#### Continuous Errors (10+ per minute)
```
❌ Socket error: xhr poll error (repeated)
```
**Cause**: Server is down or unreachable
**Solution**: Wait for server to come back online, or use fallback solution

#### Intermittent Errors (few per minute)
```
❌ Connection error (1/5): xhr poll error
✅ Socket connected (ID: abc123)
```
**Cause**: Network instability
**Solution**: Usually resolves automatically with retry logic

#### Connection Timeout Errors
```
❌ Connection error (5/5): timeout
🚫 Max connection attempts reached
```
**Cause**: Server overloaded or network blocking
**Solution**: Wait 5 minutes, then refresh page

### Alternative Solutions

If audio continues to fail:

1. **Use Different Rooms**: Try creating a new room ID
2. **Check Server Status**: Visit the server URL directly in browser
3. **Use Fallback**: Disable audio features temporarily
4. **Contact Support**: Provide debug logs and error timestamps

### Prevention Tips

1. **Keep Tab Active**: Audio works best when the tab is active
2. **Stable Network**: Use wired connection when possible
3. **Browser Updates**: Keep browser updated for WebRTC support
4. **Allow Permissions**: Always allow microphone access

### Debug Information to Collect

When reporting issues, include:
- Browser type and version
- Network type (WiFi/Ethernet/Mobile)
- Error timestamps from debug panel
- Console logs (F12 → Console)
- Number of users in the room

### Advanced Debugging

Open browser console (F12) and run:
```javascript
// Check WebRTC support
console.log('WebRTC Support:', !!window.RTCPeerConnection);

// Check Socket.IO status
console.log('Socket Status:', window.audioSocket?.connected);

// Test server connectivity
fetch('https://audio-room-full-fina-sih-backend.onrender.com')
  .then(r => console.log('Server Response:', r.status))
  .catch(e => console.log('Server Error:', e));
```

### When to Contact Support

Contact support if you experience:
- Consistent failures across multiple browsers
- Audio works for some users but not others
- Connection succeeds but no audio transmission
- Errors persist after following all troubleshooting steps

Remember: The audio server is hosted on a free tier service, so some connectivity issues are expected. The system includes automatic retry logic to handle most temporary problems.