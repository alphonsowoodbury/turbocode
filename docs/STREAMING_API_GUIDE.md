# Streaming API Guide

This guide explains how to use the new real-time streaming endpoints for AI chat responses.

## Overview

The streaming API enables ChatGPT-like real-time responses where users see the AI's response being generated token-by-token instead of waiting for the complete response.

## New Endpoint

### `POST /api/v1/staff/{staff_id}/messages/stream`

Stream a message to a staff member and receive real-time AI response via Server-Sent Events (SSE).

**Request Body:**
```json
{
  "content": "Your message to the staff member"
}
```

**Response:** Server-Sent Events (SSE) stream with JSON events

**Event Types:**

1. **Token Event** - A chunk of the response text
```json
{
  "type": "token",
  "content": "chunk of text..."
}
```

2. **Done Event** - Stream complete, message saved
```json
{
  "type": "done",
  "message_id": "uuid-of-saved-message"
}
```

3. **Error Event** - An error occurred
```json
{
  "type": "error",
  "detail": "error message"
}
```

## Usage Examples

### JavaScript/TypeScript (Frontend)

```typescript
async function sendStreamingMessage(staffId: string, content: string) {
  const response = await fetch(`/api/v1/staff/${staffId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete events
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'token') {
          // Display token in UI
          appendToMessage(data.content);
        } else if (data.type === 'done') {
          // Stream complete
          console.log('Message saved with ID:', data.message_id);
        } else if (data.type === 'error') {
          console.error('Stream error:', data.detail);
        }
      }
    }
  }
}
```

### Python

```python
import httpx
import json

async def send_streaming_message(staff_id: str, content: str):
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            f"http://localhost:8001/api/v1/staff/{staff_id}/messages/stream",
            json={"content": content},
            timeout=120.0
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = json.loads(line[6:])

                    if data["type"] == "token":
                        print(data["content"], end="", flush=True)
                    elif data["type"] == "done":
                        print(f"\n\nMessage saved: {data['message_id']}")
                    elif data["type"] == "error":
                        print(f"\nError: {data['detail']}")
```

### cURL

```bash
curl -N -X POST http://localhost:8001/api/v1/staff/{staff_id}/messages/stream \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, can you help me with this project?"}' \
  --no-buffer
```

## Features

### Enhanced Context Integration

The streaming endpoint uses the full FAANG-quality AI chat system:
- ✅ Long-term conversation memory with semantic search
- ✅ Conversation summarization for efficient context loading
- ✅ Knowledge graph integration for related entities
- ✅ Smart token budget management (~6000 tokens)
- ✅ Temporal decay for memory relevance

### Real-Time Experience

- Tokens are streamed as they arrive from Claude API
- No buffering - immediate display of each chunk
- Progress indication for long responses
- Graceful error handling with user feedback

### Backward Compatibility

The original `/messages` endpoint remains available:
- `POST /api/v1/staff/{staff_id}/messages` - Async webhook-based (original)
- `POST /api/v1/staff/{staff_id}/messages/stream` - Real-time streaming (new)

Choose based on your use case:
- Use **streaming** for interactive chat UIs
- Use **webhook** for background/async processing

## Technical Details

### SSE Stream Format

```
data: {"type": "token", "content": "Hello"}

data: {"type": "token", "content": " there"}

data: {"type": "token", "content": "!"}

data: {"type": "done", "message_id": "uuid-here"}

```

Each event is a separate `data:` line followed by two newlines.

### Headers

The streaming response includes these headers:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `X-Accel-Buffering: no` (disables nginx buffering)

### Timeouts

- Default timeout: 120 seconds
- Adjust based on expected response length
- Client should handle timeout gracefully

### Error Handling

The stream can fail at various points:
1. **Staff not found** (404) - before streaming starts
2. **Server error** (500) - before streaming starts
3. **Stream error** - during streaming (sent as error event)

Always handle all three cases in your client code.

## Performance

### Latency
- First token: ~300-500ms (includes context building)
- Subsequent tokens: ~50-100ms each
- Total time: Similar to complete response but feels faster due to progressive display

### Memory Usage
- Minimal buffering on server side
- Client accumulates full response in memory
- Memory extraction triggered every 10 messages

### Database Operations
- User message saved immediately (before streaming)
- Assistant message saved after streaming completes
- Memory extraction runs async (doesn't block response)

## Migration Guide

### From Webhook to Streaming

**Before (Webhook):**
```typescript
// Send message
await fetch(`/api/v1/staff/${staffId}/messages`, {
  method: 'POST',
  body: JSON.stringify({ content }),
});

// Poll for response
const interval = setInterval(async () => {
  const messages = await fetchMessages(staffId);
  const latest = messages[0];
  if (latest.message_type === 'assistant') {
    displayMessage(latest.content);
    clearInterval(interval);
  }
}, 1000);
```

**After (Streaming):**
```typescript
// Send and receive in real-time
await sendStreamingMessage(staffId, content);
// Response displayed progressively via SSE
```

### Gradual Migration

1. **Phase 1**: Add streaming support alongside webhook
2. **Phase 2**: A/B test with subset of users
3. **Phase 3**: Default to streaming for new conversations
4. **Phase 4**: Optional - deprecate webhook endpoint

## Frontend Integration

The final step (Phase 7) will add React hooks for easy frontend integration:

```typescript
const { sendMessage, isStreaming, error } = useStaffStreaming(staffId);

// Hook handles all SSE complexity
await sendMessage("Hello!");
```

See `UPDATE_FRONTEND_GUIDE.md` (coming next) for full frontend integration.

## Troubleshooting

### Stream stops unexpectedly
- Check network connection
- Verify timeout settings
- Check server logs for errors

### Tokens not arriving in real-time
- Verify `X-Accel-Buffering: no` header
- Check for proxy/load balancer buffering
- Test with curl to isolate client issues

### High latency on first token
- Normal - includes context building, memory retrieval, knowledge graph search
- ~300-500ms expected for first token
- Subsequent tokens should be faster

### Memory extraction not triggering
- Requires ANTHROPIC_API_KEY environment variable
- Triggers every 10 messages
- Check logs for extraction errors
- Runs async - doesn't block response

## Next Steps

1. **Frontend Integration** (Phase 7): Add React hooks and UI components
2. **Testing**: Write integration tests for streaming
3. **Monitoring**: Add metrics for stream latency and errors
4. **Documentation**: Update API docs with streaming examples
