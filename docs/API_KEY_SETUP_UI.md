---
doc_type: other
project_name: Turbo Code Platform
title: Setting Up Your Anthropic API Key via UI
version: '1.0'
---

# Setting Up Your Anthropic API Key via UI

✅ **STATUS: FULLY FUNCTIONAL**

You can now configure your Anthropic API key directly through the Turbo Settings interface!

## Steps to Add Your API Key

### 1. Navigate to Settings

Open your browser and go to:
```
http://localhost:3001/settings
```

### 2. Get Your API Key

1. Go to https://console.anthropic.com/
2. Sign in (or create an account if you don't have one)
3. Navigate to "API Keys" in the dashboard
4. Click "Create Key" or copy an existing key
5. Your key will look like: `sk-ant-api03-xxxxxxxxxxxxx...`

### 3. Enter Your API Key in Settings

1. In the **Anthropic API Key** section, you'll see:
   - A yellow warning if no key is configured
   - An input field for your API key

2. Paste your API key into the input field

3. Click the **"Save"** button

4. You should see a success toast notification

### 4. Verify It Worked

After saving, the page will show:
- ✅ **API Key Configured** badge in green
- The masked version of your key (e.g., `sk-ant-...xyz`)
- **Service Status** showing "Authenticated: ✅"

## Using the AI Subagents

Once your API key is configured, you can use AI assistants throughout Turbo:

### Issue Page
1. Navigate to any issue detail page
2. Click the **"AI Assist"** button (sparkle icon ✨)
3. Select "issue-triager" agent
4. Ask: "Analyze this issue and suggest priority and tags"

### Project Page
1. Go to a project detail page
2. Click **"AI Assist"**
3. Select "project-manager"
4. Ask: "Generate a health report for this project"

### Documents Page
1. Open any document
2. Click **"AI Assist"** in the document viewer
3. Select "doc-curator"
4. Ask: "Review this document and suggest improvements"

### Discoveries Page
1. Go to the Discoveries page
2. Click **"AI Assist"** in the toolbar
3. Select "discovery-guide"
4. Ask: "Help me analyze my research topics"

## Backend Selection

The Settings page also lets you choose your backend:

### API Backend (Default)
- **Cost**: ~$0.045 per request
- **Best for**: Low volume usage (<450 requests/month)
- **Setup**: Just add API key (no CLI needed)

### Claude Code CLI Backend
- **Cost**: $20/month flat rate (included with Claude Pro)
- **Best for**: High volume usage (>450 requests/month)
- **Setup**: Requires Claude Pro subscription + CLI installation

## Security Notes

- **Storage**: API keys are stored in the database (consider encrypting in production)
- **Masking**: Keys are masked in the UI (only first 10 and last 4 characters shown)
- **Environment**: You can still use `.env` file if preferred (will show as "environment" source)

## Troubleshooting

### "API key must start with 'sk-ant-'"

Make sure you copied the entire key from the Anthropic console, including the `sk-ant-` prefix.

### Key saved but service still shows "Not Authenticated"

1. Wait 5-10 seconds for the service to reload
2. Refresh the Settings page
3. Check the "Service Status" section

### Can't save API key

1. Make sure you're using a valid Anthropic API key
2. Check browser console for errors
3. Verify the API container is running: `docker ps | grep turbo-api`

## Alternative: Manual .env Setup

If you prefer, you can still manually edit the `.env` file:

```bash
# Add this line to .env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Restart the Claude service
docker-compose restart claude-code
```

The Settings UI will detect the environment variable and show it as configured.

---

**Need Help?**
- View logs: `docker logs turbo-claude-code`
- Check API status: `curl http://localhost:9000/health`
- Test subagent: Use the "AI Assist" button on any integrated page

---

## Recent Fixes (2025-10-17)

### Fixed: SQLAlchemy Model Error
**Issue**: Settings endpoints were returning 500 errors due to incorrect model inheritance.

**Root Cause**: The `Setting` model was inheriting from `BaseModel` (SQLAlchemy 2.0 style) instead of `Base` (SQLAlchemy 1.x style), causing SQLAlchemy to not recognize it as a mapped class.

**Fix**: Changed `turbo/core/models/settings.py`:
```python
# Before (broken)
from turbo.core.models.base import BaseModel
class Setting(BaseModel):
    key: Mapped[str] = mapped_column(...)

# After (fixed)
from turbo.core.database.base import Base
class Setting(Base):
    key = Column(String(255), unique=True, nullable=False, index=True)
```

### Fixed: API Key Creation Error
**Issue**: PUT endpoint returned 404 when trying to save API key for the first time.

**Root Cause**: The endpoint used `update_setting_value()` which only updates existing settings, not creates new ones.

**Fix**: Changed to use `get_or_create_setting()` which creates the setting if it doesn't exist:
```python
# Get or create the setting, then update it
setting = await get_or_create_setting(
    db=db,
    key="anthropic_api_key",
    default_value={"api_key": api_key},
    category="claude",
    description="Anthropic API key for Claude AI"
)
```

### Fixed: API Key Exposure in Response
**Issue**: GET endpoint was returning the full API key in the `configured` field instead of a boolean.

**Root Cause**: `setting.value.get("api_key")` returns the key string (truthy) instead of a boolean.

**Fix**: Added explicit `bool()` conversion:
```python
# Before
db_configured = setting is not None and setting.value.get("api_key")

# After
db_configured = setting is not None and bool(setting.value.get("api_key"))
```

### All Fixed Endpoints
✅ `GET /api/v1/settings/claude/backend` - Returns backend configuration
✅ `PUT /api/v1/settings/claude/backend` - Updates backend selection
✅ `GET /api/v1/settings/claude/api-key` - Returns masked API key status
✅ `PUT /api/v1/settings/claude/api-key` - Saves/updates API key
✅ `GET /api/v1/settings/claude/status` - Returns Claude service status
